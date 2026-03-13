"use client";

// Gráfica de Distribución por Plan — implementada con Chart.js (canvas).
// Canvas no genera re-renders de React al cambiar de tamaño — sin lag al
// expandir/colapsar el sidebar.

import { memo, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLAN_NAMES, PLAN_COLORS } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  usdFormatter,
  tickUSD,
  buildDualAxisScales,
} from "@/lib/chart-utils";

// Importar el registro centralizado (efecto de módulo — se ejecuta una sola vez)
import "@/lib/chart-utils";

interface PlanDistributionChartProps {
  data: { plan: string; total: number; ingresos: number }[];
}

function buildOptions(isMobile: boolean): ChartOptions<"bar"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: false, // Leyenda manual abajo para mantener colores por plan
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

const PlanDistributionChart = memo(function PlanDistributionChart({
  data,
}: PlanDistributionChartProps) {
  // Hook reactivo — no accede a window directamente durante render (rerender-dependencies)
  const isMobile = useIsMobile();

  const { chartData, planEntries } = useMemo(() => {
    const style =
      typeof window !== "undefined"
        ? getComputedStyle(document.documentElement)
        : null;

    const planEntries = data.map((d) => {
      const rawColor =
        style
          ?.getPropertyValue(
            PLAN_COLORS[d.plan]?.replace("var(", "").replace(")", "") ?? "",
          )
          .trim() || null;

      // Fallback a los colores reales del tema si la var no se resuelve
      const resolvedColor =
        rawColor ||
        (d.plan === "basic"
          ? "hsl(142 71% 45%)"
          : d.plan === "gamer"
            ? "hsl(213 94% 68%)"
            : "hsl(270 95% 75%)");

      return {
        plan: d.plan,
        name: PLAN_NAMES[d.plan] ?? d.plan,
        color: resolvedColor,
        total: d.total,
        ingresos: d.ingresos,
      };
    });

    const labels = planEntries.map((e) => e.name);

    const datasets = isMobile
      ? [
          {
            label: "Ingresos (USD)",
            data: planEntries.map((e) => e.ingresos),
            backgroundColor: planEntries.map((e) => e.color),
            borderRadius: 5,
            borderSkipped: false as const,
            yAxisID: "yIngresos",
          },
        ]
      : [
          {
            label: "Ingresos (USD)",
            data: planEntries.map((e) => e.ingresos),
            backgroundColor: planEntries.map((e) => e.color),
            borderRadius: 5,
            borderSkipped: false as const,
            yAxisID: "yIngresos",
            order: 1,
          },
          {
            label: "Compras",
            data: planEntries.map((e) => e.total),
            backgroundColor: planEntries.map((e) => {
              // Convertir hsl(...) a hsla(..., 0.4) para la barra semitransparente
              return e.color.startsWith("hsl(")
                ? e.color.replace("hsl(", "hsla(").replace(")", ", 0.4)")
                : e.color;
            }),
            borderRadius: 5,
            borderSkipped: false as const,
            yAxisID: "yTotal",
            order: 2,
          },
        ];

    return { chartData: { labels, datasets }, planEntries };
  }, [data, isMobile]);

  const options = useMemo(() => buildOptions(isMobile), [isMobile]);

  if (data.length === 0) {
    return (
      <Card className="min-w-0 overflow-hidden border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle>Distribución por Plan</CardTitle>
          <CardDescription>Ingresos y compras por tipo de plan</CardDescription>
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
        <CardTitle>Distribución por Plan</CardTitle>
        <CardDescription>Ingresos y compras por tipo de plan</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-4 sm:px-6">
        {/* Accesibilidad */}
        <p className="sr-only">
          Gráfico de barras por plan.{" "}
          {data
            .map(
              (d) =>
                `${PLAN_NAMES[d.plan] ?? d.plan}: ${d.total} compras, $${d.ingresos} USD`,
            )
            .join(", ")}
          .
        </p>

        {/* Canvas — Chart.js gestiona el resize sin pasar por React */}
        <div className="h-[200px] w-full sm:h-[280px]">
          <Bar
            data={chartData}
            options={options}
            aria-label="Gráfico de distribución por plan"
          />
        </div>

        {/* Leyenda manual con colores reales por plan */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {planEntries.map((entry) => (
            <div key={entry.plan} className="flex items-center gap-1.5">
              <div
                className="h-2 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
          ))}
          {!isMobile && (
            <div className="ml-2 flex items-center gap-3 border-l border-border/40 pl-2">
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">■</span> Ingresos USD
              </span>
              <span className="text-xs text-muted-foreground">
                <span className="font-medium opacity-40">■</span> Compras
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default PlanDistributionChart;
