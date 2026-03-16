"use client";

// ClienteDetailSheet — panel de detalles del cliente como Sheet (slide-over derecho).
//
// Arquitectura (Vercel React best practices):
// - Client Component ("use client") — usa estado de UI (open/loading/error).
// - Lazy fetch: los datos se cargan SOLO al abrir el Sheet, no al montar la tabla.
//   (regla bundle-dynamic-imports — evita waterfall en la carga inicial de página)
// - Server Action getCustomerDetailsAction — type-safe, sin URL pública expuesta.
//   (regla server-auth-actions — validación UUID en la action)
// - useTransition para marcar la carga como no urgente y mostrar skeleton durante
//   la transición. (regla rendering-usetransition-loading)
// - Helpers y configs hoistados al módulo — se crean una sola vez.
//   (regla server-hoist-static-io, rerender-no-inline-components)
// - useCallback con dependencias primitivas para callbacks estables.
//   (regla rerender-functional-setstate)

import { useState, useTransition, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Globe,
  Calendar,
  CreditCard,
  CalendarCheck,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { PLAN_NAMES, PAYMENT_STATUS_CONFIG } from "@/lib/constants";
import { getCustomerDetailsAction } from "@/lib/actions";
import type { CustomerWithPurchaseCount, CustomerDetails } from "@/lib/dashboard";
import type { BookingStatus } from "@/lib/database.types";

// ── Configuración de estados de reserva — hoistado al módulo ──────────────
const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  scheduled: { label: "Agendada",   variant: "default"     },
  completed: { label: "Completada", variant: "secondary"   },
  cancelled: { label: "Cancelada",  variant: "destructive" },
  no_show:   { label: "No asistió", variant: "outline"     },
};

// ── Helpers hoistados al módulo ─────────────────────────────────────────────
const countryDisplayNames = new Intl.DisplayNames(["es"], { type: "region" });

function countryCodeToFlagUrl(code: string): string {
  const points = code
    .toUpperCase()
    .split("")
    .map((char) => (0x1f1e6 + char.charCodeAt(0) - 65).toString(16));
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${points.join("-")}.svg`;
}

function countryCodeToName(code: string): string {
  try {
    return countryDisplayNames.of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function truncateId(id: string, keepStart = 6, keepEnd = 4): string {
  if (id.length <= keepStart + keepEnd + 3) return id;
  return `${id.slice(0, keepStart)}…${id.slice(-keepEnd)}`;
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function DetailsSkeleton() {
  return (
    <div className="flex flex-col px-5 py-5 gap-5">
      {/* Identidad */}
      <div className="flex items-start gap-3.5">
        <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2 pt-0.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-52" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      {/* Sección Compras */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="ml-auto h-5 w-5 rounded" />
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-3 px-3.5 py-3 ${
                i < 2 ? "border-b border-border/60" : ""
              }`}
            >
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-14 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      {/* Sección Reservas */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="ml-auto h-5 w-5 rounded" />
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className={`flex flex-col gap-2 px-3.5 py-3 ${
                i < 1 ? "border-b border-border/60" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-4 w-44" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Encabezado de sección ──────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  label,
  count,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2 px-5 pb-2 pt-4">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

// ── Contenido del Sheet ────────────────────────────────────────────────────
function SheetDetailsContent({ details }: { details: CustomerDetails }) {
  const { customer, purchases, bookings } = details;

  return (
    <div className="flex flex-col pb-2">
      {/* ── Identidad ── */}
      <div className="flex items-start gap-3.5 px-5 py-5">
        <div
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
        >
          {getInitials(customer.name, customer.email)}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden">
          <p className="truncate text-sm font-semibold leading-snug text-foreground">
            {customer.name ?? "Sin nombre"}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{customer.email}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            {customer.country_code ? (
              <span className="flex items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={countryCodeToFlagUrl(customer.country_code)}
                  alt=""
                  width={14}
                  height={10}
                  className="rounded-[2px] object-cover"
                  style={{ width: 14, height: 10 }}
                />
                {countryCodeToName(customer.country_code)}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" aria-hidden="true" />
                País desconocido
              </span>
            )}
            <span className="text-muted-foreground/30" aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              {format(new Date(customer.created_at), "d MMM yyyy", { locale: es })}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Compras ── */}
      <SectionHeader icon={CreditCard} label="Compras" count={purchases.length} />

      <div className="px-5 pb-4 pt-1.5">
        {purchases.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-5 text-center text-xs text-muted-foreground">
            Sin compras registradas
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            {purchases.map((purchase, index) => {
              const statusCfg =
                PAYMENT_STATUS_CONFIG[purchase.status] ??
                PAYMENT_STATUS_CONFIG.pending;
              return (
                <div
                  key={purchase.id}
                  className={`flex items-center gap-2 px-3.5 py-3 ${
                    index < purchases.length - 1 ? "border-b border-border/60" : ""
                  }`}
                >
                  {/* Columna izquierda */}
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground">
                        {PLAN_NAMES[purchase.plan_type] ?? purchase.plan_type}
                      </span>
                      <Badge
                        variant={statusCfg.variant}
                        className="h-5 shrink-0 rounded px-1.5 text-[11px] font-medium"
                      >
                        {statusCfg.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(
                        new Date(purchase.created_at),
                        "d MMM yyyy, h:mm a",
                        { locale: es },
                      )}
                    </span>
                    {purchase.paypal_order_id && (
                      <span
                        className="font-mono text-[11px] text-muted-foreground/50"
                        title={purchase.paypal_order_id}
                      >
                        {truncateId(purchase.paypal_order_id)}
                      </span>
                    )}
                  </div>
                  {/* Precio */}
                  <span className="shrink-0 whitespace-nowrap text-right text-sm font-semibold tabular-nums text-foreground">
                    ${purchase.amount}
                    <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                      {purchase.currency}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Separator />

      {/* ── Reservas ── */}
      <SectionHeader icon={CalendarCheck} label="Reservas" count={bookings.length} />

      <div className="px-5 pb-5 pt-1.5">
        {bookings.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-5 text-center text-xs text-muted-foreground">
            Sin reservas agendadas
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            {bookings.map((booking, index) => {
              const statusCfg = BOOKING_STATUS_CONFIG[booking.status];
              return (
                <div
                  key={booking.id}
                  className={`flex flex-col gap-1.5 px-3.5 py-3 ${
                    index < bookings.length - 1 ? "border-b border-border/60" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant={statusCfg.variant}
                      className="h-5 rounded px-1.5 text-[11px] font-medium"
                    >
                      {statusCfg.label}
                    </Badge>
                    {booking.cal_booking_id && (
                      <span
                        className="font-mono text-[11px] text-muted-foreground/50"
                        title={`Cal #${booking.cal_booking_id}`}
                      >
                        Cal #{truncateId(booking.cal_booking_id, 8, 4)}
                      </span>
                    )}
                  </div>
                  {booking.scheduled_date ? (
                    <span className="text-sm font-medium text-foreground">
                      {format(
                        new Date(booking.scheduled_date),
                        "d 'de' MMMM yyyy, h:mm a",
                        { locale: es },
                      )}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Sin fecha agendada
                    </span>
                  )}
                  {booking.rustdesk_id && (
                    <span className="font-mono text-xs text-muted-foreground/70">
                      RustDesk: {booking.rustdesk_id}
                    </span>
                  )}
                  {booking.notes && (
                    <p className="break-words border-t border-border/40 pt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {booking.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
interface ClienteDetailSheetProps {
  customer: CustomerWithPurchaseCount;
}

export default function ClienteDetailSheet({
  customer,
}: ClienteDetailSheetProps) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<CustomerDetails | null>(null);
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadDetails = useCallback(() => {
    startTransition(async () => {
      try {
        const data = await getCustomerDetailsAction(customer.id);
        setDetails(data);
      } catch {
        setError(true);
      }
    });
  }, [customer.id]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (nextOpen && !details && !isPending) {
        loadDetails();
      }
    },
    [details, isPending, loadDetails],
  );

  const handleRetry = useCallback(() => {
    setError(false);
    loadDetails();
  }, [loadDetails]);

  const displayName = customer.name ?? customer.email;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Ver detalles de ${displayName}`}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>

      {/*
        El SheetContent es position:fixed + inset-y-0 + h-full (anclado al viewport).
        El ancho se fuerza via style inline para máxima especificidad CSS.
        No se necesita overflow:hidden en el padre porque el scroll usa la técnica
        height:0 + flex:"1 1 0" que es determinista independiente del BFC.
      */}
      <SheetContent
        side="right"
        className="flex flex-col p-0"
        style={{
          width: "460px",
          maxWidth: "calc(100vw - 16px)",
          gap: 0,
        }}
      >
        {/* Header fijo */}
        <SheetHeader className="shrink-0 border-b px-5 py-4">
          <SheetTitle className="text-sm font-semibold">
            Detalles del cliente
          </SheetTitle>
          <SheetDescription className="truncate text-xs">
            {displayName}
          </SheetDescription>
        </SheetHeader>

        {/*
          Región scrolleable con técnica height:0 + flex:"1 1 0":
          - height:0 fuerza al navegador a resolver la altura via flex-grow (no via contenido)
          - flex:"1 1 0" = flex-grow:1, flex-shrink:1, flex-basis:0 — ocupa todo el espacio
            restante después del header fijo
          - overflowY:"auto" activa scroll cuando el contenido supera el espacio disponible
          - pointerEvents:"auto" es CRÍTICO: Radix Dialog pone pointer-events:none en el body
            cuando el Sheet está abierto (scroll lock), lo que bloquea los eventos de wheel/touch
            en TODO el documento. Sin este override el scroll con mouse/touch es imposible.
          (Vercel: rendering-usetransition-loading — scroll region debe tener altura determinista)
        */}
        <div style={{ height: 0, flex: "1 1 0", overflowY: "auto", pointerEvents: "auto" }}>
          {isPending && <DetailsSkeleton />}

          {!isPending && error && (
            <div className="flex flex-col items-center justify-center gap-4 px-5 py-16 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  Error al cargar los datos
                </p>
                <p className="text-xs text-muted-foreground">
                  Verifica tu conexión e intenta nuevamente.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleRetry}
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Reintentar
              </Button>
            </div>
          )}

          {!isPending && !error && details && (
            <SheetDetailsContent details={details} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
