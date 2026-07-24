"use client";

import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { MONEY_SEMANTICS } from "@/lib/money-semantics";
import { memo } from "react";

type HeroBalanceCardProps = {
  totalAccountBalance: number;
  monthlyNet: number;
  totalIncome: number;
  totalExpenses: number;
  userName?: string;
};

export const HeroBalanceCard = memo(
  ({
    totalAccountBalance,
    monthlyNet,
    totalIncome,
    totalExpenses,
    userName,
  }: HeroBalanceCardProps) => {
    const isNetPositive = monthlyNet >= 0;
    const totalFlow = totalIncome + totalExpenses;
    const incomeRatio = totalFlow > 0 ? (totalIncome / totalFlow) * 100 : 50;

    return (
      <div className="relative overflow-hidden rounded-2xl border border-border grain-overlay">
        {/* Surface — white card in light, Revolut-style ink canvas in dark */}
        <div className="absolute inset-0 bg-card" />

        {/* Ambient glow — cobalt top-right, teal bottom-left */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl dark:bg-primary/25" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-chart-2/8 blur-3xl dark:bg-chart-2/12" />

        {/* Hairline cobalt top border */}
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary/35 to-transparent dark:via-primary/60" />

        <div className="relative px-5 pt-5 pb-4 md:px-7 md:pt-7 md:pb-5">
          {/* Greeting */}
          {userName && (
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground dark:text-white/70">
              Good day, {userName}
            </p>
          )}

          {/* Label */}
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground dark:text-white/70">
            Total balance
          </p>

          {/* Balance — Manrope display with tabular digits, the hero element */}
          <div className="font-display text-[2.75rem] font-bold leading-none tracking-tight text-foreground md:text-6xl">
            {formatCurrency(totalAccountBalance)}
          </div>

          {/* Monthly net pill */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                isNetPositive
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-300"
                  : "border-red-500/30 bg-red-500/10 text-red-700 dark:border-red-400/30 dark:bg-red-400/15 dark:text-red-300",
              )}
            >
              {isNetPositive ? (
                <IconTrendingUp className="h-3.5 w-3.5" />
              ) : (
                <IconTrendingDown className="h-3.5 w-3.5" />
              )}
              <span className="text-muted-foreground dark:text-white/70">
                {MONEY_SEMANTICS.heroMonthNetChip}
              </span>
              <span className="tabular-nums">
                {isNetPositive ? "+" : ""}
                {formatCurrency(monthlyNet)}
              </span>
            </div>
          </div>

          {/* Income vs Expense ratio bar */}
          {totalFlow > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex overflow-hidden rounded-full h-1 bg-foreground/10">
                <div
                  className="h-full rounded-l-full bg-emerald-500/80 transition-all duration-700 motion-reduce:transition-none dark:bg-emerald-400/70"
                  style={{ width: `${incomeRatio}%` }}
                />
                <div className="h-full flex-1 rounded-r-full bg-red-500/60 dark:bg-red-400/50" />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground dark:text-white/70">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500/80 dark:bg-emerald-400/70" />
                  {formatCurrency(totalIncome)}
                </span>
                <span className="flex items-center gap-1.5">
                  {formatCurrency(totalExpenses)}
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500/60 dark:bg-red-400/50" />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

HeroBalanceCard.displayName = "HeroBalanceCard";
