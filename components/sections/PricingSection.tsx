"use client";

import { PRICING_PLANS } from "@/lib/constants";
import { PAYPAL_PRICES } from "@/lib/paypal";
import PricingCard from "@/components/cards/PricingCard";
import { useRegion } from "@/hooks/useCurrency";
import type { PlanId } from "@/lib/types";

// ============================================================
// Skeleton de una tarjeta de precios mientras carga
// ============================================================

const PricingCardSkeleton = ({ popular = false }: { popular?: boolean }) => (
  <div
    className={`relative overflow-hidden rounded-xl border animate-pulse ${
      popular ? "border-primary" : "border-border"
    } bg-card/50 p-6 flex flex-col gap-4`}
    aria-hidden="true"
  >
    {/* Badge "Más Popular" */}
    {popular ? (
      <div className="absolute top-0 right-0 w-24 h-6 rounded-bl-lg bg-primary/30" />
    ) : null}

    {/* Título y descripción */}
    <div className="flex flex-col items-center gap-2 pt-2">
      <div className="h-6 w-24 rounded bg-muted/50" />
      <div className="h-4 w-40 rounded bg-muted/30" />
    </div>

    {/* Precio */}
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="h-12 w-32 rounded bg-muted/50" />
      <div className="h-5 w-44 rounded bg-muted/30" />
      <div className="h-3 w-24 rounded bg-muted/20" />
    </div>

    {/* Lista de features */}
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-muted/40 shrink-0" />
          <div className="h-3 rounded bg-muted/30" style={{ width: `${60 + (i % 3) * 15}%` }} />
        </div>
      ))}
    </div>

    {/* Botón PayPal */}
    <div className="h-11 w-full rounded bg-muted/40 mt-2" />
  </div>
);

// ============================================================
// Sección principal
// ============================================================

const PricingSection = () => {
  const { region, loading } = useRegion();

  return (
    <section id="precios" className="py-20 md:py-32 bg-card/30">
      <div className="container mx-auto px-4">
        {/* Encabezado de sección */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planes y <span className="gradient-text">Precios</span>
          </h2>
          <p className="text-muted-foreground">
            Elige el plan que mejor se adapte a las necesidades de tu PC.
            Pagos 100% seguros con PayPal.
          </p>
        </div>

        {/* Tarjetas de precios — 2 columnas en escritorio */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {loading ? (
            // Skeleton mientras se detecta la región por IP
            PRICING_PLANS.map((plan) => (
              <PricingCardSkeleton key={plan.id} popular={plan.popular} />
            ))
          ) : (
            // Cards reales con precio según región detectada
            PRICING_PLANS.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                priceUSD={PAYPAL_PRICES[plan.id as PlanId][region]}
                region={region}
              />
            ))
          )}
        </div>

        {/* Nota de BIOS */}
        <p className="text-center text-muted-foreground text-xs mt-6">
          *Optimizaciones de BIOS disponibles en PCs de escritorio. En laptops
          estas opciones suelen estar bloqueadas por el fabricante.
        </p>

        {/* Nota de confianza */}
        <p className="text-center text-muted-foreground text-sm mt-4">
          Pagos procesados de forma segura por PayPal. No almacenamos datos
          de tu tarjeta.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
