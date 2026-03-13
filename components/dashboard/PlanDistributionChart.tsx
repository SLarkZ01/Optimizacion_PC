"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
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
  total: {
    label: "Compras",
    color: "var(--color-chart-2)",
  },
  ingresos: {
    label: "Ingresos (USD)",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

// Singleton de Intl.NumberFormat para el tooltip — instanciado una sola vez (js-cache-function-results)
const tooltipUsdFormatter = new Intl.NumberFormat("en-US");

function tickFormatterUSD(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value}`;
}

function labelFormatterUSD(value: unknown): string {
  const n = Number(value);
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n}`;
}

// Formateador del tooltip hoisted a nivel de módulo — sin dependencias de props/estado (rerender-memo)
function tooltipFormatter(
  value: unknown,
  name: string | number,
): [string, string] {
  if (name === "ingresos")
    return [`$${tooltipUsdFormatter.format(Number(value))}`, "Ingresos (USD)"];
  return [String(value), "Compras"];
}

const PlanDistributionChart = ({ data }: PlanDistributionChartProps) => {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        name: PLAN_NAMES[d.plan] ?? d.plan,
        plan: d.plan,
        total: d.total,
        ingresos: d.ingresos,
      })),
    [data],
  );

  return (
    <Card className="min-w-0 overflow-hidden border-border/50 bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle>Distribución por Plan</CardTitle>
        <CardDescription>
          Ingresos y compras por tipo de plan
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1 pb-4 sm:px-6">
        {chartData.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-center text-sm text-muted-foreground">
            No hay datos suficientes para mostrar el gráfico
          </div>
        ) : (
          <>
            <p className="sr-only">
              Gráfico de barras por plan.{" "}
              {chartData
                .map((d) => `${d.name}: ${d.total} compras, $${d.ingresos} USD`)
                .join(", ")}
              .
            </p>

            {/* ── MÓVIL: barras de ingresos, sin eje Y, labels sobre barras ── */}
            <div className="sm:hidden">
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <BarChart
                  data={chartData}
                  accessibilityLayer
                  margin={{ top: 22, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={6}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis hide />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={tooltipFormatter} />
                    }
                  />
                  <Bar dataKey="ingresos" radius={[5, 5, 0, 0]} maxBarSize={64}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.plan}
                        fill={PLAN_COLORS[entry.plan] ?? "var(--color-chart-4)"}
                      />
                    ))}
                    <LabelList
                      dataKey="ingresos"
                      position="top"
                      formatter={labelFormatterUSD}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        fill: "var(--foreground)",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
              {/* Leyenda manual con colores reales por plan */}
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {chartData.map((entry) => (
                  <div key={entry.plan} className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor:
                          PLAN_COLORS[entry.plan] ?? "var(--color-chart-4)",
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── DESKTOP: barras agrupadas (ingresos + compras), dos ejes Y ── */}
            <div className="hidden sm:block">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart
                  data={chartData}
                  accessibilityLayer
                  margin={{ top: 20, right: 16, left: 0, bottom: 0 }}
                  barCategoryGap="28%"
                  barGap={3}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="ingresos"
                    orientation="left"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={tickFormatterUSD}
                    width={58}
                  />
                  <YAxis
                    yAxisId="total"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={30}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={tooltipFormatter} />
                    }
                  />
                  {/* Barra ingresos */}
                  <Bar
                    yAxisId="ingresos"
                    dataKey="ingresos"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={52}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={`ingresos-${entry.plan}`}
                        fill={PLAN_COLORS[entry.plan] ?? "var(--color-chart-4)"}
                      />
                    ))}
                    <LabelList
                      dataKey="ingresos"
                      position="top"
                      formatter={labelFormatterUSD}
                      style={{ fontSize: 11, fontWeight: 600, fill: "var(--foreground)" }}
                    />
                  </Bar>
                  {/* Barra compras (semitransparente) */}
                  <Bar
                    yAxisId="total"
                    dataKey="total"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={52}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={`total-${entry.plan}`}
                        fill={PLAN_COLORS[entry.plan] ?? "var(--color-chart-4)"}
                        opacity={0.4}
                      />
                    ))}
                    <LabelList
                      dataKey="total"
                      position="top"
                      style={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
              {/* Leyenda manual — colores reales por plan + descripción de series */}
              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                {chartData.map((entry) => (
                  <div key={entry.plan} className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor:
                          PLAN_COLORS[entry.plan] ?? "var(--color-chart-4)",
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {entry.name}
                    </span>
                  </div>
                ))}
                <div className="ml-2 flex items-center gap-3 border-l border-border/40 pl-2">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">■</span> Ingresos USD
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <span className="font-medium opacity-40">■</span> Compras
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanDistributionChart;
