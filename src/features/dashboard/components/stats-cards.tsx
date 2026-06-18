"use client";

import { formatCurrency } from "@/lib/format";
import { MONEY_SEMANTICS } from "@/lib/money-semantics";
import { memo } from "react";
import type { MonthlyStats } from "../types";

type StatsCardsProps = {
  stats: MonthlyStats;
};

export const StatsCards = memo(({ stats }: StatsCardsProps) => {
  const topCategory = stats.topCategories[0];

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      {/* Expenses */}
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card px-3 py-3.5 md:px-5 md:py-4">
        <div className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl bg-red-500" />
        <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground md:text-[10px]">
          Expenses
        </p>
        <p className="mt-1.5 truncate text-base font-bold tabular-nums text-red-600 dark:text-red-400 md:text-2xl">
          {formatCurrency(stats.totalExpenses)}
        </p>
        <p className="mt-0.5 hidden text-xs text-muted-foreground md:block">
          {MONEY_SEMANTICS.statsThisMonthExpenses}
        </p>
      </div>

      {/* Income */}
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card px-3 py-3.5 md:px-5 md:py-4">
        <div className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl bg-emerald-500" />
        <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground md:text-[10px]">
          Income
        </p>
        <p className="mt-1.5 truncate text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400 md:text-2xl">
          {formatCurrency(stats.totalIncome)}
        </p>
        <p className="mt-0.5 hidden text-xs text-muted-foreground md:block">
          {MONEY_SEMANTICS.statsThisMonthIncome}
        </p>
      </div>

      {/* Top category */}
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card px-3 py-3.5 md:px-5 md:py-4">
        <div className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl bg-[#C9993F]" />
        <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground md:text-[10px]">
          Top spend
        </p>
        {topCategory ? (
          <>
            <p className="mt-1.5 truncate text-base font-bold tabular-nums md:text-2xl">
              {formatCurrency(topCategory.total)}
            </p>
            <div className="mt-0.5 flex items-center gap-1">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: topCategory.color }}
              />
              <p className="truncate text-[9px] text-muted-foreground md:text-xs">
                {topCategory.name}
              </p>
            </div>
          </>
        ) : (
          <p className="mt-1.5 text-sm text-muted-foreground">None yet</p>
        )}
      </div>
    </div>
  );
});

StatsCards.displayName = "StatsCards";
