"use client";

import { memo, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  CalendarCheck,
  ChevronRight,
  CreditCard,
  Globe,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailSheet } from "@/components/dashboard/detail-sheet/DetailSheet";
import { DetailSheetSectionHeader } from "@/components/dashboard/detail-sheet/DetailSheetSectionHeader";
import { useDetailSheet } from "@/components/dashboard/detail-sheet/useDetailSheet";
import { PLAN_NAMES, PAYMENT_STATUS_CONFIG } from "@/lib/config/site";
import { getCustomerDetailsAction } from "@/lib/server/dashboard/actions";
import { BOOKING_STATUS_CONFIG } from "@/lib/dashboard/constants";
import { countryCodeToFlagUrl, countryCodeToName } from "@/lib/dashboard/formatters";
import type { CustomerDetails, CustomerWithPurchaseCount } from "@/lib/server/dashboard/queries";

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function truncateId(id: string, keepStart = 6, keepEnd = 4): string {
  if (id.length <= keepStart + keepEnd + 3) return id;
  return `${id.slice(0, keepStart)}...${id.slice(-keepEnd)}`;
}

const DetailsSkeleton = memo(function DetailsSkeletonComponent() {
  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-10 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-52" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      <Skeleton className="h-px w-full" />

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
              className={`flex items-center justify-between gap-3 px-4 py-3 ${
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
              className={`flex flex-col gap-2 px-4 py-3 ${
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
});

const SheetDetailsContent = memo(function SheetDetailsContentComponent({
  details,
}: {
  details: CustomerDetails;
}) {
  const { customer, purchases, bookings } = details;

  return (
    <div className="flex flex-col pb-2">
      <div className="flex items-start gap-3 px-5 py-5">
        <div
          aria-hidden="true"
          className="flex h-11 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
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
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
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
                Pais desconocido
              </span>
            )}
            <span className="text-muted-foreground/30" aria-hidden="true">
              ·
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              {format(new Date(customer.created_at), "d MMM yyyy", { locale: es })}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      <DetailSheetSectionHeader
        icon={CreditCard}
        label="Compras"
        count={purchases.length}
      />

      <div className="px-5 pb-4 pt-2">
        {purchases.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-5 text-center text-xs text-muted-foreground">
            Sin compras registradas
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            {purchases.map((purchase, index) => {
              const statusCfg =
                PAYMENT_STATUS_CONFIG[purchase.status] ?? PAYMENT_STATUS_CONFIG.pending;
              return (
                <div
                  key={purchase.id}
                  className={`flex items-center gap-2 px-4 py-3 ${
                    index < purchases.length - 1 ? "border-b border-border/60" : ""
                  }`}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground">
                        {PLAN_NAMES[purchase.plan_type] ?? purchase.plan_type}
                      </span>
                      <Badge
                        variant={statusCfg.variant}
                        className="h-5 shrink-0 rounded px-2 text-[11px] font-medium"
                      >
                        {statusCfg.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(purchase.created_at), "d MMM yyyy, h:mm a", {
                        locale: es,
                      })}
                    </span>
                    {purchase.paypal_order_id ? (
                      <span
                        className="font-mono text-[11px] text-muted-foreground/50"
                        title={purchase.paypal_order_id}
                      >
                        {truncateId(purchase.paypal_order_id)}
                      </span>
                    ) : null}
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-right text-sm font-semibold tabular-nums text-foreground">
                    ${purchase.amount}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
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

      <DetailSheetSectionHeader
        icon={CalendarCheck}
        label="Reservas"
        count={bookings.length}
      />

      <div className="px-5 pb-6 pt-2">
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
                  className={`flex flex-col gap-2 px-4 py-3 ${
                    index < bookings.length - 1 ? "border-b border-border/60" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant={statusCfg.variant}
                      className="h-5 rounded px-2 text-[11px] font-medium"
                    >
                      {statusCfg.label}
                    </Badge>
                    {booking.cal_booking_id ? (
                      <span
                        className="font-mono text-[11px] text-muted-foreground/50"
                        title={`Cal #${booking.cal_booking_id}`}
                      >
                        Cal #{truncateId(booking.cal_booking_id, 8, 4)}
                      </span>
                    ) : null}
                  </div>
                  {booking.scheduled_date ? (
                    <span className="text-sm font-medium text-foreground">
                      {format(new Date(booking.scheduled_date), "d 'de' MMMM yyyy, h:mm a", {
                        locale: es,
                      })}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin fecha agendada</span>
                  )}
                  {booking.rustdesk_id ? (
                    <span className="font-mono text-xs text-muted-foreground/70">
                      RustDesk: {booking.rustdesk_id}
                    </span>
                  ) : null}
                  {booking.notes ? (
                    <p className="break-words border-t border-border/40 pt-2 text-xs leading-relaxed text-muted-foreground">
                      {booking.notes}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

interface ClienteDetailSheetProps {
  customer: CustomerWithPurchaseCount;
}

export default function ClienteDetailSheet({ customer }: ClienteDetailSheetProps) {
  const displayName = customer.name ?? customer.email;

  const fetchData = useCallback(
    () => getCustomerDetailsAction(customer.id),
    [customer.id],
  );

  const { open, isPending, error, data, handleOpenChange, retry } = useDetailSheet({
    fetchData,
  });

  return (
    <DetailSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Detalles del cliente"
      description={displayName}
      trigger={
        <button
          type="button"
          onClick={() => handleOpenChange(true)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Ver detalles de ${displayName}`}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      }
      isPending={isPending}
      error={error}
      data={data}
      onRetry={retry}
      loadingContent={<DetailsSkeleton />}
      renderContent={(details) => <SheetDetailsContent details={details} />}
    />
  );
}
