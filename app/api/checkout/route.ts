// API Route: Crear sesión de Stripe Checkout
// POST /api/checkout
// Recibe { planId, currencyCode } y retorna la URL de checkout

import { NextResponse } from "next/server";
import { stripe, getStripePriceId, getBaseUrl } from "@/lib/stripe";
import type { PlanId } from "@/lib/types";
import type { CurrencyCode } from "@/lib/constants";

// Planes válidos para validación
const VALID_PLANS: PlanId[] = ["basic", "gamer", "premium"];
const VALID_CURRENCIES: CurrencyCode[] = ["USD", "COP", "MXN", "ARS", "CLP", "PEN", "EUR"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, currencyCode } = body as {
      planId: PlanId;
      currencyCode: CurrencyCode;
    };

    // Validar parámetros requeridos
    if (!planId || !currencyCode) {
      return NextResponse.json(
        { error: "Se requiere planId y currencyCode" },
        { status: 400 }
      );
    }

    // Validar que el plan sea válido
    if (!VALID_PLANS.includes(planId)) {
      return NextResponse.json(
        { error: `Plan inválido: ${planId}. Planes válidos: ${VALID_PLANS.join(", ")}` },
        { status: 400 }
      );
    }

    // Validar que la moneda sea válida
    if (!VALID_CURRENCIES.includes(currencyCode)) {
      return NextResponse.json(
        { error: `Moneda inválida: ${currencyCode}. Monedas válidas: ${VALID_CURRENCIES.join(", ")}` },
        { status: 400 }
      );
    }

    // Obtener el Price ID correspondiente
    const priceId = getStripePriceId(planId, currencyCode);

    // Verificar que no sea un placeholder
    if (priceId.includes("PLACEHOLDER")) {
      return NextResponse.json(
        { error: "Los productos de Stripe aún no han sido configurados. Contacta al administrador." },
        { status: 503 }
      );
    }

    const baseUrl = getBaseUrl();

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#precios`,
      // Recopilar email del cliente (necesario para crear customer en Supabase)
      customer_email: undefined,
      billing_address_collection: "auto",
      // Metadata para el webhook: identifica plan y moneda
      metadata: {
        plan_id: planId,
        currency_code: currencyCode,
      },
    });

    // Retornar la URL de checkout para redirección del cliente
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creando sesión de checkout:", error);

    // Distinguir errores de Stripe de otros errores
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
