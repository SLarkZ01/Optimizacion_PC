"use client";

// Hook para detectar automáticamente la región de precios del usuario por IP.
// Solo determina si el visitante es de Latam o Internacional — el cobro es
// siempre en USD, sin conversiones a monedas locales.
//
// API: ipapi.co (HTTPS, gratuita, 1000 req/día)
// Caché: localStorage con TTL de 24h para evitar llamadas repetidas
// Fallback: "international" si la API falla o excede el timeout

import { useState, useEffect } from "react";
import type { PricingRegion } from "@/lib/paypal";

// ============================================================
// Constantes
// ============================================================

const CACHE_KEY = "pcoptimize_region";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas
const DETECT_TIMEOUT_MS = 4000;            // 4 segundos máximo

/** Códigos de país ISO 3166-1 alpha-2 que reciben precio Latam */
const LATAM_COUNTRIES = new Set([
  "CO", // Colombia
  "MX", // México
  "AR", // Argentina
  "CL", // Chile
  "PE", // Perú
  "VE", // Venezuela
  "EC", // Ecuador
  "BO", // Bolivia
  "PY", // Paraguay
  "UY", // Uruguay
  "GT", // Guatemala
  "HN", // Honduras
  "SV", // El Salvador
  "NI", // Nicaragua
  "CR", // Costa Rica
  "PA", // Panamá
  "DO", // República Dominicana
  "CU", // Cuba
  "PR", // Puerto Rico
]);

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
  /** Código de país ISO detectado (ej: "CO", "US") */
  countryCode: string;
  /** true mientras se realiza la detección por IP */
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
 * consultando su IP via ipapi.co.
 *
 * Retorna `region: "latam"` para países de América Latina,
 * `region: "international"` para el resto (USA, Europa, etc.).
 */
export function useRegion(): UseRegionResult {
  const [region, setRegion] = useState<PricingRegion>("international");
  const [countryCode, setCountryCode] = useState<string>("US");
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

      // 2. Llamar a la API con timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DETECT_TIMEOUT_MS);

        const response = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`ipapi.co respondió ${response.status}`);

        const data = await response.json();
        const detected: string = data.country_code ?? "US";
        const detectedRegion: PricingRegion = LATAM_COUNTRIES.has(detected)
          ? "latam"
          : "international";

        if (!cancelled) {
          setRegion(detectedRegion);
          setCountryCode(detected);
          setCache(detectedRegion, detected);
        }
      } catch {
        // Fallback silencioso a international
        if (!cancelled) {
          setRegion("international");
          setCountryCode("US");
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
