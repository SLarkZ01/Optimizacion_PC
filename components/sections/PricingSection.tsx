"use client";

import { useState, useCallback } from "react";
import { PRICING_PLANS, CURRENCIES, CurrencyCode } from "@/lib/constants";
import PricingCard from "@/components/PricingCard";
import { Button } from "@/components/ui/button";

// Hoisting de array constante fuera del componente (rerender-memo-with-default-value)
const CURRENCY_OPTIONS: CurrencyCode[] = ["USD", "COP", "EUR", "MXN", "ARS"];

const PricingSection = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("USD");

  // Handler memoizado para evitar recrear en cada render (rerender-functional-setstate)
  const handleCurrencyChange = useCallback((currency: CurrencyCode) => {
    setSelectedCurrency(currency);
  }, []);

  return (
    <section id="precios" className="py-20 md:py-32 bg-card/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planes y <span className="gradient-text">Precios</span>
          </h2>
          <p className="text-muted-foreground">
            Elige el plan que mejor se adapte a las necesidades de tu PC.
            Pagos 100% seguros con Stripe.
          </p>
        </div>

        {/* Currency Selector */}
        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          {CURRENCY_OPTIONS.map((currency) => (
            <Button
              key={currency}
              variant={selectedCurrency === currency ? "default" : "outline"}
              size="sm"
              onClick={() => handleCurrencyChange(currency)}
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

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              currency={CURRENCIES[selectedCurrency]}
              currencyCode={selectedCurrency}
            />
          ))}
        </div>

        {/* Trust Note */}
        <p className="text-center text-muted-foreground text-sm mt-8">
          🔒 Pagos procesados de forma segura por Stripe. No almacenamos datos
          de tu tarjeta.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
