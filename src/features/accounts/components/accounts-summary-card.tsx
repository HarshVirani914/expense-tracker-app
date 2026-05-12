"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  IconTrendingUp,
  IconWallet,
  IconBuildingBank,
  IconCreditCard,
  IconCash,
} from "@tabler/icons-react";
import { memo } from "react";
import type { AccountWithBalance } from "../types";
import { AccountType } from "@/types/prisma";

type AccountsSummaryCardProps = {
  accounts: AccountWithBalance[];
};

export const AccountsSummaryCard = memo(
  ({ accounts }: AccountsSummaryCardProps) => {
    const totalBalance = accounts.reduce(
      (sum, account) => sum + account.currentBalance,
      0,
    );

    const accountsByType = accounts.reduce(
      (acc, account) => {
        acc[account.type] = (acc[account.type] || 0) + account.currentBalance;
        return acc;
      },
      {} as Record<string, number>,
    );

    const accountTypeInfo = [
      {
        type: AccountType.SAVINGS,
        label: "Savings",
        icon: IconBuildingBank,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-500/10",
      },
      {
        type: AccountType.CURRENT,
        label: "Current",
        icon: IconBuildingBank,
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-500/10",
      },
      {
        type: AccountType.WALLET,
        label: "Wallet",
        icon: IconWallet,
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-500/10",
      },
      {
        type: AccountType.CREDIT_CARD,
        label: "Credit Card",
        icon: IconCreditCard,
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-500/10",
      },
      {
        type: AccountType.CASH,
        label: "Cash",
        icon: IconCash,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
      },
    ];

    return (
      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-primary/10 via-primary/5 to-background shadow-none">
        <div className="absolute inset-0 bg-grid-white/10 mask-[radial-gradient(white,transparent_70%)]" />

        <div className="relative p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                Total Balance
              </p>
              <div className="text-4xl font-bold tracking-tight font-mono">
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-sm text-muted-foreground">
                Across {accounts.length}{" "}
                {accounts.length === 1 ? "account" : "accounts"}
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <IconWallet className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {accountTypeInfo.map(({ type, label, icon: Icon, color, bg }) => {
              const balance = accountsByType[type] || 0;
              if (balance === 0) return null;

              return (
                <div key={type} className={cn("rounded-lg p-3 space-y-2", bg)}>
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", color)} />
                    <p className="text-xs font-medium text-muted-foreground">
                      {label}
                    </p>
                  </div>
                  <p className={cn("text-lg font-bold font-mono", color)}>
                    {formatCurrency(balance)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    );
  },
);

AccountsSummaryCard.displayName = "AccountsSummaryCard";
