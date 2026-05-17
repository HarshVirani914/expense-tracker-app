"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { MONEY_SEMANTICS } from "@/lib/money-semantics";
import { cn } from "@/lib/utils";
import {
  IconCash,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import type { GroupBalance } from "../types";

type GroupBalancesCardProps = {
  balances: GroupBalance[];
  userBalance: GroupBalance | undefined;
  isLoading: boolean;
  hasExpenses: boolean;
  onQuickSettle: (balance: GroupBalance) => void;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const GroupBalancesCard = ({
  balances,
  userBalance,
  isLoading,
  hasExpenses,
  onQuickSettle,
}: GroupBalancesCardProps) => {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Member balances</CardTitle>
          <CardDescription className="text-xs">
            {MONEY_SEMANTICS.groupMemberBalancesSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (balances.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Member balances</CardTitle>
          <CardDescription className="text-xs">
            {MONEY_SEMANTICS.groupMemberBalancesSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No balance information</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Member balances</CardTitle>
        <CardDescription className="text-xs">
          {MONEY_SEMANTICS.groupMemberBalancesSubtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {balances.map((balance) => {
            const owesToUser = balance.owesTo.find(
              (d) => d.memberId === userBalance?.memberId,
            );
            const owedByUser = balance.owedBy.find(
              (c) => c.memberId === userBalance?.memberId,
            );

            return (
              <div
                key={balance.memberId}
                className="flex items-center gap-3 p-3 rounded-lg border shadow-none bg-card hover:bg-foreground/5 transition-colors"
              >
                <Avatar
                  className={cn(
                    "h-10 w-10 shrink-0",
                    getAvatarColor(balance.memberName),
                  )}
                >
                  <AvatarFallback className="text-white font-semibold bg-transparent">
                    {getInitials(balance.memberName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-base truncate">
                    {balance.memberName}
                  </p>
                  {owedByUser && (
                    <div className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
                      <IconTrendingDown className="h-3.5 w-3.5" />
                      <span>
                        You owe them {formatCurrency(owedByUser.amount)}
                      </span>
                    </div>
                  )}
                  {owesToUser && (
                    <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                      <IconTrendingUp className="h-3.5 w-3.5" />
                      <span>
                        They owe you {formatCurrency(owesToUser.amount)}
                      </span>
                    </div>
                  )}
                  {!owesToUser && !owedByUser && (
                    <p className="text-sm text-muted-foreground">Settled up</p>
                  )}
                </div>

                {(owesToUser || owedByUser) && hasExpenses && (
                  <Button
                    size="sm"
                    variant={owedByUser ? "default" : "outline"}
                    className="gap-1.5 shrink-0"
                    onClick={() => onQuickSettle(balance)}
                  >
                    <IconCash className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Settle</span>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
