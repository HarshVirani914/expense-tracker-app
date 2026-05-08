"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GroupBalance } from "../types";

type UserBalanceCardProps = {
  userBalance: GroupBalance | undefined;
  isLoading: boolean;
};

export const UserBalanceCard = ({ userBalance, isLoading }: UserBalanceCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Your Balance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : userBalance ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Net Balance</span>
              <div
                className={cn(
                  "text-4xl font-bold",
                  userBalance.netBalance > 0
                    ? "text-green-600 dark:text-green-400"
                    : userBalance.netBalance < 0
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {userBalance.netBalance > 0 && "+"}
                {formatCurrency(Math.abs(userBalance.netBalance))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">You paid</div>
                <div className="text-xl font-semibold">
                  {formatCurrency(userBalance.totalPaid)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Your share</div>
                <div className="text-xl font-semibold">
                  {formatCurrency(userBalance.totalOwed)}
                </div>
              </div>
            </div>

            <div className="pt-2">
              {userBalance.netBalance > 0.01 && (
                <p className="text-sm text-muted-foreground">
                  You are owed {formatCurrency(userBalance.netBalance)}
                </p>
              )}
              {userBalance.netBalance < -0.01 && (
                <p className="text-sm text-muted-foreground">
                  You owe {formatCurrency(Math.abs(userBalance.netBalance))}
                </p>
              )}
              {Math.abs(userBalance.netBalance) < 0.01 && (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ✓ All settled up!
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No balance data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
