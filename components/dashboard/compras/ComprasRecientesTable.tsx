import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ComprasRecientesRow } from "@/lib/server/dashboard/queries";
import { PLAN_NAMES, PAYMENT_STATUS_CONFIG } from "@/lib/config/site";

interface ComprasRecientesTableProps {
  compras: ComprasRecientesRow[];
}

// Singleton de Intl.NumberFormat — instanciado una sola vez a nivel de módulo (js-cache-function-results)
const usdFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

function formatUSD(amount: number): string {
  return usdFormatter.format(amount);
}

const ComprasRecientesTable = ({ compras }: ComprasRecientesTableProps) => {
  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Compras Recientes</CardTitle>
            <CardDescription>Últimas transacciones registradas</CardDescription>
          </div>
          <Link
            href="/dashboard/compras"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Ver todas
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {compras.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No hay compras recientes
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compras.map((purchase) => {
                  const statusConfig = PAYMENT_STATUS_CONFIG[purchase.status];
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
                        <Badge variant="outline">
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
        )}
      </CardContent>
    </Card>
  );
};

export default ComprasRecientesTable;
