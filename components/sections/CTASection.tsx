"use client";

import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WHATSAPP_URL } from "@/lib/whatsapp";
import { scrollToSection } from "@/lib/utils";

// Handler hoisted para evitar recreación en cada render
const handlePricingClick = () => scrollToSection("#precios");

// JSX estático hoisted fuera del componente (rendering-hoist-jsx)
const BackgroundEffects = (
  <>
    <div className="absolute inset-0 gradient-primary opacity-10" />
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
  </>
);

const CTASection = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Gradiente de fondo */}
      {BackgroundEffects}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            ¿Listo para tener tu PC{" "}
            <span className="gradient-text">como nueva</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            No esperes más. En menos de 2 horas tu computadora funcionará de
            manera óptima, segura y veloz.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6"
              onClick={handlePricingClick}
            >
              Optimizar Ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10 text-lg px-8 py-6"
              asChild
            >
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 w-5 h-5" />
                Consultar por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
