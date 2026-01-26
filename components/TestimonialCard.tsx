import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Testimonial } from "@/lib/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

// Componente de estrella hoisted - evita recrear en cada render (rendering-hoist-jsx)
const StarIcon = <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />;

// Pre-renderizar arrays de estrellas para ratings comunes (1-5)
const STAR_RATINGS: Record<number, React.ReactNode> = {
  1: <div className="flex gap-1 mb-3">{StarIcon}</div>,
  2: <div className="flex gap-1 mb-3">{StarIcon}{StarIcon}</div>,
  3: <div className="flex gap-1 mb-3">{StarIcon}{StarIcon}{StarIcon}</div>,
  4: <div className="flex gap-1 mb-3">{StarIcon}{StarIcon}{StarIcon}{StarIcon}</div>,
  5: <div className="flex gap-1 mb-3">{StarIcon}{StarIcon}{StarIcon}{StarIcon}{StarIcon}</div>,
};

// Memoizado para evitar re-renders innecesarios (rerender-memo)
const TestimonialCard = memo(function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="bg-card/50 border-border hover:border-primary/30 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
            {testimonial.avatar}
          </div>
          <div>
            <h4 className="font-semibold">{testimonial.name}</h4>
            <p className="text-sm text-muted-foreground">{testimonial.country}</p>
          </div>
        </div>

        {/* Usar ratings pre-renderizados para evitar Array.from en cada render */}
        {STAR_RATINGS[testimonial.rating] ?? STAR_RATINGS[5]}

        <p className="text-muted-foreground text-sm leading-relaxed">
          &quot;{testimonial.text}&quot;
        </p>
      </CardContent>
    </Card>
  );
});

export default TestimonialCard;
