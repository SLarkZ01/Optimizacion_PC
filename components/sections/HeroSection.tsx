"use client";

import { ArrowRight, Zap, Shield, CreditCard, Rocket } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Vortex } from "@/components/ui/vortex";
import { STATS } from "@/lib/constants";
import { scrollToSection } from "@/lib/utils";

// Handler estable para evitar recrear en cada render
const handlePricingClick = () => scrollToSection("#precios");

// Detecta capacidad del dispositivo una sola vez al montar (rerender-lazy-state-init)
// Sin re-render: la función se ejecuta solo en la inicialización del estado
function getParticleCount(): number {
  if (typeof window === "undefined") return 100;
  // Respetar prefers-reduced-motion: sin partículas animadas
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
  // Móvil (ancho < 768px): mínimo para no saturar la GPU
  if (window.innerWidth < 768) return 50;
  // Tablet (768–1024px): cantidad moderada
  if (window.innerWidth < 1024) return 80;
  // Desktop: cantidad razonable sin exceso
  return 100;
}

const HeroSection = () => {
  // rerender-lazy-state-init: función de inicialización ejecutada una sola vez,
  // evita recalcular en cada render y no dispara re-renders adicionales
  const [particleCount] = useState<number>(getParticleCount);

  return (
    <section className="relative min-h-screen overflow-hidden">
      <Vortex
        backgroundColor="#000000"
        rangeY={800}
        particleCount={particleCount}
        baseHue={142}
        rangeHue={60}
        containerClassName="min-h-screen"
        className="flex flex-col items-center justify-center w-full min-h-screen pt-24 pb-8 px-4"
      >
        <div className="max-w-4xl mx-auto text-center w-full">
          {/* Insignia */}
          <Badge
            variant="outline"
            className="mb-6 px-4 py-2 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Rocket className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Maximo rendimiento
          </Badge>

          {/* Título principal */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
            Tu PC como nueva{" "}
            <span className="gradient-text">en 60 minutos</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-lg md:text-xl text-white/60 mb-8 max-w-2xl mx-auto">
            Servicio profesional de optimización remota. Limpiamos, aceleramos y
            protegemos tu computadora sin que salgas de casa.
          </p>

          {/* Botones de acción — flex-row en móvil también, se ajustan al contenido */}
          <div className="flex flex-row flex-wrap gap-3 justify-center mb-10">
            <Button
              size="lg"
              className="gradient-primary hover:opacity-90 transition-opacity text-base px-6 py-5 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.25)_inset]"
              onClick={handlePricingClick}
            >
              Optimizar Mi PC
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white text-base px-6 py-5"
              onClick={handlePricingClick}
            >
              Ver Precios
            </Button>
          </div>

          {/* Trust badges — siempre en fila, se comprimen en móvil */}
          <div className="flex flex-row flex-wrap justify-center gap-x-6 gap-y-2 mb-12">
            <div className="flex items-center gap-1.5 text-white/50">
              <Zap className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm whitespace-nowrap">Velocidad garantizada</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/50">
              <Shield className="w-4 h-4 text-accent shrink-0" />
              <span className="text-sm whitespace-nowrap">100% Seguro</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/50">
              <CreditCard className="w-4 h-4 text-secondary shrink-0" />
              <span className="text-sm whitespace-nowrap">Pago protegido</span>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-white/40">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Vortex>
    </section>
  );
};

export default HeroSection;
