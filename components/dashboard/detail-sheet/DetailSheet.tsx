"use client";

import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DetailSheetErrorState } from "@/components/dashboard/detail-sheet/DetailSheetErrorState";

const SHEET_CONTENT_STYLE = {
  width: "460px",
  maxWidth: "calc(100vw - 16px)",
  gap: 0,
} as const;

const SCROLL_AREA_STYLE = {
  height: 0,
  flex: "1 1 0",
  overflowY: "auto",
  pointerEvents: "auto",
} as const;

interface DetailSheetProps<T> {
  open: boolean;
  onOpenChange: (nextOpen: boolean) => void;
  title: string;
  description: string;
  trigger: ReactNode;
  isPending: boolean;
  error: boolean;
  data: T | null;
  onRetry: () => void;
  loadingContent: ReactNode;
  renderContent: (data: T) => ReactNode;
  errorTitle?: string;
  errorDescription?: string;
}

export function DetailSheet<T>({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  isPending,
  error,
  data,
  onRetry,
  loadingContent,
  renderContent,
  errorTitle,
  errorDescription,
}: DetailSheetProps<T>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger}

      <SheetContent side="right" className="flex flex-col p-0" style={SHEET_CONTENT_STYLE}>
        <SheetHeader className="shrink-0 border-b px-5 py-4">
          <SheetTitle className="text-sm font-semibold">{title}</SheetTitle>
          <SheetDescription className="truncate text-xs">{description}</SheetDescription>
        </SheetHeader>

        <div style={SCROLL_AREA_STYLE}>
          {isPending ? loadingContent : null}

          {!isPending && error ? (
            <DetailSheetErrorState
              onRetry={onRetry}
              title={errorTitle}
              description={errorDescription}
            />
          ) : null}

          {!isPending && !error && data ? renderContent(data) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
