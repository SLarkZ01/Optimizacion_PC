"use client";

import { ArrowRight, Zap, Shield, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATS } from "@/lib/constants";
import { scrollToSection } from "@/lib/utils";

// Handler estable para evitar recrear en cada render
const handlePricingClick = () => scrollToSection("#precios");

// JSX estático hoisted fuera del componente (rendering-hoist-jsx)
const BackgroundEffects = (
  <>
    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
  </>
);

// Badges de confianza hoisted (rendering-hoist-jsx)
const TrustBadges = (
  <div className="flex flex-wrap justify-center gap-6 md:gap-12">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Zap className="w-5 h-5 text-primary" />
      <span className="text-sm">Velocidad garantizada</span>
    </div>
    <div className="flex items-center gap-2 text-muted-foreground">
      <Shield className="w-5 h-5 text-accent" />
      <span className="text-sm">100% Seguro</span>
    </div>
    <div className="flex items-center gap-2 text-muted-foreground">
      <CreditCard className="w-5 h-5 text-secondary" />
      <span className="text-sm">Pago protegido</span>
    </div>
  </div>
);

// Indicador de scroll hoisted (rendering-hoist-jsx)
const ScrollIndicator = (
  <div
    className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
    aria-hidden="true"
  >
    <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
      <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
    </div>
  </div>
);

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Efectos de fondo */}
      {BackgroundEffects}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Insignia */}
          <Badge
            variant="outline"
            className="mb-6 px-4 py-2 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            🚀 +100 PCs optimizadas
          </Badge>

          {/* Título principal */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Tu PC como nueva{" "}
            <span className="gradient-text">en 30 minutos</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Servicio profesional de optimización remota. Limpiamos, aceleramos y
            protegemos tu computadora sin que salgas de casa.
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6"
              onClick={handlePricingClick}
            >
              Optimizar Mi PC
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 hover:bg-primary/10 text-lg px-8 py-6"
              onClick={handlePricingClick}
            >
              Ver Precios
            </Button>
          </div>

          {/* Badges de confianza */}
          {TrustBadges}

          {/* Estadísticas */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      {ScrollIndicator}
    </section>
  );
};

export default HeroSection;
