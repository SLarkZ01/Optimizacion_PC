// API Route: Webhook de Cal.com
// POST /api/webhooks/calcom
// Cal.com llama a este endpoint cuando se confirma un agendamiento.
// Flujo: Cal.com → este webhook → guarda en bookings → email con instrucciones RustDesk

import { NextResponse } from "next/server";
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
    startTime?: string;   // ISO 8601
    endTime?: string;     // ISO 8601
    attendees?: CalComAttendee[];
    organizer?: { name: string; email: string };
    metadata?: Record<string, string>;
    status?: string;      // "ACCEPTED" | "PENDING" | "CANCELLED"
    cancellationReason?: string;
    rescheduleReason?: string;
  };
}

export async function POST(request: Request) {
  try {
    // Verificar secret del webhook para evitar peticiones no autorizadas
    const webhookSecret = process.env.CALCOM_WEBHOOK_SECRET;
    if (webhookSecret) {
      const headerSecret = request.headers.get("x-cal-signature-256") ||
                           request.headers.get("x-webhook-secret");
      if (!headerSecret || headerSecret !== webhookSecret) {
        console.warn("Cal.com webhook: firma inválida o ausente");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = (await request.json()) as CalComBookingPayload;
    const { triggerEvent, payload } = body;

    console.log(`Cal.com webhook recibido: ${triggerEvent}`);

    // Solo procesar eventos de booking creado
    if (triggerEvent !== "BOOKING_CREATED") {
      // Para BOOKING_CANCELLED o BOOKING_RESCHEDULED se podría actualizar la DB,
      // pero por ahora solo logueamos y devolvemos 200 para no causar reintentos.
      console.log(`Cal.com webhook: evento ${triggerEvent} ignorado (solo procesamos BOOKING_CREATED)`);
      return NextResponse.json({ received: true, processed: false });
    }

    const attendee = payload.attendees?.[0];
    const email = attendee?.email;
    const name = attendee?.name || null;
    const scheduledDate = payload.startTime || null;
    const calBookingId = payload.uid
      ? String(payload.uid)
      : payload.bookingId
        ? String(payload.bookingId)
        : null;

    if (!email) {
      console.warn("Cal.com webhook: no se recibió email del asistente");
      return NextResponse.json({ received: true, processed: false, reason: "no_email" });
    }

    const supabase = createAdminClient();

    // Buscar la purchase más reciente del cliente por email
    // (relacionar Cal.com con la compra en Supabase)
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .single();

    let purchaseId: string | null = null;

    if (customer) {
      const { data: purchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("customer_id", customer.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      purchaseId = purchase?.id ?? null;
    }

    if (!purchaseId) {
      // No encontramos una compra — puede ser una reserva de prueba o un cliente
      // que agendó sin comprar primero. Logueamos pero no fallamos el webhook.
      console.warn(
        `Cal.com webhook: no se encontró purchase activa para ${email}. ` +
        `Se registrará el booking sin purchase_id.`
      );
    }

    // Guardar booking en Supabase
    // Si no hay purchase_id, necesitamos un UUID válido o una columna nullable.
    // En el schema actual purchase_id es NOT NULL, así que solo guardamos si existe.
    if (purchaseId) {
      const { error: bookingError } = await supabase.from("bookings").insert({
        purchase_id: purchaseId,
        cal_booking_id: calBookingId,
        scheduled_date: scheduledDate,
        status: "scheduled",
        notes: payload.title || null,
      });

      if (bookingError) {
        // Duplicate key = ya procesado anteriormente (idempotente)
        if (bookingError.code === "23505") {
          console.log(`Cal.com webhook: booking ${calBookingId} ya existe, omitiendo inserción`);
        } else {
          console.error("Cal.com webhook: error guardando booking:", bookingError);
        }
      } else {
        console.log(
          `Cal.com webhook: booking guardado — cal_id: ${calBookingId}, ` +
          `cliente: ${email}, fecha: ${scheduledDate}`
        );
      }
    }

    // Enviar email con instrucciones de RustDesk (no bloquea si falla)
    await sendBookingConfirmationEmail({
      toEmail: email,
      customerName: name,
      scheduledDate,
      calBookingId,
    });

    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    console.error("Cal.com webhook: error inesperado:", error);
    // Retornar 200 para evitar reintentos de Cal.com ante errores de parsing, etc.
    return NextResponse.json({ received: true, processed: false, error: "internal_error" });
  }
}
