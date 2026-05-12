"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconCurrencyRupee,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import { formatCurrency } from "@/lib/format";
import { memo } from "react";
import type { MonthlyStats } from "../types";
import { cn } from "@/lib/utils";

type StatsCardsProps = {
  stats: MonthlyStats;
};

export const StatsCards = memo(({ stats }: StatsCardsProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="relative overflow-hidden shadow-none">
        <div className="absolute inset-0 bg-linear-to-br from-red-500/5 to-transparent" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <div className="rounded-full bg-red-500/10 p-2">
            <IconTrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(stats.totalExpenses)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden shadow-none">
        <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-transparent" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <div className="rounded-full bg-green-500/10 p-2">
            <IconTrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(stats.totalIncome)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden sm:col-span-2 lg:col-span-1 shadow-none">
        <div
          className={cn("absolute inset-0 bg-linear-to-br", {
            "from-primary/5": stats.netBalance >= 0,
            "from-red-500/5": stats.netBalance < 0,
            "to-transparent": true,
          })}
        />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          <div
            className={cn("rounded-full p-2", {
              "bg-primary/10": stats.netBalance >= 0,
              "bg-red-500/10": stats.netBalance < 0,
            })}
          >
            <IconCurrencyRupee
              className={cn("h-4 w-4", {
                "text-primary": stats.netBalance >= 0,
                "text-red-600 dark:text-red-400": stats.netBalance < 0,
              })}
            />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div
            className={cn("text-3xl font-bold", {
              "text-green-600 dark:text-green-400": stats.netBalance >= 0,
              "text-red-600 dark:text-red-400": stats.netBalance < 0,
            })}
          >
            {formatCurrency(stats.netBalance)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">This month</p>
          {stats.netBalance >= 0 && (
            <Badge variant="secondary" className="mt-2 bg-green-500/10">
              Surplus
            </Badge>
          )}
          {stats.netBalance < 0 && (
            <Badge variant="secondary" className="mt-2 bg-red-500/10">
              Deficit
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

StatsCards.displayName = "StatsCards";
