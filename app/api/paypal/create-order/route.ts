// API Route: Crear orden de PayPal
// POST /api/paypal/create-order
// Recibe { planId } y retorna el orderID de PayPal

import { NextResponse } from "next/server";
import {
  getPayPalAccessToken,
  getPayPalApiBase,
  getPrice,
  PLAN_NAMES,
} from "@/lib/paypal";
import { resolveGeoFromHeaders } from "@/lib/geo";
import type { PlanId } from "@/lib/types";

// Planes válidos para validación
const VALID_PLANS: PlanId[] = ["basic", "gamer"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId } = body as {
      planId: PlanId;
    };

    // Validar parámetros requeridos
    if (!planId) {
      return NextResponse.json(
        { error: "Se requiere planId" },
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

    // Resolver geo en servidor usando headers de Vercel
    const geo = resolveGeoFromHeaders(request.headers);

    // Obtener precio y nombre del plan
    const price = getPrice(planId, geo.region);
    const planName = PLAN_NAMES[planId];

    // Obtener access token de PayPal
    const accessToken = await getPayPalAccessToken();

    // Crear orden en PayPal Orders API v2
    const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: planName,
            amount: {
              currency_code: "USD",
              value: price.toFixed(2),
            },
            custom_id: JSON.stringify({
              plan_id: planId,
              region: geo.region,
              country_code: geo.countryCode,
              country_source: geo.source,
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error creando orden de PayPal:", errorData);
      return NextResponse.json(
        { error: "No se pudo crear la orden de PayPal" },
        { status: 500 }
      );
    }

    const orderData = await response.json();

    // Retornar el ID de la orden para que el frontend lo use con PayPalButtons
    return NextResponse.json({ orderID: orderData.id });
  } catch (error) {
    console.error("Error creando orden de PayPal:", error);

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
