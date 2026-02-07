// Configuración de Stripe para PCOptimize
// Cliente del servidor y mapa de Price IDs por plan y moneda

import Stripe from "stripe";
import type { PlanId } from "@/lib/types";
import type { CurrencyCode } from "@/lib/constants";

// ============================================================
// Cliente Stripe (solo servidor)
// ============================================================
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Usar la versión más reciente de la API
  typescript: true,
});

// ============================================================
// Mapa de Price IDs de Stripe
// ============================================================
// Cada plan tiene un precio en cada moneda, creado en el Dashboard de Stripe.
// IMPORTANTE: Reemplazar estos placeholders con los Price IDs reales
// después de crear los productos en Stripe Dashboard (Tarea 13).
//
// Para crear los productos:
// 1. Ir a https://dashboard.stripe.com/products
// 2. Crear 3 productos: Básico, Gamer, Premium
// 3. Cada producto debe tener 7 precios (uno por moneda)
// 4. Copiar cada Price ID (price_xxx) y reemplazar aquí
// ============================================================

export const STRIPE_PRICE_IDS: Record<PlanId, Record<CurrencyCode, string>> = {
  basic: {
    USD: "price_PLACEHOLDER_basic_usd",
    COP: "price_PLACEHOLDER_basic_cop",
    MXN: "price_PLACEHOLDER_basic_mxn",
    ARS: "price_PLACEHOLDER_basic_ars",
    CLP: "price_PLACEHOLDER_basic_clp",
    PEN: "price_PLACEHOLDER_basic_pen",
    EUR: "price_PLACEHOLDER_basic_eur",
  },
  gamer: {
    USD: "price_PLACEHOLDER_gamer_usd",
    COP: "price_PLACEHOLDER_gamer_cop",
    MXN: "price_PLACEHOLDER_gamer_mxn",
    ARS: "price_PLACEHOLDER_gamer_ars",
    CLP: "price_PLACEHOLDER_gamer_clp",
    PEN: "price_PLACEHOLDER_gamer_pen",
    EUR: "price_PLACEHOLDER_gamer_eur",
  },
  premium: {
    USD: "price_PLACEHOLDER_premium_usd",
    COP: "price_PLACEHOLDER_premium_cop",
    MXN: "price_PLACEHOLDER_premium_mxn",
    ARS: "price_PLACEHOLDER_premium_ars",
    CLP: "price_PLACEHOLDER_premium_clp",
    PEN: "price_PLACEHOLDER_premium_pen",
    EUR: "price_PLACEHOLDER_premium_eur",
  },
};

// ============================================================
// Helpers
// ============================================================

/**
 * Obtiene el Price ID de Stripe para un plan y moneda específicos.
 * Lanza error si la combinación no existe.
 */
export function getStripePriceId(planId: PlanId, currencyCode: CurrencyCode): string {
  const priceId = STRIPE_PRICE_IDS[planId]?.[currencyCode];
  if (!priceId) {
    throw new Error(`Price ID no encontrado para plan "${planId}" y moneda "${currencyCode}"`);
  }
  return priceId;
}

/**
 * Genera la URL base del sitio para redirecciones de Stripe.
 * En producción usa NEXT_PUBLIC_APP_URL, en desarrollo usa localhost.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // Fallback para desarrollo local
  return "http://localhost:3000";
}
