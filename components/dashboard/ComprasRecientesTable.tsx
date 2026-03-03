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
import type { ComprasRecientesRow } from "@/lib/dashboard";
import type { PaymentStatus } from "@/lib/database.types";
import { PLAN_NAMES } from "@/lib/constants";

interface ComprasRecientesTableProps {
  compras: ComprasRecientesRow[];
}

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  completed: { label: "Completado", variant: "default" },
  pending: { label: "Pendiente", variant: "secondary" },
  failed: { label: "Fallido", variant: "destructive" },
  refunded: { label: "Reembolsado", variant: "outline" },
};

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
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
          <a
            href="/dashboard/compras"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Ver todas
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
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
