"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Globe2, Info, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updatePricingRulesAction } from "@/lib/server/pricing/actions";
import type { PricingMatrix } from "@/lib/server/pricing/queries";

const INITIAL_STATE = {
  success: false,
  message: "",
};

interface PricingFormProps {
  initialPricing: PricingMatrix;
  lastUpdatedLabel: string;
}

export default function PricingForm({ initialPricing, lastUpdatedLabel }: PricingFormProps) {
  const [state, formAction, isPending] = useActionState(updatePricingRulesAction, INITIAL_STATE);
  const [draftValues, setDraftValues] = useState({
    basic_latam: String(initialPricing.basic.latam),
    basic_international: String(initialPricing.basic.international),
    gamer_latam: String(initialPricing.gamer.latam),
    gamer_international: String(initialPricing.gamer.international),
  });

  const changedFields = useMemo(() => {
    const initial = {
      basic_latam: String(initialPricing.basic.latam),
      basic_international: String(initialPricing.basic.international),
      gamer_latam: String(initialPricing.gamer.latam),
      gamer_international: String(initialPricing.gamer.international),
    };

    return Object.fromEntries(
      Object.entries(draftValues).map(([key, value]) => [key, value.trim() !== initial[key as keyof typeof initial]]),
    ) as Record<keyof typeof draftValues, boolean>;
  }, [draftValues, initialPricing.basic.international, initialPricing.basic.latam, initialPricing.gamer.international, initialPricing.gamer.latam]);

  const changedCount = useMemo(
    () => Object.values(changedFields).filter(Boolean).length,
    [changedFields],
  );

  useEffect(() => {
    if (!state.message) return;
    if (state.success) {
      toast.success(state.message);
      return;
    }
    toast.error(state.message);
  }, [state.message, state.success]);

  const inputClasses = (isChanged: boolean) =>
    isChanged
      ? "border-primary/60 ring-1 ring-primary/30"
      : "";

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle>Precios de Checkout (USD)</CardTitle>
        <CardDescription>
          Edita precios por plan y región. Estos valores se usan en PayPal y en emails de confirmación.
          {" "}
          Última actualización: {lastUpdatedLabel}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
            <p className="flex items-start gap-2">
              <Globe2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Los cambios aplican a nuevas órdenes de PayPal. No modifican compras ya procesadas.
            </p>
          </div>

          <div className="grid gap-2 rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground sm:grid-cols-2">
            <p className="flex items-start gap-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Usa punto decimal (ej: 32.00).
            </p>
            <p className="flex items-start gap-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Recomendado: mantener LATAM menor que Internacional.
            </p>
          </div>

          {changedCount > 0 ? (
            <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs text-primary">
              Tienes {changedCount} {changedCount === 1 ? "campo modificado" : "campos modificados"} sin guardar.
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4 rounded-xl border border-border/60 bg-background/40 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Plan Básico</h3>
                <Badge variant="outline" className="text-[11px]">USD</Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="basic_latam">LATAM</Label>
                <Input
                  id="basic_latam"
                  name="basic_latam"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={draftValues.basic_latam}
                  onChange={(event) => setDraftValues((prev) => ({ ...prev, basic_latam: event.target.value }))}
                  className={inputClasses(changedFields.basic_latam)}
                  disabled={isPending}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="basic_international">Internacional</Label>
                <Input
                  id="basic_international"
                  name="basic_international"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={draftValues.basic_international}
                  onChange={(event) => setDraftValues((prev) => ({ ...prev, basic_international: event.target.value }))}
                  className={inputClasses(changedFields.basic_international)}
                  disabled={isPending}
                  required
                />
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-border/60 bg-background/40 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Plan Gamer</h3>
                <Badge variant="outline" className="text-[11px]">USD</Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gamer_latam">LATAM</Label>
                <Input
                  id="gamer_latam"
                  name="gamer_latam"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={draftValues.gamer_latam}
                  onChange={(event) => setDraftValues((prev) => ({ ...prev, gamer_latam: event.target.value }))}
                  className={inputClasses(changedFields.gamer_latam)}
                  disabled={isPending}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gamer_international">Internacional</Label>
                <Input
                  id="gamer_international"
                  name="gamer_international"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={draftValues.gamer_international}
                  onChange={(event) => setDraftValues((prev) => ({ ...prev, gamer_international: event.target.value }))}
                  className={inputClasses(changedFields.gamer_international)}
                  disabled={isPending}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Button type="submit" disabled={isPending || changedCount === 0}>
              <Save className="mr-2 h-4 w-4" />
              {isPending ? "Guardando..." : "Guardar precios"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
