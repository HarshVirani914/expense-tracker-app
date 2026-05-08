"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  IconArrowDown,
  IconArrowUp,
  IconCash,
} from "@tabler/icons-react";
import type { GroupBalance } from "../types";

type GroupBalancesCardProps = {
  balances: GroupBalance[];
  userBalance: GroupBalance | undefined;
  isLoading: boolean;
  hasExpenses: boolean;
  onQuickSettle: (balance: GroupBalance) => void;
};

export const GroupBalancesCard = ({
  balances,
  userBalance,
  isLoading,
  hasExpenses,
  onQuickSettle,
}: GroupBalancesCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Balances</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : balances.length > 0 ? (
          <div className="space-y-3">
            {balances.map((balance) => {
              const owesToUser = balance.owesTo.find(
                (d) => d.memberId === userBalance?.memberId
              );
              const owedByUser = balance.owedBy.find(
                (c) => c.memberId === userBalance?.memberId
              );

              return (
                <div
                  key={balance.memberId}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div
                    className={cn(
                      "rounded-full p-2.5 shrink-0",
                      owesToUser
                        ? "bg-destructive/10 text-destructive"
                        : owedByUser
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {owesToUser ? (
                      <IconArrowUp className="h-4 w-4" />
                    ) : owedByUser ? (
                      <IconArrowDown className="h-4 w-4" />
                    ) : (
                      <IconCash className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-base">{balance.memberName}</p>
                    {owesToUser && (
                      <p className="text-sm text-muted-foreground">
                        Owes you {formatCurrency(owesToUser.amount)}
                      </p>
                    )}
                    {owedByUser && (
                      <p className="text-sm text-muted-foreground">
                        You owe {formatCurrency(owedByUser.amount)}
                      </p>
                    )}
                    {!owesToUser && !owedByUser && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Settled up
                      </p>
                    )}
                  </div>

                  {(owesToUser || owedByUser) && hasExpenses && (
                    <Button
                      size="sm"
                      variant={owedByUser ? "default" : "outline"}
                      className="gap-1.5 shrink-0 h-9"
                      onClick={() => onQuickSettle(balance)}
                    >
                      <IconCash className="h-3.5 w-3.5" />
                      Settle
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No balance information</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
