"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconChartPie, IconCheck } from "@tabler/icons-react";
import { useBudgetAlerts } from "../hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SegmentedProgress } from "@/components/ui/segmented-progress";
import Link from "next/link";

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
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
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
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
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
          <Badge variant="destructive">{alerts.length}</Badge>
        </div>

        <div className="space-y-4">
          {alerts.map((alert) => {
            const { budget } = alert;
            const isExceeded = alert.alertType === "exceeded";
            const pct = Math.min(budget.percentageUsed, 100);

            const filledClass = isExceeded
              ? "bg-red-500"
              : "bg-yellow-500";
            const emptyClass = isExceeded
              ? "bg-red-500/15"
              : "bg-yellow-500/15";

            return (
              <Link key={budget.id} href="/budgets" className="block group">
                <div className="space-y-2.5 rounded-xl border bg-card p-3.5 transition-colors group-hover:bg-accent/40">
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full shrink-0",
                          isExceeded ? "bg-red-500" : "bg-yellow-500",
                        )}
                      />
                      <p className="text-sm font-semibold truncate">
                        {budget.category.name}
                      </p>
                    </div>
                    <Badge
                      variant={isExceeded ? "destructive" : "outline"}
                      className={cn(
                        "text-xs shrink-0",
                        !isExceeded && "border-yellow-500/50 text-yellow-600 dark:text-yellow-400",
                      )}
                    >
                      {isExceeded ? "Exceeded" : `${pct.toFixed(0)}%`}
                    </Badge>
                  </div>

                  {/* 21st.dev SegmentedProgress with hover ripple */}
                  <SegmentedProgress
                    value={pct}
                    segments={12}
                    showPercentage={false}
                    filledClass={filledClass}
                    emptyClass={emptyClass}
                  />

                  {/* Amount row */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium tabular-nums text-foreground">
                      {formatCurrency(budget.spent)}
                    </span>
                    <span className="tabular-nums">
                      of {formatCurrency(budget.amount)}
                    </span>
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
