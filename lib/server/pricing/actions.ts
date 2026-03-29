"use server";

import { revalidatePath } from "next/cache";
import type { PlanId } from "@/lib/domain/types";
import type { PricingRegion } from "@/lib/domain/database.types";
import { createServerSupabaseClient } from "@/lib/integrations/supabase";
import { createAdminClient } from "@/lib/integrations/supabase";

const VALID_REGIONS: PricingRegion[] = ["latam", "international"];
const VALID_PLANS: PlanId[] = ["basic", "gamer"];

function normalizePriceInput(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const normalized = value.replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Number(parsed.toFixed(2));
}

interface UpdatePricingResult {
  success: boolean;
  message: string;
}

export async function updatePricingRulesAction(
  _prevState: UpdatePricingResult,
  formData: FormData,
): Promise<UpdatePricingResult> {
  const serverSupabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Sesión inválida. Inicia sesión de nuevo.",
    };
  }

  const supabase = createAdminClient();

  const rows: Array<{
    plan_type: PlanId;
    region: PricingRegion;
    price_usd: number;
    currency: "USD";
    updated_by: string;
  }> = [];

  for (const plan of VALID_PLANS) {
    for (const region of VALID_REGIONS) {
      const key = `${plan}_${region}`;
      const value = normalizePriceInput(formData.get(key));
      if (value == null) {
        return {
          success: false,
          message: `Precio inválido para ${plan} (${region}).`,
        };
      }

      rows.push({
        plan_type: plan,
        region,
        price_usd: value,
        currency: "USD",
        updated_by: user.id,
      });
    }
  }

  const { error } = await supabase
    .from("pricing_rules")
    .upsert(rows, { onConflict: "plan_type,region" });

  if (error) {
    console.error("Error actualizando pricing_rules:", error);
    return {
      success: false,
      message: "No se pudieron guardar los precios. Intenta nuevamente.",
    };
  }

  revalidatePath("/");
  revalidatePath("/dashboard/precios");

  return {
    success: true,
    message: "Precios actualizados correctamente.",
  };
}
