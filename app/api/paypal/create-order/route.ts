// API Route: Crear orden de PayPal
// POST /api/paypal/create-order
// Recibe { planId, region } y retorna el orderID de PayPal

import { NextResponse } from "next/server";
import {
  getPayPalAccessToken,
  getPayPalApiBase,
  getPrice,
  PLAN_NAMES,
  type PricingRegion,
} from "@/lib/paypal";
import type { PlanId } from "@/lib/types";

// Planes y regiones válidos para validación
const VALID_PLANS: PlanId[] = ["basic", "gamer", "premium"];
const VALID_REGIONS: PricingRegion[] = ["latam", "international"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, region } = body as {
      planId: PlanId;
      region: PricingRegion;
    };

    // Validar parámetros requeridos
    if (!planId || !region) {
      return NextResponse.json(
        { error: "Se requiere planId y region" },
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

    // Validar que la región sea válida
    if (!VALID_REGIONS.includes(region)) {
      return NextResponse.json(
        { error: `Región inválida: ${region}. Regiones válidas: ${VALID_REGIONS.join(", ")}` },
        { status: 400 }
      );
    }

    // Obtener precio y nombre del plan
    const price = getPrice(planId, region);
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
            // Metadata personalizada para identificar el plan después del pago
            custom_id: JSON.stringify({ plan_id: planId, region }),
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
