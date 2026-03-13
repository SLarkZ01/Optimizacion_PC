"use client";

import { useMemo } from "react";
import { Pie, PieChart, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PLAN_NAMES, PLAN_COLORS } from "@/lib/constants";

interface PlanDistributionChartProps {
  data: { plan: string; total: number; ingresos: number }[];
}

const chartConfig = {
  basic: {
    label: "Básico",
    color: "var(--color-chart-1)",
  },
  gamer: {
    label: "Gamer",
    color: "var(--color-chart-2)",
  },
  premium: {
    label: "Premium",
    color: "var(--color-chart-3)",
  },
} satisfies ChartConfig;

const PlanDistributionChart = ({ data }: PlanDistributionChartProps) => {
  // Memoizar transformaciones — solo recalculan cuando `data` cambia (P3)
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        name: PLAN_NAMES[d.plan] ?? d.plan,
        plan: d.plan,
        value: d.total,
        ingresos: d.ingresos,
      })),
    [data],
  );

  const totalCompras = useMemo(
    () => chartData.reduce((sum, d) => sum + d.value, 0),
    [chartData],
  );

  return (
    <Card className="min-w-0 overflow-hidden border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle>Distribución por Plan</CardTitle>
        <CardDescription>
          Cantidad de compras por tipo de plan
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {chartData.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-center text-sm text-muted-foreground sm:h-[300px]">
            No hay datos suficientes para mostrar el gráfico
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Resumen textual para lectores de pantalla */}
            <p className="sr-only">
              Gráfico circular: distribución de compras por plan.{" "}
              {chartData.map((d) => `${d.name}: ${d.value} compras (${totalCompras > 0 ? Math.round((d.value / totalCompras) * 100) : 0}%)`).join(", ")}.
            </p>
            {/* Versión móvil: radios reducidos, altura menor */}
            <div className="sm:hidden">
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <PieChart accessibilityLayer>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          `${value} compras`,
                          name,
                        ]}
                      />
                    }
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.plan}
                        fill={PLAN_COLORS[entry.plan] ?? "var(--color-chart-4)"}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            {/* Versión desktop: radios normales, altura completa */}
            <div className="hidden sm:block">
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <PieChart accessibilityLayer>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          `${value} compras`,
                          name,
                        ]}
                      />
                    }
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.plan}
                        fill={PLAN_COLORS[entry.plan] ?? "var(--color-chart-4)"}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            {/* Leyenda personalizada */}
            <div className="flex flex-wrap justify-center gap-3 pt-2 sm:gap-4">
              {chartData.map((entry) => (
                <div key={entry.plan} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        PLAN_COLORS[entry.plan] ?? "var(--color-chart-4)",
                    }}
                  />
                  <span className="text-xs text-muted-foreground sm:text-sm">
                    {entry.name}: {entry.value} (
                    {totalCompras > 0
                      ? Math.round((entry.value / totalCompras) * 100)
                      : 0}
                    %)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanDistributionChart;
