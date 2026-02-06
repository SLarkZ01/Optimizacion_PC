import { memo } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingPlan, Currency } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  plan: PricingPlan;
  currency: Currency;
  currencyCode: string;
}

// Memoizado para evitar re-renders cuando cambian otros planes (rerender-memo)
const PricingCard = memo(function PricingCard({ plan, currency, currencyCode }: PricingCardProps) {
  const convertedPrice = Math.round(plan.priceUSD * currency.rate);
  
  const formatPrice = (price: number) => {
    if (currencyCode === "COP" || currencyCode === "ARS" || currencyCode === "CLP") {
      return price.toLocaleString();
    }
    return price.toString();
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:scale-105",
        plan.popular
          ? "border-primary glow-primary bg-card"
          : "border-border bg-card/50 hover:border-primary/50"
      )}
    >
      {/* Ternario explícito en lugar de && (rendering-conditional-render) */}
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
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-medium text-muted-foreground">
              {currency.symbol}
            </span>
            <span className={cn(
              "font-bold",
              plan.popular ? "text-4xl md:text-5xl gradient-text" : "text-4xl md:text-5xl"
            )}>
              {formatPrice(convertedPrice)}
            </span>
            <span className="text-muted-foreground ml-1">{currencyCode}</span>
          </div>
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

      <CardFooter>
        <Button
          className={cn(
            "w-full",
            plan.popular
              ? "gradient-primary hover:opacity-90"
              : "bg-muted hover:bg-muted/80 text-foreground"
          )}
          size="lg"
        >
          {plan.cta}
        </Button>
      </CardFooter>
    </Card>
  );
});

export default PricingCard;
