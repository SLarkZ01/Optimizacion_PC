// API Route: Webhook de PayPal
// POST /api/webhooks/paypal
// Recibe eventos de PayPal, verifica la firma y procesa pagos completados
// Este webhook es una red de seguridad para pagos que no se capturaron en el frontend

import { NextResponse } from "next/server";
import { getPayPalAccessToken, getPayPalApiBase } from "@/lib/paypal";
import { createAdminClient } from "@/lib/supabase";
import type { PlanType } from "@/lib/database.types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    // Verificar firma del webhook con PayPal
    const isValid = await verifyWebhookSignature(body, headers);
    if (!isValid) {
      console.error("Webhook PayPal: Verificación de firma falló");
      return NextResponse.json(
        { error: "Firma de webhook inválida" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    console.log(`Webhook PayPal: Evento recibido: ${event.event_type}`);

    // Procesar según el tipo de evento
    switch (event.event_type) {
      case "CHECKOUT.ORDER.APPROVED":
      case "PAYMENT.CAPTURE.COMPLETED": {
        await handlePaymentCompleted(event);
        break;
      }

      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.REFUNDED": {
        await handlePaymentStatusChange(event);
        break;
      }

      default:
        console.log(`Webhook PayPal: Evento no manejado: ${event.event_type}`);
    }

    // Siempre responder 200 para confirmar recepción a PayPal
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook PayPal: Error procesando evento:", error);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}

// ============================================================
// Verificar firma del webhook usando la API de PayPal
// ============================================================
async function verifyWebhookSignature(
  body: string,
  headers: Record<string, string>
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error("Webhook PayPal: PAYPAL_WEBHOOK_ID no configurado");
    return false;
  }

  try {
    const accessToken = await getPayPalAccessToken();

    const verifyResponse = await fetch(
      `${getPayPalApiBase()}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          auth_algo: headers["paypal-auth-algo"],
          cert_url: headers["paypal-cert-url"],
          transmission_id: headers["paypal-transmission-id"],
          transmission_sig: headers["paypal-transmission-sig"],
          transmission_time: headers["paypal-transmission-time"],
          webhook_id: webhookId,
          webhook_event: JSON.parse(body),
        }),
      }
    );

    if (!verifyResponse.ok) {
      console.error("Webhook PayPal: Error verificando firma:", await verifyResponse.text());
      return false;
    }

    const result = await verifyResponse.json();
    return result.verification_status === "SUCCESS";
  } catch (error) {
    console.error("Webhook PayPal: Excepción verificando firma:", error);
    return false;
  }
}

// ============================================================
// Manejar pago completado (red de seguridad)
// ============================================================
async function handlePaymentCompleted(event: Record<string, unknown>) {
  const resource = event.resource as Record<string, unknown>;
  if (!resource) return;

  // Para PAYMENT.CAPTURE.COMPLETED, el resource es la captura directamente
  // Para CHECKOUT.ORDER.APPROVED, necesitamos obtener los datos de la orden
  const isCapture = event.event_type === "PAYMENT.CAPTURE.COMPLETED";

  let orderId: string | undefined;
  let captureId: string | undefined;
  let amount = 0;
  let customId: string | undefined;

  if (isCapture) {
    captureId = resource.id as string;
    amount = parseFloat((resource.amount as Record<string, string>)?.value || "0");
    customId = resource.custom_id as string;

    // Extraer order ID del supplementary_data o links
    const supplementaryData = resource.supplementary_data as Record<string, unknown> | undefined;
    const relatedIds = supplementaryData?.related_ids as Record<string, string> | undefined;
    orderId = relatedIds?.order_id;
  } else {
    orderId = resource.id as string;
    const purchaseUnits = resource.purchase_units as Array<Record<string, unknown>> | undefined;
    customId = purchaseUnits?.[0]?.custom_id as string;
  }

  if (!orderId) {
    console.warn("Webhook PayPal: No se pudo extraer order ID del evento");
    return;
  }

  const supabase = createAdminClient();

  // Verificar si ya existe un registro para esta orden (evitar duplicados)
  const { data: existingPurchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("paypal_order_id", orderId)
    .single();

  if (existingPurchase) {
    console.log(`Webhook PayPal: Orden ${orderId} ya registrada, actualizando capture_id`);
    // Actualizar capture_id si no existía
    if (captureId) {
      await supabase
        .from("purchases")
        .update({ paypal_capture_id: captureId, status: "completed" })
        .eq("paypal_order_id", orderId);
    }
    return;
  }

  // Si no existe, crear el registro (esto es la red de seguridad)
  let planId: PlanType = "basic";
  try {
    if (customId) {
      const metadata = JSON.parse(customId);
      planId = metadata.plan_id || "basic";
    }
  } catch {
    console.warn("Webhook PayPal: No se pudo parsear custom_id:", customId);
  }

  // Para webhooks no tenemos el email del payer fácilmente,
  // logueamos la situación para revisión manual
  console.warn(
    `Webhook PayPal: Orden ${orderId} no encontrada en DB. ` +
    `Esto indica que la captura del frontend falló. ` +
    `Plan: ${planId}, Monto: $${amount} USD. Requiere revisión manual.`
  );
}

// ============================================================
// Manejar cambios de estado del pago (denegado, reembolsado)
// ============================================================
async function handlePaymentStatusChange(event: Record<string, unknown>) {
  const resource = event.resource as Record<string, unknown>;
  if (!resource) return;

  const captureId = resource.id as string;
  if (!captureId) return;

  const supabase = createAdminClient();

  const newStatus = event.event_type === "PAYMENT.CAPTURE.REFUNDED" ? "refunded" : "failed";

  const { error } = await supabase
    .from("purchases")
    .update({ status: newStatus })
    .eq("paypal_capture_id", captureId);

  if (error) {
    console.error(`Webhook PayPal: Error actualizando estado a ${newStatus}:`, error);
  } else {
    console.log(`Webhook PayPal: Captura ${captureId} actualizada a ${newStatus}`);
  }
}
