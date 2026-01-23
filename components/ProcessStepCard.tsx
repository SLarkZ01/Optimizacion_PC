import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { ProcessStep } from "@/lib/types";

interface ProcessStepCardProps {
  step: ProcessStep;
  isLast: boolean;
}

const ProcessStepCard = ({ step, isLast }: ProcessStepCardProps) => {
  const IconComponent = (Icons[step.icon as keyof typeof Icons] as LucideIcon) || Icons.Circle;

  return (
    <div className="relative flex flex-col items-center text-center group">
      {/* Connector Line */}
      {!isLast && (
        <div className="hidden md:block absolute top-10 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-primary to-secondary opacity-30" />
      )}

      {/* Step Number */}
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center group-hover:glow-primary transition-all duration-300">
          <IconComponent className="w-8 h-8 text-primary-foreground" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-sm">
          {step.step}
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs">{step.description}</p>
    </div>
  );
};

export default ProcessStepCard;
