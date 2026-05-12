"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import type { GroupBalance } from "../types";

type UserBalanceCardProps = {
  userBalance: GroupBalance | undefined;
  isLoading: boolean;
};

export const UserBalanceCard = ({
  userBalance,
  isLoading,
}: UserBalanceCardProps) => {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Your Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!userBalance) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Your Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No balance data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isOwed = userBalance.netBalance > 0.01;
  const owes = userBalance.netBalance < -0.01;
  const settled = Math.abs(userBalance.netBalance) < 0.01;

  return (
    <Card className="h-full shadow-none overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Your Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground font-medium">
              Net Balance
            </span>
            {isOwed && (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <IconTrendingUp className="h-3 w-3" />
                <span>Owed to you</span>
              </div>
            )}
            {owes && (
              <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <IconTrendingDown className="h-3 w-3" />
                <span>You owe</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "text-5xl font-bold tracking-tight",
              isOwed && "text-green-600 dark:text-green-400",
              owes && "text-red-600 dark:text-red-400",
              settled && "text-muted-foreground",
            )}
          >
            {isOwed && "+"}
            {formatCurrency(Math.abs(userBalance.netBalance))}
          </div>
          {settled && (
            <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5">
              <span className="text-lg">✓</span>
              All settled up!
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              You Paid
            </div>
            <div className="text-xl font-semibold">
              {formatCurrency(userBalance.totalPaid)}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Your Share
            </div>
            <div className="text-xl font-semibold">
              {formatCurrency(userBalance.totalOwed)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
