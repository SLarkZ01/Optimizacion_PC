"use client";

import { useState, useCallback } from "react";
import { PRICING_PLANS, CURRENCIES, CurrencyCode } from "@/lib/constants";
import PricingCard from "@/components/cards/PricingCard";
import { Button } from "@/components/ui/button";

// Hoisting de array constante fuera del componente (rerender-memo-with-default-value)
const CURRENCY_OPTIONS: CurrencyCode[] = ["USD", "COP", "MXN", "ARS", "CLP", "PEN", "EUR"];

const PricingSection = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("USD");

  // Handler memoizado para evitar recrear en cada render (rerender-functional-setstate)
  const handleCurrencyChange = useCallback((currency: CurrencyCode) => {
    setSelectedCurrency(currency);
  }, []);

  return (
    <section id="precios" className="py-20 md:py-32 bg-card/30">
      <div className="container mx-auto px-4">
        {/* Encabezado de sección */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planes y <span className="gradient-text">Precios</span>
          </h2>
          <p className="text-muted-foreground">
            Elige el plan que mejor se adapte a las necesidades de tu PC.
            Pagos 100% seguros con Stripe.
          </p>
        </div>

        {/* Selector de moneda */}
        <div className="flex justify-center gap-2 mb-12 flex-wrap" role="group" aria-label="Seleccionar moneda">
          {CURRENCY_OPTIONS.map((currency) => (
            <Button
              key={currency}
              variant={selectedCurrency === currency ? "default" : "outline"}
              size="sm"
              onClick={() => handleCurrencyChange(currency)}
              aria-pressed={selectedCurrency === currency}
              className={
                selectedCurrency === currency
                  ? "gradient-primary border-0"
                  : "border-border hover:border-primary/50"
              }
            >
              {currency}
            </Button>
          ))}
        </div>

        {/* Tarjetas de precios - 3 columnas en escritorio */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              currency={CURRENCIES[selectedCurrency]}
              currencyCode={selectedCurrency}
            />
          ))}
        </div>

        {/* Nota de BIOS */}
        <p className="text-center text-muted-foreground text-xs mt-6">
          *Optimizaciones de BIOS disponibles en PCs de escritorio. En laptops
          estas opciones suelen estar bloqueadas por el fabricante.
        </p>

        {/* Nota de confianza */}
        <p className="text-center text-muted-foreground text-sm mt-4">
          🔒 Pagos procesados de forma segura por Stripe. No almacenamos datos
          de tu tarjeta.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
