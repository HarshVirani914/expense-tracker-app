"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { memo, useMemo } from "react";

type HeroBalanceCardProps = {
  balance: number;
  income: number;
  expenses: number;
  previousBalance?: number;
};

export const HeroBalanceCard = memo(
  ({ balance, income, expenses, previousBalance }: HeroBalanceCardProps) => {
    const { user } = useUser();

    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    };

    const percentageChange = useMemo(() => {
      if (!previousBalance || previousBalance === 0) return 0;
      return ((balance - previousBalance) / previousBalance) * 100;
    }, [balance, previousBalance]);

    const isPositiveTrend = percentageChange >= 0;

    return (
      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-primary/10 via-primary/5 to-background shadow-none">
        <div className="absolute inset-0 bg-grid-white/10 mask-[radial-gradient(white,transparent_70%)]" />

        <div className="relative p-6 space-y-4">
          <div>
            <p className="mt-1 text-lg font-medium">Total Balance</p>
          </div>

          <div className="space-y-2">
            <div className="text-4xl font-bold tracking-tight font-mono">
              {formatCurrency(balance)}
            </div>

            {percentageChange !== 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "gap-1",
                  isPositiveTrend
                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                    : "bg-red-500/10 text-red-700 dark:text-red-400",
                )}
              >
                {isPositiveTrend ? (
                  <IconTrendingUp className="h-3 w-3" />
                ) : (
                  <IconTrendingDown className="h-3 w-3" />
                )}
                {Math.abs(percentageChange).toFixed(1)}% vs last month
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="text-sm">
                <span className="text-muted-foreground">Income: </span>
                <span className="font-semibold text-green-700 dark:text-green-400">
                  {formatCurrency(income)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <div className="text-sm">
                <span className="text-muted-foreground">Expense: </span>
                <span className="font-semibold text-red-700 dark:text-red-400">
                  {formatCurrency(expenses)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  },
);

HeroBalanceCard.displayName = "HeroBalanceCard";
