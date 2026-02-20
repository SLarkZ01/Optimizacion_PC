// Configuración de PayPal para PCOptimize
// Precios fijos en USD, helpers para autenticación y creación de órdenes

import type { PlanId } from "@/lib/types";

// ============================================================
// Configuración del entorno
// ============================================================

const PAYPAL_API_BASE = process.env.NODE_ENV === "production"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

// ============================================================
// Tipo de región para diferenciación de precios
// ============================================================

export type PricingRegion = "latam" | "international";

// ============================================================
// Mapa de precios fijos en USD
// ============================================================
// Cada plan tiene un precio diferenciado por región:
// - Latam: Colombia, México, Argentina, Chile, Perú
// - Internacional: USA, Europa, resto del mundo
//
// Fuente: Notion "08 - Precios y Productos"
// ============================================================

export const PAYPAL_PRICES: Record<PlanId, Record<PricingRegion, number>> = {
  basic: {
    latam: 19,
    international: 30,
  },
  gamer: {
    latam: 32,
    international: 45,
  },
};

// ============================================================
// Nombres de producto para la descripción de la orden PayPal
// ============================================================

export const PLAN_NAMES: Record<PlanId, string> = {
  basic: "PCOptimize - Plan Básico",
  gamer: "PCOptimize - Plan Gamer",
};

// ============================================================
// Helpers
// ============================================================

/**
 * Obtiene el precio en USD para un plan y región específicos.
 */
export function getPrice(planId: PlanId, region: PricingRegion): number {
  const price = PAYPAL_PRICES[planId]?.[region];
  if (!price) {
    throw new Error(`Precio no encontrado para plan "${planId}" y región "${region}"`);
  }
  return price;
}

/**
 * Genera la URL base del sitio para redirecciones.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return "http://localhost:3000";
}

/**
 * Obtiene un access token de PayPal usando Client Credentials (OAuth 2.0).
 * El SDK de servidor no se usa; llamamos directamente al REST API.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Faltan credenciales de PayPal (NEXT_PUBLIC_PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET)");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error obteniendo access token de PayPal: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Retorna la URL base de la API de PayPal según el entorno.
 */
export function getPayPalApiBase(): string {
  return PAYPAL_API_BASE;
}
