// API Route: Webhook de Stripe
// POST /api/webhooks/stripe
// Recibe eventos de Stripe, verifica la firma y procesa pagos completados

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase";
import type { PlanType } from "@/lib/database.types";

// ============================================================
// Desactivar el body parser de Next.js para recibir el raw body
// Stripe requiere el body sin parsear para verificar la firma
// ============================================================
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("Webhook: Falta header stripe-signature");
    return NextResponse.json(
      { error: "Falta header stripe-signature" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Webhook: STRIPE_WEBHOOK_SECRET no configurado");
    return NextResponse.json(
      { error: "Webhook secret no configurado" },
      { status: 500 }
    );
  }

  // Verificar firma del webhook
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error(`Webhook: Verificación de firma falló: ${message}`);
    return NextResponse.json(
      { error: `Firma de webhook inválida: ${message}` },
      { status: 400 }
    );
  }

  // Procesar según el tipo de evento
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await handleCheckoutCompleted(session);
      break;
    }

    default:
      // Eventos no manejados - los ignoramos silenciosamente
      console.log(`Webhook: Evento no manejado: ${event.type}`);
  }

  // Siempre responder 200 para confirmar recepción a Stripe
  return NextResponse.json({ received: true });
}

// ============================================================
// Manejar checkout completado
// ============================================================
async function handleCheckoutCompleted(
  session: import("stripe").Stripe.Checkout.Session
) {
  console.log(`Webhook: Procesando checkout completado: ${session.id}`);

  const supabase = createAdminClient();

  // Extraer datos del checkout
  const email = session.customer_details?.email;
  const name = session.customer_details?.name;
  const planId = session.metadata?.plan_id as PlanType | undefined;
  const currencyCode = session.metadata?.currency_code;

  if (!email) {
    console.error(`Webhook: Checkout ${session.id} sin email del cliente`);
    return;
  }

  if (!planId) {
    console.error(`Webhook: Checkout ${session.id} sin plan_id en metadata`);
    return;
  }

  try {
    // 1. Buscar o crear customer en Supabase
    let customerId: string;

    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      console.log(`Webhook: Cliente existente encontrado: ${customerId}`);
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
        console.error("Webhook: Error creando customer:", customerError);
        return;
      }

      customerId = newCustomer.id;
      console.log(`Webhook: Nuevo cliente creado: ${customerId}`);
    }

    // 2. Crear registro de compra en Supabase
    const { error: purchaseError } = await supabase.from("purchases").insert({
      customer_id: customerId,
      stripe_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null,
      plan_type: planId,
      amount: session.amount_total ? session.amount_total / 100 : 0, // Stripe usa centavos
      currency: currencyCode || session.currency || "usd",
      status: "completed",
    });

    if (purchaseError) {
      console.error("Webhook: Error creando purchase:", purchaseError);
      return;
    }

    console.log(
      `Webhook: Compra registrada exitosamente - Plan: ${planId}, Email: ${email}`
    );
  } catch (error) {
    console.error("Webhook: Error procesando checkout:", error);
  }
}
