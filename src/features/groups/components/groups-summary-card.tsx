"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  IconUsers,
  IconReceipt,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react";
import { useFeatureAccent } from "@/hooks/use-feature-accent";
import type { GroupStats } from "../types";
import { memo } from "react";

type GroupsSummaryCardProps = {
  stats: GroupStats;
};

export const GroupsSummaryCard = memo(({ stats }: GroupsSummaryCardProps) => {
  const hasActivity = stats.totalExpenses > 0;
  const accent = useFeatureAccent();

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 shadow-none",
        accent.pageHeroTint,
      )}
    >
      <div className="absolute inset-0 bg-grid-white/10 mask-[radial-gradient(white,transparent_70%)]" />

      <div className="relative p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Groups
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              {stats.totalGroups}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.activeGroups} active with expenses
            </p>
          </div>
          <div className={cn("rounded-full p-3", accent.iconBg)}>
            <IconUsers className={cn("h-8 w-8", accent.icon)} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <IconUsers className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Members</span>
            </div>
            <p className="text-lg font-semibold">{stats.totalMembers}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <IconReceipt className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Expenses</span>
            </div>
            <p className="text-lg font-semibold">{stats.totalExpenses}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <IconTrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Owed to You</span>
            </div>
            <p
              className={cn(
                "text-lg font-semibold",
                stats.totalOwed > 0 ? "text-green-600 dark:text-green-400" : "",
              )}
            >
              {formatCurrency(stats.totalOwed)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <IconTrendingDown className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">You Owe</span>
            </div>
            <p
              className={cn(
                "text-lg font-semibold",
                stats.totalOwing > 0 ? "text-red-600 dark:text-red-400" : "",
              )}
            >
              {formatCurrency(stats.totalOwing)}
            </p>
          </div>
        </div>

        {!hasActivity && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Add expenses to groups to start tracking splits
            </p>
          </div>
        )}
      </div>
    </Card>
  );
});

GroupsSummaryCard.displayName = "GroupsSummaryCard";
