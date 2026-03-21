"use client";

import { memo } from "react";
import type { ElementType } from "react";

interface DetailSheetSectionHeaderProps {
  icon: ElementType;
  label: string;
  count: number;
}

function DetailSheetSectionHeaderComponent({
  icon: Icon,
  label,
  count,
}: DetailSheetSectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-5 pb-2 pt-4">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="ml-auto rounded bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

export const DetailSheetSectionHeader = memo(DetailSheetSectionHeaderComponent);
