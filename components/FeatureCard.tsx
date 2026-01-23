import { Card, CardContent } from "@/components/ui/card";
import { Feature } from "@/lib/types";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard = ({ feature }: FeatureCardProps) => {
  const IconComponent = (Icons[feature.icon as keyof typeof Icons] as LucideIcon) || Icons.Star;

  return (
    <Card className="bg-card/50 border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 group">
      <CardContent className="p-6 text-center">
        <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:glow-primary transition-all">
          <IconComponent className="w-7 h-7 text-primary-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
        <p className="text-muted-foreground text-sm">{feature.description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
