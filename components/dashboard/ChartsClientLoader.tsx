"use client";

// Cliente wrapper que carga recharts de forma diferida.
// `ssr: false` solo está permitido en Client Components — por eso este archivo
// existe separado del Server Component app/dashboard/page.tsx.

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Skeleton inline para cada gráfica mientras carga el bundle de recharts
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
  () => import("@/components/dashboard/IngresosChart"),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const PlanDistributionChartDynamic = dynamic(
  () => import("@/components/dashboard/PlanDistributionChart"),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
