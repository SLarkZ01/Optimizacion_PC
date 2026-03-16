// API Route: Webhook de Cal.com
// POST /api/webhooks/calcom
// Cal.com llama a este endpoint cuando se crea, reagenda o cancela un agendamiento.
// Flujo BOOKING_CREATED:    Cal.com → insert en bookings → email con instrucciones RustDesk
// Flujo BOOKING_RESCHEDULED: Cal.com → update scheduled_date en bookings
// Flujo BOOKING_CANCELLED:   Cal.com → update status = 'cancelled' en bookings

import { after, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendBookingConfirmationEmail } from "@/lib/email";

// Tipos del payload de Cal.com webhook
// Ref: https://cal.com/docs/core-features/webhooks
interface CalComAttendee {
  name: string;
  email: string;
  timeZone?: string;
}

interface CalComBookingPayload {
  triggerEvent: string; // "BOOKING_CREATED" | "BOOKING_CANCELLED" | "BOOKING_RESCHEDULED" | etc.
  createdAt: string;
  payload: {
    bookingId?: number;
    uid?: string;
    title?: string;
    startTime?: string;        // ISO 8601 — nueva fecha en reagendamientos
    endTime?: string;          // ISO 8601
    rescheduleUid?: string;    // UID del booking original que fue reagendado
    attendees?: CalComAttendee[];
    organizer?: { name: string; email: string };
    metadata?: Record<string, string>;
    status?: string;           // "ACCEPTED" | "PENDING" | "CANCELLED"
    cancellationReason?: string;
    rescheduleReason?: string;
  };
}

/** Verifica la firma HMAC-SHA256 del webhook de Cal.com.
 *  Cal.com calcula: HMAC-SHA256(secret, rawBody) y lo envía en x-cal-signature-256.
 *  Ref: https://cal.com/docs/core-features/webhooks#verify-the-authenticity-of-the-received-webhook
 */
async function verifyWebhookSignature(request: Request, rawBody: string): Promise<boolean> {
  const webhookSecret = process.env.CALCOM_WEBHOOK_SECRET;
  if (!webhookSecret) return true; // Sin secret configurado, aceptar todo

  const signature =
    request.headers.get("x-cal-signature-256") ||
    request.headers.get("x-webhook-secret");

  if (!signature) {
    console.warn("Cal.com webhook: header de firma ausente");
    return false;
  }

  try {
    // Calcular HMAC-SHA256 del body con el secret
    const encoder = new TextEncoder();
    const keyData = encoder.encode(webhookSecret);
    const bodyData = encoder.encode(rawBody);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, bodyData);

    // Convertir a hex
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Comparación timing-safe: misma longitud y mismo contenido
    const receivedHex = signature.replace(/^sha256=/, ""); // algunos clientes añaden prefijo
    if (receivedHex.length !== expectedSignature.length) {
      // Fallback: comparar también contra el secret en texto plano
      // (algunos planes de Cal.com envían el secret directamente)
      return signature === webhookSecret;
    }

    let mismatch = 0;
    for (let i = 0; i < expectedSignature.length; i++) {
      mismatch |= expectedSignature.charCodeAt(i) ^ receivedHex.charCodeAt(i);
    }
    return mismatch === 0;
  } catch (err) {
    console.error("Cal.com webhook: error al verificar firma:", err);
    return false;
  }
}

/** Extrae el cal_booking_id del payload, priorizando uid sobre bookingId numérico. */
function extractCalBookingId(payload: CalComBookingPayload["payload"]): string | null {
  if (payload.uid) return String(payload.uid);
  if (payload.bookingId) return String(payload.bookingId);
  return null;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // Verificar firma HMAC-SHA256 del webhook
    const isValid = await verifyWebhookSignature(request, rawBody);
    if (!isValid) {
      console.warn("Cal.com webhook: firma inválida o ausente");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: CalComBookingPayload;
    try {
      body = JSON.parse(rawBody) as CalComBookingPayload;
    } catch {
      console.error("Cal.com webhook: body no es JSON válido");
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    const { triggerEvent, payload } = body;

    console.log(`Cal.com webhook recibido: ${triggerEvent}`, {
      uid: payload.uid,
      bookingId: payload.bookingId,
      email: payload.attendees?.[0]?.email,
      startTime: payload.startTime,
    });

    // ─── BOOKING_CREATED ────────────────────────────────────────────────────
    if (triggerEvent === "BOOKING_CREATED") {
      return await handleBookingCreated(payload);
    }

    // ─── BOOKING_RESCHEDULED ────────────────────────────────────────────────
    if (triggerEvent === "BOOKING_RESCHEDULED") {
      return await handleBookingRescheduled(payload);
    }

    // ─── BOOKING_CANCELLED ──────────────────────────────────────────────────
    if (triggerEvent === "BOOKING_CANCELLED") {
      return await handleBookingCancelled(payload);
    }

    // Cualquier otro evento (BOOKING_PAYMENT_INITIATED, etc.) — ignorar sin error
    console.log(`Cal.com webhook: evento "${triggerEvent}" no requiere acción`);
    return NextResponse.json({ received: true, processed: false });
  } catch (error) {
    console.error("Cal.com webhook: error inesperado:", error);
    // Retornar 200 para evitar reintentos de Cal.com ante errores de parsing, etc.
    return NextResponse.json({ received: true, processed: false, error: "internal_error" });
  }
}

// ============================================================
// Handlers por tipo de evento
// ============================================================

async function handleBookingCreated(
  payload: CalComBookingPayload["payload"],
): Promise<NextResponse> {
  const attendee = payload.attendees?.[0];
  const email = attendee?.email;
  const name = attendee?.name || null;
  const scheduledDate = payload.startTime || null;
  const calBookingId = extractCalBookingId(payload);

  if (!email) {
    console.warn("Cal.com BOOKING_CREATED: no se recibió email del asistente");
    return NextResponse.json({ received: true, processed: false, reason: "no_email" });
  }

  const supabase = createAdminClient();

  // Buscar purchase_id — puede ser null si el cliente no ha comprado o el pago no procesó aún
  const purchaseId = await findLatestCompletedPurchase(supabase, email);

  if (!purchaseId) {
    console.warn(
      `Cal.com BOOKING_CREATED: no se encontró purchase activa para ${email}. ` +
      `El booking se guardará con purchase_id = null.`,
    );
  }

  // Siempre guardar el booking, purchase_id puede ser null (columna nullable desde migración)
  const { error: bookingError } = await supabase.from("bookings").insert({
    purchase_id: purchaseId, // null si no hay compra asociada
    cal_booking_id: calBookingId,
    scheduled_date: scheduledDate,
    status: "scheduled",
    notes: payload.title || null,
  });

  if (bookingError) {
    if (bookingError.code === "23505") {
      console.log(`Cal.com BOOKING_CREATED: booking ${calBookingId} ya existe, omitiendo inserción`);
    } else {
      console.error("Cal.com BOOKING_CREATED: error guardando booking:", bookingError);
      return NextResponse.json({ received: true, processed: false, error: "db_error" });
    }
  } else {
    console.log(
      `Cal.com BOOKING_CREATED: booking guardado — ` +
      `cal_id: ${calBookingId}, cliente: ${email}, fecha: ${scheduledDate}, purchase_id: ${purchaseId ?? "null"}`,
    );
  }

  // Enviar email con instrucciones de RustDesk — no bloquea la respuesta (server-after-nonblocking)
  after(() => sendBookingConfirmationEmail({ toEmail: email, customerName: name, scheduledDate, calBookingId }));

  return NextResponse.json({ received: true, processed: true });
}

async function handleBookingRescheduled(
  payload: CalComBookingPayload["payload"],
): Promise<NextResponse> {
  // En un reagendamiento Cal.com crea un NUEVO booking con uid nuevo
  // y el booking original queda referenciado en rescheduleUid.
  // Actualizamos el booking original con la nueva fecha y lo marcamos como agendado.
  const originalUid = payload.rescheduleUid;
  const newUid = extractCalBookingId(payload);
  const newDate = payload.startTime || null;
  const attendee = payload.attendees?.[0];
  const email = attendee?.email;

  if (!originalUid && !newUid) {
    console.warn("Cal.com BOOKING_RESCHEDULED: no se pudo identificar el booking");
    return NextResponse.json({ received: true, processed: false, reason: "no_booking_id" });
  }

  const supabase = createAdminClient();

  // Intentar actualizar por rescheduleUid (booking original) primero.
  // Si no existe, buscar por el nuevo uid (puede haber llegado el evento del nuevo booking antes).
  const lookupId = originalUid ?? newUid!;
  const { data: existing, error: fetchError } = await supabase
    .from("bookings")
    .select("id")
    .eq("cal_booking_id", lookupId)
    .maybeSingle();

  if (fetchError) {
    console.error("Cal.com BOOKING_RESCHEDULED: error buscando booking:", fetchError);
    return NextResponse.json({ received: true, processed: false, error: "db_error" });
  }

  if (!existing) {
    // El booking original no existe en nuestra DB (p.ej. fue creado antes de implementar esto).
    // Intentar insertarlo como BOOKING_CREATED para no perder el dato.
    console.warn(
      `Cal.com BOOKING_RESCHEDULED: booking ${lookupId} no encontrado en DB, intentando insertar como nuevo`,
    );
    return await handleBookingCreated(payload);
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      scheduled_date: newDate,
      status: "scheduled",
      cal_booking_id: newUid ?? existing.id, // Actualizar al nuevo UID de Cal.com
      notes: payload.title || null,
    })
    .eq("id", existing.id);

  if (updateError) {
    console.error("Cal.com BOOKING_RESCHEDULED: error actualizando booking:", updateError);
    return NextResponse.json({ received: true, processed: false, error: "db_error" });
  }

  console.log(
    `Cal.com BOOKING_RESCHEDULED: booking actualizado — ` +
    `original_uid: ${originalUid}, nueva_fecha: ${newDate}, cliente: ${email ?? "desconocido"}`,
  );

  return NextResponse.json({ received: true, processed: true });
}

async function handleBookingCancelled(
  payload: CalComBookingPayload["payload"],
): Promise<NextResponse> {
  const calBookingId = extractCalBookingId(payload);
  const attendee = payload.attendees?.[0];
  const email = attendee?.email ?? "desconocido";

  if (!calBookingId) {
    console.warn("Cal.com BOOKING_CANCELLED: no se pudo identificar el booking");
    return NextResponse.json({ received: true, processed: false, reason: "no_booking_id" });
  }

  const supabase = createAdminClient();

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("cal_booking_id", calBookingId);

  if (updateError) {
    console.error("Cal.com BOOKING_CANCELLED: error actualizando booking:", updateError);
    return NextResponse.json({ received: true, processed: false, error: "db_error" });
  }

  console.log(
    `Cal.com BOOKING_CANCELLED: booking marcado como cancelado — cal_id: ${calBookingId}, cliente: ${email}`,
  );

  return NextResponse.json({ received: true, processed: true });
}

// ============================================================
// Utilidades
// ============================================================

/** Busca la compra completada más reciente del cliente por email.
 *  Una sola query con JOIN — evita el waterfall de 2 queries secuenciales (async-parallel).
 */
async function findLatestCompletedPurchase(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  email: string,
): Promise<string | null> {
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, customers!inner(email)")
    .eq("customers.email", email)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return purchase?.id ?? null;
}
