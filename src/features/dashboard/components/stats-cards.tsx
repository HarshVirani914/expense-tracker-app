"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { MONEY_SEMANTICS } from "@/lib/money-semantics";
import {
  IconCategory,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import { memo } from "react";
import type { MonthlyStats } from "../types";

type StatsCardsProps = {
  stats: MonthlyStats;
};

export const StatsCards = memo(({ stats }: StatsCardsProps) => {
  const topCategory = stats.topCategories[0];

  return (
    <div className="grid grid-cols-1 gap-4 @xl/dashboard:grid-cols-2 @4xl/dashboard:grid-cols-3">
      <Card className="relative overflow-hidden shadow-none">
        <div className="absolute inset-0 bg-linear-to-br from-red-500/5 to-transparent" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <IconTrendingDown className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            Total Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 tabular-nums">
            {formatCurrency(stats.totalExpenses)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {MONEY_SEMANTICS.statsThisMonthExpenses}
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden shadow-none">
        <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-transparent" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <IconTrendingUp className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
            Total Income
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 tabular-nums">
            {formatCurrency(stats.totalIncome)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {MONEY_SEMANTICS.statsThisMonthIncome}
          </p>
        </CardContent>
      </Card>

      <Card className="relative col-span-1 overflow-hidden shadow-none @xl/dashboard:col-span-2 @4xl/dashboard:col-span-1">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <IconCategory className="h-4 w-4 shrink-0 text-primary" />
            Top spending
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-2">
          {topCategory ? (
            <>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: topCategory.color }}
                />
                <span className="text-sm font-medium leading-tight truncate">
                  {topCategory.name}
                </span>
              </div>
              <p className="text-3xl font-bold tabular-nums">
                {formatCurrency(topCategory.total)}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No expense activity this month
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {MONEY_SEMANTICS.statsTopCategory}
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

StatsCards.displayName = "StatsCards";
