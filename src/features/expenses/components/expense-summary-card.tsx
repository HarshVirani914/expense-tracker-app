"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useFeatureAccent } from "@/hooks/use-feature-accent";
import {
  IconCash,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import { memo } from "react";

type ExpenseSummaryCardProps = {
  totalExpenses: number;
  totalIncome: number;
  netAmount: number;
  expenseCount: number;
  incomeCount: number;
};

export const ExpenseSummaryCard = memo(
  ({
    totalExpenses,
    totalIncome,
    netAmount,
    expenseCount,
    incomeCount,
  }: ExpenseSummaryCardProps) => {
    const isPositive = netAmount >= 0;
    const accent = useFeatureAccent();

    return (
      <Card
        className={cn(
          "relative overflow-hidden border-0 shadow-none",
          accent.pageHeroTint,
        )}
      >
        <div className="absolute inset-0 bg-grid-white/10 mask-[radial-gradient(white,transparent_70%)]" />

        <div className="relative p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                Net Cash Flow
              </p>
              <div className="text-4xl font-bold tracking-tight font-mono">
                {formatCurrency(Math.abs(netAmount))}
              </div>
            </div>
            <div
              className={cn(
                "rounded-full p-3",
                isPositive
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400",
              )}
            >
              <IconCash className="h-6 w-6" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg bg-red-500/10 p-4">
              <div className="rounded-full bg-red-500/20 p-2">
                <IconTrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-medium">
                  Expenses
                </p>
                <p className="text-lg font-bold text-red-700 dark:text-red-400 font-mono">
                  {formatCurrency(totalExpenses)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {expenseCount}{" "}
                  {expenseCount === 1 ? "transaction" : "transactions"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg bg-green-500/10 p-4">
              <div className="rounded-full bg-green-500/20 p-2">
                <IconTrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-medium">
                  Income
                </p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400 font-mono">
                  {formatCurrency(totalIncome)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {incomeCount}{" "}
                  {incomeCount === 1 ? "transaction" : "transactions"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  },
);

ExpenseSummaryCard.displayName = "ExpenseSummaryCard";
