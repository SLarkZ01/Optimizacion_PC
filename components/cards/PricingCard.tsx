"use client";

import { memo, useState, useCallback } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PricingPlan } from "@/lib/types";
import type { PricingRegion } from "@/lib/paypal";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  plan: PricingPlan;
  /** Precio real en USD que se cobra a través de PayPal */
  priceUSD: number;
  region: PricingRegion;
}

// Memoizado para evitar re-renders cuando cambian otros planes (rerender-memo)
const PricingCard = memo(function PricingCard({ plan, priceUSD, region }: PricingCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isLatam = region === "latam";

  // Crear orden de PayPal llamando a nuestro backend
  const createOrder = useCallback(async (): Promise<string> => {
    const response = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: plan.id, region }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo crear la orden de pago");
    }

    return data.orderID;
  }, [plan.id, region]);

  // Capturar pago aprobado por el usuario
  const onApprove = useCallback(async (data: { orderID: string }) => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: data.orderID }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error("Error al procesar el pago", {
          description: result.error || "No se pudo completar la transacción.",
        });
        return;
      }

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } catch {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor. Verifica tu conexión.",
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:scale-105",
        plan.popular
          ? "border-primary glow-primary bg-card"
          : "border-border bg-card/50 hover:border-primary/50"
      )}
    >
      {/* Badge "Más Popular" */}
      {plan.popular ? (
        <div className="absolute top-0 right-0">
          <Badge className="rounded-none rounded-bl-lg gradient-primary text-primary-foreground border-0">
            Más Popular
          </Badge>
        </div>
      ) : null}

      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="text-center">
        <div className="mb-6">
          {/* Precio en USD */}
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-medium text-muted-foreground">$</span>
            <span className={cn(
              "font-bold",
              plan.popular ? "text-4xl md:text-5xl gradient-text" : "text-4xl md:text-5xl"
            )}>
              {priceUSD}
            </span>
            <span className="text-muted-foreground ml-1">USD</span>
          </div>

          {/* Badge de precio especial Latam */}
          {isLatam ? (
            <div className="mt-2 flex justify-center">
              <Badge
                variant="outline"
                className="text-xs border-accent/50 text-accent bg-accent/10"
              >
                Precio especial Latinoamérica
              </Badge>
            </div>
          ) : null}

          <p className="text-sm text-muted-foreground mt-2">{plan.duration}</p>
        </div>

        <ul className="space-y-3 text-left">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {isProcessing ? (
          <div className="w-full flex items-center justify-center gap-2 py-3 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Procesando pago...</span>
          </div>
        ) : (
          <div className="w-full">
            <PayPalButtons
              style={{
                layout: "vertical",
                color: "gold",
                shape: "rect",
                label: "pay",
                height: 45,
              }}
              createOrder={createOrder}
              onApprove={onApprove}
              onError={(err) => {
                console.error("Error de PayPal:", err);
                toast.error("Error con PayPal", {
                  description: "Hubo un problema al iniciar el pago. Intenta de nuevo.",
                });
              }}
              onCancel={() => {
                toast.info("Pago cancelado", {
                  description: "Puedes intentar de nuevo cuando quieras.",
                });
              }}
            />
          </div>
        )}
      </CardFooter>
    </Card>
  );
});

export default PricingCard;
