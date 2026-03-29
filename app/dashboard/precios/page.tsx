import { getPricingMatrix, getPricingRules } from "@/lib/server/pricing/queries";
import PricingForm from "./PricingForm";

export default async function DashboardPricingPage() {
  const [pricing, rules] = await Promise.all([
    getPricingMatrix(),
    getPricingRules(),
  ]);

  const lastUpdated = rules
    .map((rule) => new Date(rule.updated_at).getTime())
    .sort((a, b) => b - a)[0];

  const lastUpdatedLabel = Number.isFinite(lastUpdated)
    ? new Date(lastUpdated).toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Bogota",
    })
    : "Sin cambios registrados";

  return <PricingForm initialPricing={pricing} lastUpdatedLabel={lastUpdatedLabel} />;
}
