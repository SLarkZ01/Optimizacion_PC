import type { PricingRegion } from "@/lib/paypal";

export const LATAM_COUNTRIES = new Set([
  "CO",
  "MX",
  "AR",
  "CL",
  "PE",
  "VE",
  "EC",
  "BO",
  "PY",
  "UY",
  "GT",
  "HN",
  "SV",
  "NI",
  "CR",
  "PA",
  "DO",
  "CU",
  "PR",
]);

type GeoSource = "vercel-header" | "fallback";

export interface GeoResult {
  region: PricingRegion;
  countryCode: string | null;
  source: GeoSource;
}

export function normalizeCountryCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

export function countryCodeToRegion(countryCode: string | null): PricingRegion {
  if (!countryCode) {
    return "latam";
  }

  return LATAM_COUNTRIES.has(countryCode) ? "latam" : "international";
}

export function resolveGeoFromHeaders(headers: Headers): GeoResult {
  const countryCode = normalizeCountryCode(headers.get("x-vercel-ip-country"));

  if (!countryCode) {
    return {
      region: "latam",
      countryCode: null,
      source: "fallback",
    };
  }

  return {
    region: countryCodeToRegion(countryCode),
    countryCode,
    source: "vercel-header",
  };
}
