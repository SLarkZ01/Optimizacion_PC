import { Suspense } from "react";
import { getCustomers, PAGE_SIZE } from "@/lib/dashboard";
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
import { Users, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import SearchInput from "@/components/dashboard/SearchInput";
import Pagination from "@/components/dashboard/Pagination";

interface ClientesPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

async function ClientesContent({
  page,
  search,
}: {
  page: number;
  search: string;
}) {
  const result = await getCustomers(page, search);
  const { data: customers, total, totalPages } = result;

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Todos los Clientes</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput placeholder="Buscar por nombre o email..." />
            <Badge variant="secondary">{total} total</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="mb-2 h-10 w-10" />
            <p>
              {search
                ? `Sin resultados para "${search}"`
                : "No hay clientes registrados aún"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Compras</TableHead>
                    <TableHead>Registrado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name ?? "Sin nombre"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{customer.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{customer.phone}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {customer.purchase_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(customer.created_at), "d MMM yyyy", {
                          locale: es,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
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

function ClientesSkeleton() {
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

export default async function ClientesPage({ searchParams }: ClientesPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.q ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">
          Gestiona y visualiza todos los clientes registrados
        </p>
      </div>

      <Suspense fallback={<ClientesSkeleton />} key={`${page}-${search}`}>
        <ClientesContent page={page} search={search} />
      </Suspense>
    </div>
  );
}
