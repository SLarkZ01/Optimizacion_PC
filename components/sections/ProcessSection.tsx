import { PROCESS_STEPS } from "@/lib/constants";
import ProcessStepCard from "@/components/ProcessStepCard";

const ProcessSection = () => {
  return (
    <section id="proceso" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Cómo <span className="gradient-text">funciona</span>?
          </h2>
          <p className="text-muted-foreground">
            Un proceso simple y seguro para optimizar tu PC sin complicaciones.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {PROCESS_STEPS.map((step, index) => (
            <ProcessStepCard
              key={step.step}
              step={step}
              isLast={index === PROCESS_STEPS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
