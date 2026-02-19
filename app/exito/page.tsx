import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getWhatsAppUrl } from "@/lib/whatsapp";

// Pre-calcular URL de WhatsApp a nivel de módulo (optimización de Server Component)
const WHATSAPP_URL = getWhatsAppUrl("Hola! Acabo de realizar el pago para optimizar mi PC.");

// Componente interno que lee los searchParams
async function ExitoContent({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order_id;

  return (
    <Card className="relative z-10 max-w-lg w-full bg-card border-accent/30">
      <CardContent className="p-8 text-center">
        {/* Icono de éxito */}
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-accent" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold mb-4">
          Pago <span className="text-accent">Exitoso</span>!
        </h1>

        {/* Mensaje */}
        <p className="text-muted-foreground mb-6">
          Gracias por tu compra. Hemos recibido tu pago correctamente. En
          breve recibiras un correo con los detalles de tu pedido.
        </p>

        {/* ID de orden PayPal (visible solo si existe, util para soporte) */}
        {orderId ? (
          <p className="text-xs text-muted-foreground/60 mb-4 font-mono">
            Ref: {orderId}
          </p>
        ) : null}

        {/* Próximos pasos */}
        <div className="bg-muted/50 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold mb-3">Proximos pasos:</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                1
              </span>
              Revisa tu correo electronico con la confirmacion
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                2
              </span>
              Contactanos por WhatsApp para agendar tu cita
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                3
              </span>
              Preparate para tener tu PC como nueva!
            </li>
          </ol>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            asChild
          >
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              Agendar por WhatsApp
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/">
              <Home className="mr-2 w-4 h-4" />
              Volver al Inicio
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Fallback de carga para Suspense
function ExitoLoading() {
  return (
    <Card className="relative z-10 max-w-lg w-full bg-card border-accent/30">
      <CardContent className="p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Cargando...</h1>
      </CardContent>
    </Card>
  );
}

// Pagina principal con Suspense boundary para searchParams async
export default function ExitoPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <Suspense fallback={<ExitoLoading />}>
        <ExitoContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
