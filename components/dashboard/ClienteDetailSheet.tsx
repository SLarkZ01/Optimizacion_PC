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
  ExternalLink,
  ChevronRight,
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

// ── Helpers hoistados al módulo (server-hoist-static-io) ──────────────────
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

// ── Skeleton de carga interno al Sheet ────────────────────────────────────
function DetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 pt-2">
      {/* Avatar + info */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      {/* Compras */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ── Contenido del Sheet una vez cargados los datos ─────────────────────────
function SheetDetailsContent({ details }: { details: CustomerDetails }) {
  const { customer, purchases, bookings } = details;

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-4 pt-0">
      {/* ── Header: avatar, nombre, email, país, fecha ── */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {getInitials(customer.name, customer.email)}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate font-semibold">
            {customer.name ?? "Sin nombre"}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
          {customer.country_code ? (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={countryCodeToFlagUrl(customer.country_code)}
                alt={`Bandera de ${countryCodeToName(customer.country_code)}`}
                width={16}
                height={12}
                className="rounded-sm object-cover"
                style={{ width: 16, height: 12 }}
              />
              <span>{countryCodeToName(customer.country_code)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Globe className="h-3.5 w-3.5" />
              <span>País desconocido</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>
              Registrado el{" "}
              {format(new Date(customer.created_at), "d 'de' MMMM yyyy", {
                locale: es,
              })}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Sección Compras ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">
            Compras{" "}
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {purchases.length}
            </span>
          </h3>
        </div>

        {purchases.length === 0 ? (
          <p className="py-3 text-center text-sm text-muted-foreground">
            Sin compras registradas
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {purchases.map((purchase) => {
              const statusCfg =
                PAYMENT_STATUS_CONFIG[purchase.status] ??
                PAYMENT_STATUS_CONFIG.pending;
              return (
                <div
                  key={purchase.id}
                  className="rounded-lg border border-border/60 bg-muted/30 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {PLAN_NAMES[purchase.plan_type] ?? purchase.plan_type}
                        </span>
                        <Badge variant={statusCfg.variant} className="text-xs">
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
                        <span className="font-mono text-xs text-muted-foreground/70">
                          {purchase.paypal_order_id}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-semibold">
                      ${purchase.amount} {purchase.currency}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Separator />

      {/* ── Sección Reservas ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">
            Reservas{" "}
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {bookings.length}
            </span>
          </h3>
        </div>

        {bookings.length === 0 ? (
          <p className="py-3 text-center text-sm text-muted-foreground">
            Sin reservas agendadas
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {bookings.map((booking) => {
              const statusCfg = BOOKING_STATUS_CONFIG[booking.status];
              return (
                <div
                  key={booking.id}
                  className="rounded-lg border border-border/60 bg-muted/30 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusCfg.variant} className="text-xs">
                          {statusCfg.label}
                        </Badge>
                        {booking.cal_booking_id && (
                          <span className="font-mono text-xs text-muted-foreground/70">
                            Cal #{booking.cal_booking_id}
                          </span>
                        )}
                      </div>
                      {booking.scheduled_date ? (
                        <span className="text-xs text-muted-foreground">
                          {format(
                            new Date(booking.scheduled_date),
                            "d MMM yyyy, h:mm a",
                            { locale: es },
                          )}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sin fecha agendada
                        </span>
                      )}
                      {booking.rustdesk_id && (
                        <span className="font-mono text-xs text-muted-foreground">
                          RustDesk: {booking.rustdesk_id}
                        </span>
                      )}
                      {booking.notes && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {booking.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
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

  // Lazy fetch — solo se ejecuta la primera vez que se abre el Sheet.
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
      {/* Trigger: botón de ícono › en la columna de acción */}
      <button
        onClick={() => handleOpenChange(true)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Ver detalles de ${displayName}`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            Detalles del cliente
          </SheetTitle>
          <SheetDescription className="truncate text-xs">
            {displayName}
          </SheetDescription>
        </SheetHeader>

        {isPending && <DetailsSkeleton />}

        {!isPending && error && (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
            <p className="text-sm">No se pudieron cargar los detalles.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(false);
                handleOpenChange(true);
              }}
            >
              Reintentar
            </Button>
          </div>
        )}

        {!isPending && !error && details && (
          <SheetDetailsContent details={details} />
        )}
      </SheetContent>
    </Sheet>
  );
}
