"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconCurrencyRupee, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { formatCurrency } from "@/lib/format";
import { memo } from "react";
import type { MonthlyStats } from "../types";

type StatsCardsProps = {
  stats: MonthlyStats;
};

export const StatsCards = memo(({ stats }: StatsCardsProps) => {

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <IconTrendingUp className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(stats.totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <IconTrendingDown className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          <IconCurrencyRupee className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${stats.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatCurrency(stats.netBalance)}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
    </div>
  );
});

StatsCards.displayName = "StatsCards";
