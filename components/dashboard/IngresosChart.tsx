"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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

// Formatea "2026-01" → "Ene 2026" (completo) o "Ene" (corto para móvil)
function formatMes(mesKey: string, short = false): string {
  const [year, month] = mesKey.split("-");
  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  const mes = meses[parseInt(month, 10) - 1];
  return short ? mes : `${mes} ${year}`;
}

// Hoisted fuera del componente — referencia estable, sin re-creación en cada render (P8)
function tickFormatter(value: number): string {
  // Formato compacto: $1.2k en lugar de $1200 para ahorrar espacio horizontal
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value}`;
}

const IngresosChart = ({ data }: IngresosChartProps) => {
  // Datos para pantalla normal y etiquetas cortas para móvil
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        mesLabel: formatMes(d.mes),
        mesCorto: formatMes(d.mes, true),
      })),
    [data],
  );

  return (
    <Card className="min-w-0 overflow-hidden border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle>Ingresos por Mes</CardTitle>
        <CardDescription>
          Evolución de ingresos en los últimos meses
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {chartData.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-center text-sm text-muted-foreground sm:h-[300px]">
            No hay datos suficientes para mostrar el gráfico
          </div>
        ) : (
          <>
            {/* Versión móvil: etiquetas cortas, sin eje Y, altura reducida */}
            <div className="sm:hidden">
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <BarChart
                  data={chartData}
                  accessibilityLayer
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="mesCorto"
                    tickLine={false}
                    tickMargin={6}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={tickFormatter}
                    width={45}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="ingresos"
                    fill="var(--color-chart-1)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>

            {/* Versión desktop: etiquetas completas, con eje Y, altura normal */}
            <div className="hidden sm:block">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart
                  data={chartData}
                  accessibilityLayer
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="mesLabel"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={tickFormatter}
                    width={55}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="ingresos"
                    fill="var(--color-chart-1)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IngresosChart;
