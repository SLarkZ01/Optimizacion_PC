import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Testimonial } from "@/lib/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

// Memoizado para evitar re-renders innecesarios (rerender-memo)
const TestimonialCard = memo(function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const rating = Math.min(5, Math.max(1, testimonial.rating));

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

        {/* Estrellas accesibles con aria-label para lectores de pantalla */}
        <div
          className="flex gap-1 mb-3"
          aria-label={`${rating} de 5 estrellas`}
          role="img"
        >
          {Array.from({ length: rating }, (_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" aria-hidden="true" />
          ))}
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">
          &quot;{testimonial.text}&quot;
        </p>
      </CardContent>
    </Card>
  );
});

export default TestimonialCard;
