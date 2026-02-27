import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, Calendar, Mail, Home, Loader2, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase";
import type { PlanType } from "@/lib/database.types";

// URL de Cal.com para agendar la sesión
const CAL_COM_URL = process.env.NEXT_PUBLIC_CAL_COM_URL || "https://cal.com/pcoptimize";
const WHATSAPP_URL = `https://wa.me/573126081990`;

// Nombres de planes legibles
const PLAN_LABELS: Record<PlanType, string> = {
  basic: "Basic",
  gamer: "Gamer",
  premium: "Premium",
};

// Datos del pago obtenidos desde Supabase
interface PurchaseData {
  customerName: string | null;
  planType: PlanType;
  amount: number;
}

// Consultar Supabase para obtener datos reales del pago
async function getPurchaseData(orderId: string): Promise<PurchaseData | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("purchases")
      .select("plan_type, amount, customers(name)")
      .eq("paypal_order_id", orderId)
      .eq("status", "completed")
      .single();

    if (!data) return null;

    // customers puede ser un array o un objeto según el join
    const customerRow = Array.isArray(data.customers)
      ? data.customers[0]
      : data.customers;
    const customerName = (customerRow as { name: string | null } | null)?.name ?? null;

    return {
      customerName,
      planType: data.plan_type as PlanType,
      amount: Number(data.amount),
    };
  } catch {
    return null;
  }
}

// Componente interno que lee los searchParams y carga datos de Supabase
async function ExitoContent({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.order_id;

  // Intentar obtener datos reales del pago desde Supabase
  const purchase = orderId ? await getPurchaseData(orderId) : null;
  const firstName = purchase?.customerName
    ? purchase.customerName.split(" ")[0]
    : null;
    const planLabel = purchase ? (PLAN_LABELS[purchase.planType] ?? purchase.planType) : null;
  const amount = purchase?.amount ?? null;

  return (
    <Card className="relative z-10 max-w-lg w-full bg-card border-accent/30">
      <CardContent className="p-8 text-center">
        {/* Icono de éxito */}
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-accent" />
        </div>

        {/* Título personalizado si tenemos nombre */}
        <h1 className="text-3xl font-bold mb-3">
          {firstName ? (
            <>¡Listo, <span className="text-accent">{firstName}</span>!</>
          ) : (
            <>¡Pago <span className="text-accent">confirmado</span>!</>
          )}
        </h1>

        {/* Mensaje principal */}
        <p className="text-muted-foreground mb-2">
          Recibimos tu pago correctamente.
        </p>
        <p className="text-sm text-muted-foreground mb-5">
          Te enviamos un email con los detalles y el link para agendar tu sesión.
        </p>

        {/* Resumen del pago (solo si tenemos datos reales) */}
        {purchase && (
          <div className="bg-muted/50 rounded-lg p-4 mb-5 text-left">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Resumen del pago
            </p>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-semibold text-foreground">{planLabel}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-border pt-2">
              <span className="text-muted-foreground">Monto pagado</span>
              <span className="font-bold text-primary text-base">${amount} USD</span>
            </div>
          </div>
        )}

        {/* ID de orden (solo referencia) */}
        {orderId && (
          <p className="text-xs text-muted-foreground/50 mb-5 font-mono">
            Ref: {orderId}
          </p>
        )}

        {/* CTA principal — Agendar */}
        <Button
          className="w-full mb-3 bg-accent hover:bg-accent/90 text-accent-foreground text-base py-6"
          asChild
        >
          <a href={CAL_COM_URL} target="_blank" rel="noopener noreferrer">
            <Calendar className="mr-2 w-5 h-5" />
            Agendar mi sesión ahora
            <ArrowRight className="ml-2 w-4 h-4" />
          </a>
        </Button>

        {/* CTA secundario — WhatsApp */}
        <Button
          variant="outline"
          className="w-full mb-6 border-green-500/50 text-green-400 hover:bg-green-500/10"
          asChild
        >
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 w-4 h-4" />
            Contactar por WhatsApp
          </a>
        </Button>

        {/* Próximos pasos */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold mb-3 text-sm">¿Qué sigue?</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-3 h-3" />
              </div>
              <span>
                <strong className="text-foreground">Revisa tu email</strong> — te enviamos la confirmación con el link de Cal.com para agendar
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-3 h-3" />
              </div>
              <span>
                <strong className="text-foreground">Agenda tu sesión</strong> — elige el día y hora que más te convenga (la sesión dura ~90 min)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3" />
              </div>
              <span>
                <strong className="text-foreground">Instala RustDesk</strong> — envíanos tu ID 15 min antes de la sesión por WhatsApp
              </span>
            </li>
          </ol>
        </div>

        {/* Botón secundario — Volver al inicio */}
        <Button variant="outline" className="w-full" asChild>
          <Link href="/">
            <Home className="mr-2 w-4 h-4" />
            Volver al inicio
          </Link>
        </Button>
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

// Página principal con Suspense boundary para searchParams async
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
