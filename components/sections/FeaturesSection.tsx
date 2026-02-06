import { FEATURES } from "@/lib/constants";
import FeatureCard from "@/components/cards/FeatureCard";

const FeaturesSection = () => {
  return (
    <section id="servicios" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Encabezado de sección */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Por qué elegir{" "}
            <span className="gradient-text">PCOptimize</span>?
          </h2>
          <p className="text-muted-foreground">
            Ofrecemos un servicio completo de optimización que cubre todos los
            aspectos de tu computadora.
          </p>
        </div>

        {/* Grilla de servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
