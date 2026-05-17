"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useFeatureAccent } from "@/hooks/use-feature-accent";
import { IconTag, IconTrendingUp, IconList } from "@tabler/icons-react";
import { memo } from "react";
import type { CategorySpending } from "../types";

type CategorySpendingSummaryCardProps = {
  categorySpending: CategorySpending[];
};

export const CategorySpendingSummaryCard = memo(
  ({ categorySpending }: CategorySpendingSummaryCardProps) => {
    const accent = useFeatureAccent();
    const totalSpending = categorySpending.reduce(
      (sum, cat) => sum + cat.totalAmount,
      0,
    );
    const totalTransactions = categorySpending.reduce(
      (sum, cat) => sum + cat.transactionCount,
      0,
    );
    const activeCategories = categorySpending.filter(
      (cat) => cat.totalAmount > 0,
    ).length;

    const stats = [
      {
        label: "Active Categories",
        value: activeCategories,
        icon: IconTag,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-500/10",
      },
      {
        label: "Transactions",
        value: totalTransactions,
        icon: IconList,
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-500/10",
      },
    ];

    return (
      <Card
        className={cn(
          "relative overflow-hidden border-0 shadow-none",
          accent.pageHeroTint,
        )}
      >
        <div className="absolute inset-0 bg-grid-white/10 mask-[radial-gradient(white,transparent_70%)]" />

        <div className="relative p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                Category Spending
              </p>
              <div className="text-4xl font-bold tracking-tight font-mono">
                {formatCurrency(totalSpending)}
              </div>
              <p className="text-sm text-muted-foreground">
                Across {activeCategories}{" "}
                {activeCategories === 1 ? "category" : "categories"}
              </p>
            </div>
            <div className={cn("rounded-full p-3", accent.iconBg)}>
              <IconTag className={cn("h-6 w-6", accent.icon)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={cn("rounded-lg p-3 space-y-2", bg)}>
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", color)} />
                  <p className="text-xs font-medium text-muted-foreground">
                    {label}
                  </p>
                </div>
                <p className={cn("text-xl font-bold font-mono", color)}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  },
);

CategorySpendingSummaryCard.displayName = "CategorySpendingSummaryCard";
