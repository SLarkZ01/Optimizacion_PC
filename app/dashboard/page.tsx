import { Suspense } from "react";
import {
  Users,
  CreditCard,
  CalendarCheck,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardKPIs, getDashboardChartData } from "@/lib/dashboard";
import ComprasRecientesTable from "@/components/dashboard/ComprasRecientesTable";
import {
  IngresosChartDynamic,
  PlanDistributionChartDynamic,
} from "@/components/dashboard/ChartsClientLoader";

// Formato de moneda USD
function formatUSD(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Componente de tarjeta de KPI
function KPICard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="mt-1 flex items-center text-xs text-muted-foreground">
            <TrendingUp className="mr-1 h-3 w-3 text-accent" />
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Skeleton individual de KPI
function KPISkeleton() {
  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="mt-2 h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function ChartsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-7">
      <Card className="min-w-0 overflow-hidden border-border/50 bg-card/80 lg:col-span-4">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <Skeleton className="h-[220px] w-full sm:h-[300px]" />
        </CardContent>
      </Card>
      <Card className="min-w-0 overflow-hidden border-border/50 bg-card/80 lg:col-span-3">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <Skeleton className="h-[200px] w-full sm:h-[250px]" />
        </CardContent>
      </Card>
    </div>
  );
}

// --- Suspense boundary 1: los 4 KPIs ---
// Fetches KPIs rápidos (3 conteos) + ingresos (agregación) en paralelo.
// Ambas funciones están wrapped en React.cache(), sin doble fetch.
async function KPIsContent() {
  // Parallel fetch — cache() asegura deduplicación si ChartsContent se monta a la vez
  const [kpis, chartData] = await Promise.all([
    getDashboardKPIs(),
    getDashboardChartData(),
  ]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Clientes"
        value={kpis.totalClientes}
        icon={Users}
        description="Registrados en el sistema"
      />
      <KPICard
        title="Total Compras"
        value={kpis.totalCompras}
        icon={CreditCard}
        description="Todas las transacciones"
      />
      <KPICard
        title="Total Reservas"
        value={kpis.totalReservas}
        icon={CalendarCheck}
        description="Sesiones agendadas"
      />
      <KPICard
        title="Ingresos Totales"
        value={formatUSD(chartData.ingresosTotales)}
        icon={DollarSign}
        description="Solo compras completadas"
      />
    </div>
  );
}

// --- Suspense boundary 2: gráficas + compras recientes ---
async function ChartsContent() {
  const chartData = await getDashboardChartData();

  return (
    <div className="space-y-6">
      {/* Gráficos — en móvil apilados, en lg side-by-side */}
      <div className="grid gap-4 lg:grid-cols-7">
        <div className="min-w-0 lg:col-span-4">
          <IngresosChartDynamic data={chartData.comprasPorMes} />
        </div>
        <div className="min-w-0 lg:col-span-3">
          <PlanDistributionChartDynamic data={chartData.comprasPorPlan} />
        </div>
      </div>

      {/* Compras recientes */}
      <ComprasRecientesTable compras={chartData.comprasRecientes} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resumen</h1>
        <p className="text-muted-foreground">
          Vista general del negocio de PCOptimize
        </p>
      </div>

      {/* Boundary 1: 4 KPIs */}
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <KPISkeleton key={i} />
            ))}
          </div>
        }
      >
        <KPIsContent />
      </Suspense>

      {/* Boundary 2: gráficas + compras recientes */}
      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsContent />
      </Suspense>
    </div>
  );
}
