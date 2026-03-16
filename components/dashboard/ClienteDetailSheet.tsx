"use client";

// ClienteDetailSheet — panel de detalles del cliente como Sheet (slide-over derecho).
//
// Arquitectura:
// - Es un Client Component ("use client") porque usa estado de UI (open/loading).
// - Los datos se cargan SOLO al abrir el Sheet (lazy), no al montar la tabla.
//   Esto no bloquea la carga inicial de la página (regla bundle-dynamic-imports).
// - Llama a la Server Action getCustomerDetailsAction — type-safe, sin URL pública.
// - Mientras carga muestra skeleton interno, no bloquea el resto de la UI.
// - useTransition para marcar la carga como no urgente (regla rerender-transitions).

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

// ── Configuración de estados de reserva ───────────────────────────────────
const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  scheduled: { label: "Agendada", variant: "default" },
  completed: { label: "Completada", variant: "secondary" },
  cancelled: { label: "Cancelada", variant: "destructive" },
  no_show: { label: "No asistió", variant: "outline" },
};

// ── Helpers hoistados al módulo ────────────────────────────────────────────
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

// Trunca IDs largos mostrando inicio y final
function truncateId(id: string, keepStart = 6, keepEnd = 4): string {
  if (id.length <= keepStart + keepEnd + 3) return id;
  return `${id.slice(0, keepStart)}…${id.slice(-keepEnd)}`;
}

// ── Skeleton de carga ──────────────────────────────────────────────────────
function DetailsSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-20" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[68px] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ── Encabezado de sección ─────────────────────────────────────────────────
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
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
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
    <div className="flex flex-col">
      {/* ── Bloque de identidad ── */}
      <div className="flex items-start gap-3.5 px-5 py-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {getInitials(customer.name, customer.email)}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate font-semibold text-foreground">
            {customer.name ?? "Sin nombre"}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 shrink-0" />
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
                <Globe className="h-3 w-3" />
                País desconocido
              </span>
            )}
            <span className="text-muted-foreground/30">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(customer.created_at), "d MMM yyyy", { locale: es })}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Compras ── */}
      <SectionHeader icon={CreditCard} label="Compras" count={purchases.length} />

      <div className="px-5 pb-5 pt-1.5">
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
                  className={`flex items-center justify-between gap-3 px-3.5 py-3 ${
                    index < purchases.length - 1 ? "border-b border-border/60" : ""
                  }`}
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {PLAN_NAMES[purchase.plan_type] ?? purchase.plan_type}
                      </span>
                      <Badge
                        variant={statusCfg.variant}
                        className="h-5 rounded px-1.5 text-[11px] font-medium"
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
                  <span className="shrink-0 font-semibold tabular-nums text-foreground">
                    ${purchase.amount}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
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
                  <div className="flex items-center gap-2">
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
                    <p className="border-t border-border/40 pt-1.5 text-xs leading-relaxed text-muted-foreground">
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

// ── Componente principal exportado ─────────────────────────────────────────
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

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (nextOpen && !details && !isPending) {
        startTransition(async () => {
          try {
            const data = await getCustomerDetailsAction(customer.id);
            setDetails(data);
          } catch {
            setError(true);
          }
        });
      }
    },
    [customer.id, details, isPending],
  );

  const displayName = customer.name ?? customer.email;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <button
        onClick={() => handleOpenChange(true)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Ver detalles de ${displayName}`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <SheetContent
        side="right"
        className="flex w-[460px] max-w-[460px] flex-col gap-0 p-0"
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

        {/* Contenido scrolleable */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {isPending && <DetailsSkeleton />}

          {!isPending && error && (
            <div className="flex flex-col items-center justify-center gap-4 px-5 py-16 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
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
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setError(false);
                  handleOpenChange(true);
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
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
