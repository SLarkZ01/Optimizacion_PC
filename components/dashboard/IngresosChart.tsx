"use client";

import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  Line,
  ComposedChart,
  LabelList,
  XAxis,
  YAxis,
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface IngresosChartProps {
  data: { mes: string; total: number; ingresos: number }[];
}

const chartConfig = {
  ingresos: {
    label: "Ingresos (USD)",
    color: "var(--color-chart-1)",
  },
  total: {
    label: "Compras",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig;

// Singleton de Intl.NumberFormat para el tooltip — instanciado una sola vez (js-cache-function-results)
const tooltipUsdFormatter = new Intl.NumberFormat("en-US");

// Array de nombres de meses hoisted a nivel de módulo — evita re-allocación en cada llamada (js-cache-function-results)
const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function formatMes(mesKey: string, short = false): string {
  const [year, month] = mesKey.split("-");
  const mes = MESES[parseInt(month, 10) - 1];
  return short ? mes : `${mes} ${year}`;
}

function tickFormatterUSD(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value}`;
}

function tickFormatterCount(value: number): string {
  return String(value);
}

// Formatea el label sobre la barra en móvil: valor compacto
function labelFormatterBar(value: unknown): string {
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

const IngresosChart = ({ data }: IngresosChartProps) => {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        mesLabel: formatMes(d.mes),
        mesCorto: formatMes(d.mes, true),
      })),
    [data],
  );

  if (chartData.length === 0) {
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
      <CardContent className="px-1 pb-4 sm:px-6">
        {/* Accesibilidad */}
        <p className="sr-only">
          Gráfico combinado: ingresos y compras mensuales.{" "}
          {chartData
            .map((d) => `${d.mesLabel}: $${d.ingresos} USD, ${d.total} compras`)
            .join(", ")}.
        </p>

        {/* ── MÓVIL: sin ejes Y, labels sobre las barras, tooltip ── */}
        <div className="sm:hidden">
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ComposedChart
              data={chartData}
              accessibilityLayer
              margin={{ top: 20, right: 8, left: 8, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="mesCorto"
                tickLine={false}
                tickMargin={6}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              {/* Eje Y oculto — los valores van como label sobre la barra */}
              <YAxis hide />
              <ChartTooltip
                content={<ChartTooltipContent formatter={tooltipFormatter} />}
              />
              <Bar
                dataKey="ingresos"
                fill="var(--color-chart-1)"
                radius={[5, 5, 0, 0]}
              >
                <LabelList
                  dataKey="ingresos"
                  position="top"
                  formatter={labelFormatterBar}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    fill: "var(--color-chart-1)",
                  }}
                />
              </Bar>
            </ComposedChart>
          </ChartContainer>
          {/* Mini leyenda de color para móvil */}
          <div className="flex justify-center gap-4 pt-1">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-3 rounded-sm"
                style={{ background: "var(--color-chart-1)" }}
              />
              <span className="text-xs text-muted-foreground">Ingresos USD</span>
            </div>
          </div>
        </div>

        {/* ── DESKTOP: combo chart con dos ejes Y ── */}
        <div className="hidden sm:block">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ComposedChart
              data={chartData}
              accessibilityLayer
              margin={{ top: 4, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="mesLabel"
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
                tickFormatter={tickFormatterCount}
                width={32}
                allowDecimals={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent formatter={tooltipFormatter} />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                yAxisId="ingresos"
                dataKey="ingresos"
                fill="var(--color-chart-1)"
                radius={[5, 5, 0, 0]}
                maxBarSize={52}
              />
              <Line
                yAxisId="total"
                type="monotone"
                dataKey="total"
                stroke="var(--color-chart-2)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--color-chart-2)", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default IngresosChart;
