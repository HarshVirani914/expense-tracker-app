"use client";

import { formatCurrency } from "@/lib/format";
import { memo } from "react";
import type { MonthlyStats } from "../types";

type StatsCardsProps = {
  stats: MonthlyStats;
};

// Income, expenses, and the net ratio already live in the hero balance card,
// so this surfaces only what the hero does not: the top spending category.
export const StatsCards = memo(({ stats }: StatsCardsProps) => {
  const topCategory = stats.topCategories[0];

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card px-4 py-3.5 md:px-5 md:py-4">
      <div className="absolute inset-y-0 left-0 w-0.75 rounded-l-xl bg-primary" />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground md:text-[10px]">
            Top spend this month
          </p>
          {topCategory ? (
            <div className="mt-1.5 flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: topCategory.color }}
              />
              <p className="truncate text-xs text-muted-foreground md:text-sm">
                {topCategory.name}
              </p>
            </div>
          ) : (
            <p className="mt-1.5 text-sm text-muted-foreground">None yet</p>
          )}
        </div>
        {topCategory && (
          <p className="shrink-0 text-xl font-bold tabular-nums md:text-2xl">
            {formatCurrency(topCategory.total)}
          </p>
        )}
      </div>
    </div>
  );
});

StatsCards.displayName = "StatsCards";
