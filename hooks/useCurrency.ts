"use client";

// Hook para resolver región de precios usando detección server-side
// (headers de Vercel). El cliente consulta /api/geo y cachea el resultado
// por 24h en localStorage.

import { useState, useEffect } from "react";
import type { PricingRegion } from "@/lib/integrations/paypal";

// ============================================================
// Constantes
// ============================================================

const CACHE_KEY = "pcoptimize_region";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

// ============================================================
// Tipos
// ============================================================

interface CacheEntry {
  region: PricingRegion;
  countryCode: string;
  timestamp: number;
}

export interface UseRegionResult {
  /** Región de precios PayPal detectada */
  region: PricingRegion;
  /** Código de país ISO detectado (ej: "CO", "US"), si existe */
  countryCode: string;
  /** true mientras se resuelve la región */
  loading: boolean;
}

// ============================================================
// Helpers de caché
// ============================================================

function getCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function setCache(region: PricingRegion, countryCode: string): void {
  try {
    const entry: CacheEntry = { region, countryCode, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage no disponible (modo privado estricto, SSR) — ignorar
  }
}

// ============================================================
// Hook
// ============================================================

/**
 * Detecta automáticamente si el visitante es de Latam o Internacional
 * consultando /api/geo (resuelto en servidor con headers de Vercel).
 *
 * Retorna `region: "latam"` para países de América Latina,
 * `region: "international"` para el resto (USA, Europa, etc.).
 */
export function useRegion(): UseRegionResult {
  // Fallback a "latam" para que un fallo de ipapi.co nunca muestre precios
  // más altos a usuarios latinoamericanos.
  const [region, setRegion] = useState<PricingRegion>("latam");
  const [countryCode, setCountryCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function detectRegion(): Promise<void> {
      // 1. Intentar desde caché primero
      const cached = getCache();
      if (cached) {
        if (!cancelled) {
          setRegion(cached.region);
          setCountryCode(cached.countryCode);
          setLoading(false);
        }
        return;
      }

      // 2. Consultar endpoint interno para resolver geo en servidor
      try {
        const response = await fetch("/api/geo", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) throw new Error(`/api/geo respondió ${response.status}`);

        const data = await response.json() as {
          region?: PricingRegion;
          countryCode?: string | null;
        };

        const detectedRegion: PricingRegion = data.region === "international"
          ? "international"
          : "latam";
        const detectedCountryCode = data.countryCode ?? "";

        if (!cancelled) {
          setRegion(detectedRegion);
          setCountryCode(detectedCountryCode);
          setCache(detectedRegion, detectedCountryCode);
        }
      } catch {
        // Fallback silencioso a latam — precio más bajo por defecto para
        // no perjudicar a usuarios latinoamericanos si falla /api/geo.
        // countryCode vacío para no grabar un país ficticio en la base de datos.
        if (!cancelled) {
          setRegion("latam");
          setCountryCode("");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    detectRegion();

    return () => {
      cancelled = true;
    };
  }, []);

  return { region, countryCode, loading };
}
