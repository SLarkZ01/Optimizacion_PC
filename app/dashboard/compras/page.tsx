import { Suspense } from "react";
import { getPurchases, PAGE_SIZE } from "@/lib/dashboard";
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
import { CreditCard } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { PaymentStatus } from "@/lib/database.types";
import type { PurchaseWithCustomer } from "@/lib/dashboard";
import { PLAN_NAMES } from "@/lib/constants";
import SearchInput from "@/components/dashboard/SearchInput";
import Pagination from "@/components/dashboard/Pagination";

// Mapeo de estados de pago a variantes de badge y texto en español
const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  completed: { label: "Completado", variant: "default" },
  pending: { label: "Pendiente", variant: "secondary" },
  failed: { label: "Fallido", variant: "destructive" },
  refunded: { label: "Reembolsado", variant: "outline" },
};

// Nombres de planes en español — importado de lib/constants (fuente única)

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface ComprasPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

async function ComprasContent({
  page,
  search,
}: {
  page: number;
  search: string;
}) {
  const result = await getPurchases(page, search);
  const { data: purchases, total, totalPages } = result;

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>Todas las Compras</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput placeholder="Buscar por nombre o email..." />
            <Badge variant="secondary">{total} total</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CreditCard className="mb-2 h-10 w-10" />
            <p>
              {search
                ? `Sin resultados para "${search}"`
                : "No hay compras registradas aún"}
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
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>ID PayPal</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase: PurchaseWithCustomer) => {
                    const statusConfig = STATUS_CONFIG[purchase.status];
                    return (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {purchase.customers?.name ?? "Sin nombre"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {purchase.customers?.email ?? "—"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              purchase.plan_type === "gamer"
                                ? "border-secondary text-secondary"
                                : "border-primary text-primary"
                            }
                          >
                            {PLAN_NAMES[purchase.plan_type] ?? purchase.plan_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatUSD(purchase.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {purchase.paypal_order_id.slice(0, 12)}...
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(purchase.created_at), "d MMM yyyy", {
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

function ComprasSkeleton() {
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

export default async function ComprasPage({ searchParams }: ComprasPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.q ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compras</h1>
        <p className="text-muted-foreground">
          Historial completo de todas las transacciones
        </p>
      </div>

      <Suspense fallback={<ComprasSkeleton />} key={`${page}-${search}`}>
        <ComprasContent page={page} search={search} />
      </Suspense>
    </div>
  );
}
