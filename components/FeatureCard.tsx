import { Card, CardContent } from "@/components/ui/card";
import { Feature } from "@/lib/types";
import {
  Zap,
  Shield,
  Trash2,
  Monitor,
  Clock,
  Lock,
  Star,
  type LucideIcon,
} from "lucide-react";

// Mapa de iconos usado en FEATURES - evita importar todo lucide-react (bundle-barrel-imports)
const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Shield,
  Trash2,
  Monitor,
  Clock,
  Lock,
  Star,
};

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard = ({ feature }: FeatureCardProps) => {
  const IconComponent = ICON_MAP[feature.icon] ?? Star;

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
