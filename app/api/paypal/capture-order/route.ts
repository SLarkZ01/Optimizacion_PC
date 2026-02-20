// API Route: Capturar pago de PayPal
// POST /api/paypal/capture-order
// Recibe { orderID } y captura el pago, luego guarda en Supabase

import { NextResponse } from "next/server";
import { getPayPalAccessToken, getPayPalApiBase, getBaseUrl } from "@/lib/paypal";
import { createAdminClient } from "@/lib/supabase";
import { sendPaymentConfirmationEmail } from "@/lib/email";
import type { PlanType } from "@/lib/database.types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderID } = body as { orderID: string };

    if (!orderID) {
      return NextResponse.json(
        { error: "Se requiere orderID" },
        { status: 400 }
      );
    }

    // Obtener access token de PayPal
    const accessToken = await getPayPalAccessToken();

    // Capturar el pago en PayPal
    const captureResponse = await fetch(
      `${getPayPalApiBase()}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json();
      console.error("Error capturando pago de PayPal:", errorData);
      return NextResponse.json(
        { error: "No se pudo capturar el pago de PayPal" },
        { status: 500 }
      );
    }

    const captureData = await captureResponse.json();

    // Verificar que el pago fue completado
    if (captureData.status !== "COMPLETED") {
      console.error(`PayPal captura no completada. Status: ${captureData.status}`);
      return NextResponse.json(
        { error: `Pago no completado. Estado: ${captureData.status}` },
        { status: 400 }
      );
    }

    // Extraer datos del pago
    const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const payer = captureData.payer;
    const customId = captureData.purchase_units?.[0]?.custom_id;

    // Parsear metadata del plan
    let planId: PlanType = "basic";
    let region = "latam";
    try {
      if (customId) {
        const metadata = JSON.parse(customId);
        planId = metadata.plan_id || "basic";
        region = metadata.region || "latam";
      }
    } catch {
      console.warn("No se pudo parsear custom_id de PayPal:", customId);
    }

    // Validar que el plan es uno de los planes activos (por si llega un valor legacy de DB)
    const activePlanId = (planId === "gamer" ? "gamer" : "basic") as import("@/lib/types").PlanId;

    const email = payer?.email_address;
    const name = payer?.name
      ? `${payer.name.given_name || ""} ${payer.name.surname || ""}`.trim()
      : null;
    const captureId = capture?.id || null;
    const amount = parseFloat(capture?.amount?.value || "0");

    // Guardar en Supabase
    const supabase = createAdminClient();

    // 1. Buscar o crear customer
    let customerId: string;

    if (email) {
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", email)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        console.log(`PayPal Capture: Cliente existente encontrado: ${customerId}`);
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            email,
            name: name || null,
            phone: null,
          })
          .select("id")
          .single();

        if (customerError || !newCustomer) {
          console.error("PayPal Capture: Error creando customer:", customerError);
          // No fallar la captura por error de DB — el pago ya fue cobrado
          return NextResponse.json({
            success: true,
            orderID,
            redirectUrl: `${getBaseUrl()}/exito?order_id=${orderID}`,
            warning: "Pago capturado pero hubo un error guardando el registro",
          });
        }

        customerId = newCustomer.id;
        console.log(`PayPal Capture: Nuevo cliente creado: ${customerId}`);
      }

      // 2. Crear registro de compra
      const { error: purchaseError } = await supabase.from("purchases").insert({
        customer_id: customerId,
        paypal_order_id: orderID,
        paypal_capture_id: captureId,
        plan_type: planId,
        amount,
        currency: "USD",
        status: "completed",
      });

      if (purchaseError) {
        console.error("PayPal Capture: Error creando purchase:", purchaseError);
        // No fallar — el pago ya fue cobrado
      } else {
        console.log(
          `PayPal Capture: Compra registrada - Plan: ${planId} (${region}), Email: ${email}, Monto: $${amount} USD`
        );
      }

      // Enviar email de confirmación via Resend (no bloquea si falla)
      await sendPaymentConfirmationEmail({
        toEmail: email,
        customerName: name,
        planId: activePlanId,
        amount,
        orderId: orderID,
      });
    } else {
      console.warn("PayPal Capture: No se recibió email del pagador");
    }

    return NextResponse.json({
      success: true,
      orderID,
      redirectUrl: `${getBaseUrl()}/exito?order_id=${orderID}`,
    });
  } catch (error) {
    console.error("Error capturando orden de PayPal:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
