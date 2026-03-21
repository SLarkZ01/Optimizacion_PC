"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetailSheetErrorStateProps {
  onRetry: () => void;
  title?: string;
  description?: string;
}

export function DetailSheetErrorState({
  onRetry,
  title = "Error al cargar los datos",
  description = "Verifica tu conexion e intenta nuevamente.",
}: DetailSheetErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-5 py-16 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={onRetry}
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        Reintentar
      </Button>
    </div>
  );
}
