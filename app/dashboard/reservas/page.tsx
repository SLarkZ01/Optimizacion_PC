import { Suspense } from "react";
import { getBookings, PAGE_SIZE } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { BookingWithPurchase } from "@/lib/dashboard";
import { PLAN_NAMES } from "@/lib/constants";
import SearchInput from "@/components/dashboard/SearchInput";
import Pagination from "@/components/dashboard/Pagination";
import { BOOKING_STATUS_CONFIG } from "@/lib/dashboard/constants";

// Nombres de planes en español — importado de lib/constants (fuente única)

interface ReservasPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

async function ReservasContent({
  page,
  search,
}: {
  page: number;
  search: string;
}) {
  const result = await getBookings(page, search);
  const { data: bookings, total, totalPages } = result;

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            <CardTitle>Todas las Reservas</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput placeholder="Buscar por nombre o email..." />
            <Badge variant="secondary">{total} total</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CalendarCheck className="mb-2 h-10 w-10" />
            <p>
              {search
                ? `Sin resultados para "${search}"`
                : "No hay reservas agendadas aún"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Fecha Agendada</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>RustDesk ID</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead>Creada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking: BookingWithPurchase) => {
                    const statusConfig = BOOKING_STATUS_CONFIG[booking.status];
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {booking.purchases?.customers?.name ?? "Sin nombre"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.purchases?.customers?.email ?? "—"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {booking.purchases ? (
                            <Badge variant="outline">
                              {PLAN_NAMES[booking.purchases.plan_type] ??
                                booking.purchases.plan_type}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {booking.scheduled_date ? (
                            <span className="text-sm">
                              {format(
                                new Date(booking.scheduled_date),
                                "d MMM yyyy, h:mm a",
                                { locale: es },
                              )}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Sin agendar
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {booking.rustdesk_id ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {booking.notes ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(booking.created_at), "d MMM yyyy", {
                            locale: es,
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ReservasSkeleton() {
  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-full sm:w-56" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Fila de cabecera simulada */}
        <div className="flex gap-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

export default async function ReservasPage({ searchParams }: ReservasPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.q ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reservas</h1>
        <p className="text-muted-foreground">
          Sesiones de optimización agendadas por los clientes
        </p>
      </div>

      <Suspense fallback={<ReservasSkeleton />} key={`${page}-${search}`}>
        <ReservasContent page={page} search={search} />
      </Suspense>
    </div>
  );
}
