import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPricingLoading() {
  return (
    <div>
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-2 rounded-lg border border-border/50 bg-muted/20 p-3 sm:grid-cols-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, cardIndex) => (
                <div key={cardIndex} className="space-y-4 rounded-xl border border-border/60 bg-background/40 p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  {Array.from({ length: 2 }).map((__, rowIndex) => (
                    <div key={`${cardIndex}-${rowIndex}`} className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
