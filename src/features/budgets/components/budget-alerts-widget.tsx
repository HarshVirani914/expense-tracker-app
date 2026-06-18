"use client";

import { Card } from "@/components/ui/card";
import { IconChartPie, IconCheck } from "@tabler/icons-react";
import { useBudgetAlerts } from "../hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";

// SVG donut ring: r=15.9155 → circumference ≈ 100 for easy percentage math
const RING_R = 15.9155;
const RING_C = 2 * Math.PI * RING_R; // ≈ 100.0

function BudgetRing({
  pct,
  isExceeded,
  isWarning,
}: {
  pct: number;
  isExceeded: boolean;
  isWarning: boolean;
}) {
  const filled = RING_C * (pct / 100);
  const strokeColor = isExceeded
    ? "#ef4444"
    : isWarning
    ? "#f59e0b"
    : "#10b981";

  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg className="-rotate-90 h-full w-full" viewBox="0 0 36 36" aria-hidden>
        {/* Track */}
        <circle
          cx="18"
          cy="18"
          r={RING_R}
          fill="none"
          strokeWidth="3"
          className="stroke-muted"
        />
        {/* Progress arc */}
        <circle
          cx="18"
          cy="18"
          r={RING_R}
          fill="none"
          strokeWidth="3"
          stroke={strokeColor}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${RING_C}`}
          style={{ transition: "stroke-dasharray 0.7s ease" }}
        />
      </svg>
      {/* Percentage label in center */}
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums">
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

export const BudgetAlertsWidget = () => {
  const { alerts, isLoading } = useBudgetAlerts();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <IconChartPie className="h-5 w-5 shrink-0 text-primary" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <IconChartPie className="h-5 w-5 shrink-0 text-primary" />
            <h3 className="font-semibold text-lg">Budget Alerts</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <IconCheck className="h-4 w-4 shrink-0" />
            All budgets are on track
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <IconChartPie className="h-5 w-5 shrink-0 text-primary" />
            <h3 className="font-semibold text-lg">Budget Alerts</h3>
          </div>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {alerts.length}
          </span>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => {
            const { budget } = alert;
            const isExceeded = alert.alertType === "exceeded";
            const pct = Math.min(budget.percentageUsed, 100);
            const isWarning = !isExceeded && pct >= 80;

            return (
              <Link key={budget.id} href="/budgets" className="group block">
                <div className="flex items-center gap-3.5 rounded-xl border border-border/60 bg-card/60 p-3 transition-colors group-hover:bg-accent/40">
                  <BudgetRing
                    pct={pct}
                    isExceeded={isExceeded}
                    isWarning={isWarning}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight">
                      {budget.category.name}
                    </p>
                    <div className="mt-0.5 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium tabular-nums text-foreground">
                        {formatCurrency(budget.spent)}
                      </span>
                      <span className="tabular-nums">
                        of {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <p
                      className={
                        isExceeded
                          ? "mt-0.5 text-[10px] font-medium text-red-500"
                          : isWarning
                          ? "mt-0.5 text-[10px] font-medium text-amber-500"
                          : "hidden"
                      }
                    >
                      {isExceeded ? "Over budget" : "Approaching limit"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
