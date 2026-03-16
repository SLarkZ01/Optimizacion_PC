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
import { Users, Mail, Globe } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import SearchInput from "@/components/dashboard/SearchInput";
import Pagination from "@/components/dashboard/Pagination";
import ClienteDetailSheet from "@/components/dashboard/ClienteDetailSheet";

/**
 * Genera la URL del SVG de bandera en Twemoji CDN para un código ISO 3166-1 alpha-2.
 * Los emojis de bandera son dos Regional Indicator Symbols consecutivos.
 * Twemoji los sirve como "{codepoint1}-{codepoint2}.svg" en jsDelivr.
 * Ej: "CO" → U+1F1E8 U+1F1F4 → "1f1e8-1f1f4.svg"
 *
 * Se usa jsDelivr como CDN de Twemoji porque es la fuente oficial y gratuita.
 * La función es pura — hoistada al nivel de módulo (regla server-hoist-static-io).
 */
function countryCodeToFlagUrl(code: string): string {
  const points = code
    .toUpperCase()
    .split("")
    .map((char) => (0x1f1e6 + char.charCodeAt(0) - 65).toString(16));
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${points.join("-")}.svg`;
}

/**
 * Resuelve el nombre completo del país en español usando Intl.DisplayNames.
 * Se ejecuta en el Server Component — cero impacto en el bundle del cliente.
 * La instancia se hoista al módulo para crearse una sola vez (server-hoist-static-io).
 * Ej: "CO" → "Colombia", "US" → "Estados Unidos"
 */
const countryDisplayNames = new Intl.DisplayNames(["es"], { type: "region" });
function countryCodeToName(code: string): string {
  try {
    return countryDisplayNames.of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

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
                    <TableHead>País</TableHead>
                    <TableHead>Compras</TableHead>
                    <TableHead>Registrado</TableHead>
                    <TableHead className="w-10" />
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
                         {customer.country_code ? (
                           <div className="flex items-center gap-2">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img
                               src={countryCodeToFlagUrl(customer.country_code)}
                               alt={`Bandera de ${countryCodeToName(customer.country_code)}`}
                               width={20}
                               height={15}
                               className="rounded-sm object-cover"
                               style={{ width: 20, height: 15 }}
                             />
                             <span className="text-sm">
                               {countryCodeToName(customer.country_code)}
                             </span>
                           </div>
                         ) : (
                           <div className="flex items-center gap-1.5 text-muted-foreground">
                             <Globe className="h-3.5 w-3.5" />
                             <span className="text-sm">—</span>
                           </div>
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
                      <TableCell className="text-right">
                        <ClienteDetailSheet customer={customer} />
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
