import { CheckCircle, Award, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AboutSection = () => {
  return (
    <section id="sobre-mi" className="py-20 md:py-32 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image / Avatar Side */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 p-1">
              <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 rounded-full gradient-primary mx-auto mb-6 flex items-center justify-center">
                    <span className="text-5xl font-bold text-primary-foreground">
                      [N]
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    [Tu foto aquí]
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <Card className="absolute -bottom-4 -right-4 md:right-0 bg-card border-primary/30 glow-primary">
              <CardContent className="p-4 flex items-center gap-3">
                <Award className="w-8 h-8 text-primary" />
                <div>
                  <div className="font-bold text-lg">5+ años</div>
                  <div className="text-xs text-muted-foreground">de experiencia</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Side */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Hola, soy <span className="gradient-text">[Tu Nombre]</span>
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Soy técnico especializado en optimización y mantenimiento de
              computadoras con más de 5 años de experiencia. He ayudado a más de
              100 personas a recuperar el rendimiento de sus equipos de forma
              remota, segura y profesional.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Mi misión es brindarte un servicio de calidad, explicándote cada
              paso del proceso y asegurándome de que tu PC funcione como el
              primer día. La satisfacción de mis clientes es mi mejor carta de
              presentación.
            </p>

            {/* Trust Points */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-accent" />
                <span>Garantía de satisfacción o devolución</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-accent" />
                <span>Proceso 100% transparente y seguro</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-accent" />
                <span>+100 clientes satisfechos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
