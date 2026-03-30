import { CheckCircle, Award, Users, Cpu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AboutSection = () => {
  return (
    <section id="sobre-mi" className="py-20 md:py-32 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Lado de imagen / avatar */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 p-1">
              <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-36 h-36 rounded-full gradient-primary mx-auto mb-6 flex items-center justify-center shadow-lg ring-4 ring-primary/20">
                    <Cpu className="w-16 h-16 text-primary-foreground" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-foreground tracking-wide">
                    Thomas Montoya
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Técnico en Optimización de PCs
                  </p>
                </div>
              </div>
            </div>

            {/* Estadísticas flotantes */}
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

          {/* Lado de contenido */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Hola, soy <span className="gradient-text">Thomas</span>
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Soy técnico especializado en optimización y mantenimiento de
              computadoras con más de 5 años de experiencia. He ayudado a más de
              100 personas a mejorar por completo el rendimiento de sus equipos de forma
              remota, segura y profesional.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Mi misión es brindarte un servicio de calidad, explicándote cada
              paso del proceso y asegurándome de que tu PC funcione con mucho mejor rendimiento. 
              La satisfacción de mis clientes es mi mejor carta de
              presentación.
            </p>

            {/* Puntos de confianza */}
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
