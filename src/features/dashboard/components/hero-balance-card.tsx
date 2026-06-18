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
  ({ totalAccountBalance, monthlyNet, totalIncome, totalExpenses, userName }: HeroBalanceCardProps) => {
    const isNetPositive = monthlyNet >= 0;
    const totalFlow = totalIncome + totalExpenses;
    const incomeRatio = totalFlow > 0 ? (totalIncome / totalFlow) * 100 : 50;

    return (
      <div className="relative overflow-hidden rounded-2xl grain-overlay">
        {/* Dark canvas — always dark regardless of light/dark mode */}
        <div className="absolute inset-0 bg-[#080C16]" />

        {/* Ambient glow — gold top-right, navy-blue bottom-left */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#C9993F]/12 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl" />

        {/* Hairline gold top border */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C9993F]/50 to-transparent" />

        <div className="relative px-5 pt-5 pb-4 md:px-7 md:pt-7 md:pb-5">
          {/* Greeting */}
          {userName && (
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
              Good day, {userName}
            </p>
          )}

          {/* Label */}
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-white/40">
            Total balance
          </p>

          {/* Balance — Playfair Display, the hero element */}
          <div className="font-display text-[2.75rem] font-semibold leading-none tracking-tight text-white md:text-6xl">
            {formatCurrency(totalAccountBalance)}
          </div>

          {/* Monthly net pill */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                isNetPositive
                  ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                  : "border-red-400/25 bg-red-400/10 text-red-300",
              )}
            >
              {isNetPositive ? (
                <IconTrendingUp className="h-3.5 w-3.5" />
              ) : (
                <IconTrendingDown className="h-3.5 w-3.5" />
              )}
              <span className="text-white/50">{MONEY_SEMANTICS.heroMonthNetChip}</span>
              <span className="tabular-nums">
                {isNetPositive ? "+" : ""}
                {formatCurrency(monthlyNet)}
              </span>
            </div>
          </div>

          {/* Income vs Expense ratio bar */}
          {totalFlow > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex overflow-hidden rounded-full h-1 bg-white/8">
                <div
                  className="h-full rounded-l-full bg-emerald-400/70 transition-all duration-700"
                  style={{ width: `${incomeRatio}%` }}
                />
                <div className="h-full flex-1 rounded-r-full bg-red-400/50" />
              </div>
              <div className="flex justify-between text-[11px] text-white/35">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                  {formatCurrency(totalIncome)}
                </span>
                <span className="flex items-center gap-1.5">
                  {formatCurrency(totalExpenses)}
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400/50" />
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
