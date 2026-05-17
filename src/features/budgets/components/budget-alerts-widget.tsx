"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconAlertTriangle, IconAlertCircle, IconChartPie } from "@tabler/icons-react";
import { useBudgetAlerts } from "../hooks";
import { Skeleton } from "@/components/ui/skeleton";

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
          <Skeleton className="h-20" />
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
          <p className="text-sm text-muted-foreground">
            All budgets are on track
          </p>
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

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.budget.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card"
            >
              {alert.alertType === "exceeded" ? (
                <IconAlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              ) : (
                <IconAlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {alert.budget.category.name}
                </p>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
