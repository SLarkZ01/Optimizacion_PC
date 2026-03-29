import type { PlanId } from "@/lib/domain/types";
import type { DbPricingRule, PricingRegion } from "@/lib/domain/database.types";
import { createAdminClient } from "@/lib/integrations/supabase";
import { PAYPAL_PRICES } from "@/lib/integrations/paypal";

export interface PricingMatrix {
  basic: Record<PricingRegion, number>;
  gamer: Record<PricingRegion, number>;
}

const VALID_REGIONS: PricingRegion[] = ["latam", "international"];

function buildFallbackPricingMatrix(): PricingMatrix {
  return {
    basic: { ...PAYPAL_PRICES.basic },
    gamer: { ...PAYPAL_PRICES.gamer },
  };
}

function isPlanId(value: string): value is PlanId {
  return value === "basic" || value === "gamer";
}

function isPricingRegion(value: string): value is PricingRegion {
  return VALID_REGIONS.includes(value as PricingRegion);
}

export async function getPricingRules(): Promise<DbPricingRule[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pricing_rules")
    .select("id, plan_type, region, price_usd, currency, updated_by, created_at, updated_at")
    .order("plan_type", { ascending: true })
    .order("region", { ascending: true });

  if (error) {
    console.error("Error al obtener pricing_rules:", error);
    return [];
  }

  return (data ?? []) as DbPricingRule[];
}

export async function getPricingMatrix(): Promise<PricingMatrix> {
  const fallback = buildFallbackPricingMatrix();
  const rules = await getPricingRules();

  if (rules.length === 0) return fallback;

  for (const rule of rules) {
    if (!isPlanId(rule.plan_type) || !isPricingRegion(rule.region)) continue;
    fallback[rule.plan_type][rule.region] = Number(rule.price_usd);
  }

  return fallback;
}

export async function getCheckoutPriceUSD(
  planId: PlanId,
  region: PricingRegion,
): Promise<number> {
  const pricing = await getPricingMatrix();
  return pricing[planId][region];
}
