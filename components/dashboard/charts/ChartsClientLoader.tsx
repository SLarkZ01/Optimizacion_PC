"use client";

// Cliente wrapper que carga chart.js de forma diferida.
// `ssr: false` solo está permitido en Client Components — por eso este archivo
// existe separado del Server Component app/dashboard/page.tsx.
//
// Chart.js renderiza en <canvas>. El browser redimensiona el canvas con CSS
// sin pasar por React, por lo que expandir/colapsar el sidebar no genera
// re-renders de los gráficos.

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Skeleton mientras carga el bundle de chart.js
function ChartSkeleton() {
  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

export const IngresosChartDynamic = dynamic(
  () => import("@/components/dashboard/charts/IngresosChart"),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const PlanDistributionChartDynamic = dynamic(
  () => import("@/components/dashboard/charts/PlanDistributionChart"),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
