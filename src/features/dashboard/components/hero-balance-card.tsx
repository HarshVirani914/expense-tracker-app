"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useFeatureAccent } from "@/hooks/use-feature-accent";
import {
  IconTrendingDown,
  IconTrendingUp,
  IconWallet,
} from "@tabler/icons-react";
import { MONEY_SEMANTICS } from "@/lib/money-semantics";
import { memo } from "react";

type HeroBalanceCardProps = {
  totalAccountBalance: number;
  monthlyNet: number;
};

export const HeroBalanceCard = memo(
  ({ totalAccountBalance, monthlyNet }: HeroBalanceCardProps) => {
    const isNetPositive = monthlyNet >= 0;
    const accent = useFeatureAccent();

    return (
      <Card
        className={cn(
          "relative overflow-hidden border-0 shadow-none",
          accent.pageHeroTint,
        )}
      >
        <div className="absolute inset-0 bg-grid-white/10 mask-[radial-gradient(white,transparent_70%)]" />

        <div className="relative space-y-3 p-4 md:space-y-4 md:p-6">
          <div className="flex items-center gap-2">
            <IconWallet className={cn("h-5 w-5 shrink-0", accent.icon)} />
            <div>
              <p className="text-base leading-tight font-medium md:text-lg">
                Account balance
              </p>
              <p className="text-xs font-normal text-muted-foreground">
                {MONEY_SEMANTICS.heroAccountSubtitle}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-3xl font-bold tracking-tight md:text-4xl">
              {formatCurrency(totalAccountBalance)}
            </div>

            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm",
                isNetPositive
                  ? "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400"
                  : "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
              )}
            >
              {isNetPositive ? (
                <IconTrendingUp className="h-4 w-4 shrink-0" />
              ) : (
                <IconTrendingDown className="h-4 w-4 shrink-0" />
              )}
              <span>
                <span className="text-muted-foreground font-medium">
                  {MONEY_SEMANTICS.heroMonthNetChip}{" "}
                </span>
                <span className="font-semibold tabular-nums">
                  {isNetPositive ? "+" : ""}
                  {formatCurrency(monthlyNet)}
                </span>
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  },
);

HeroBalanceCard.displayName = "HeroBalanceCard";
