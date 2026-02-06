import { TESTIMONIALS } from "@/lib/constants";
import TestimonialCard from "@/components/cards/TestimonialCard";

const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Encabezado de sección */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Lo que dicen mis <span className="gradient-text">clientes</span>
          </h2>
          <p className="text-muted-foreground">
            Más de 100 personas ya han optimizado sus PCs con nosotros.
            Esto es lo que opinan.
          </p>
        </div>

        {/* Grilla de testimonios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
