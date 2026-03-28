"use client";

// Gráfica de Ingresos por Mes — implementada con Chart.js (canvas).
// Chart.js renderiza en <canvas>, por lo que los cambios de tamaño del
// contenedor (sidebar expand/collapse) son manejados por CSS sin ningún
// re-render de React — elimina el lag que causaba ResponsiveContainer de Recharts.

import { memo, useMemo } from "react";
import { Chart } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  usdFormatter,
  buildDualAxisScales,
} from "@/lib/dashboard/chart-utils";

// Importar el registro centralizado (efecto de módulo — se ejecuta una sola vez)
import "@/lib/dashboard/chart-utils";

interface IngresosChartProps {
  data: { mes: string; total: number; ingresos: number }[];
}

// Array de nombres de meses hoisted — sin re-allocación por render
const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function formatMes(mesKey: string, short = false): string {
  const [year, month] = mesKey.split("-");
  const mes = MESES[parseInt(month, 10) - 1];
  return short ? mes : `${mes} ${year}`;
}

function buildOptions(isMobile: boolean): ChartOptions<"bar"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    // Chart.js maneja el resize del canvas internamente con su propio ResizeObserver
    // que NO pasa por React — por eso no hay lag al cambiar el sidebar.
    animation: { duration: 400 },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: !isMobile,
        position: "bottom",
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          borderRadius: 3,
          useBorderRadius: true,
          padding: 16,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label(ctx) {
            if (ctx.dataset.label === "Ingresos (USD)") {
              return ` Ingresos: $${usdFormatter.format(Number(ctx.parsed.y))}`;
            }
            return ` Compras: ${ctx.parsed.y}`;
          },
        },
      },
    },
    scales: buildDualAxisScales(isMobile),
  };
}

const IngresosChart = memo(function IngresosChart({ data }: IngresosChartProps) {
  // Hook reactivo — no accede a window directamente durante render (rerender-dependencies)
  const isMobile = useIsMobile();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartData = useMemo<any>(() => {
    // Leer CSS vars de color del documento (solo disponibles en cliente)
    const style =
      typeof window !== "undefined"
        ? getComputedStyle(document.documentElement)
        : null;

    const color1 = style?.getPropertyValue("--color-chart-1").trim() || "hsl(142 71% 45%)";
    const color2 = style?.getPropertyValue("--color-chart-2").trim() || "hsl(213 94% 68%)";

    const labels = data.map((d) =>
      isMobile ? formatMes(d.mes, true) : formatMes(d.mes),
    );

    return {
      labels,
      datasets: [
        {
          type: "bar" as const,
          label: "Ingresos (USD)",
          data: data.map((d) => d.ingresos),
          backgroundColor: color1,
          borderRadius: 5,
          borderSkipped: false,
          yAxisID: "yIngresos",
          order: 2,
        },
        {
          type: "line" as const,
          label: "Compras",
          data: data.map((d) => d.total),
          borderColor: color2,
          backgroundColor: color2,
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0,
          yAxisID: "yTotal",
          order: 1,
        },
      ],
    };
  }, [data, isMobile]);

  const options = useMemo(() => buildOptions(isMobile), [isMobile]);

  if (data.length === 0) {
    return (
      <Card className="min-w-0 overflow-hidden border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle>Ingresos por Mes</CardTitle>
          <CardDescription>Evolución de ingresos y ventas mensuales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-center text-sm text-muted-foreground">
            No hay datos suficientes para mostrar el gráfico
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0 overflow-hidden border-border/50 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle>Ingresos por Mes</CardTitle>
        <CardDescription>
          Ingresos (USD) y cantidad de ventas por mes
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-4 sm:px-6">
        {/* Accesibilidad */}
        <p className="sr-only">
          Gráfico combinado: ingresos y compras mensuales.{" "}
          {data
            .map((d) => `${formatMes(d.mes)}: $${d.ingresos} USD, ${d.total} compras`)
            .join(", ")}.
        </p>

        {/* Canvas — Chart.js gestiona el resize internamente sin pasar por React */}
        <div className="h-[200px] w-full sm:h-[300px]">
          <Chart
            type="bar"
            data={chartData}
            options={options}
            aria-label="Gráfico de ingresos por mes"
          />
        </div>
      </CardContent>
    </Card>
  );
});

export default IngresosChart;
