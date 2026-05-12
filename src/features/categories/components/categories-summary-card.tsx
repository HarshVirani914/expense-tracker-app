"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IconLock, IconTag, IconUser } from "@tabler/icons-react";
import { memo } from "react";
import type { Category } from "../types";

type CategoriesSummaryCardProps = {
  categories: Category[];
};

export const CategoriesSummaryCard = memo(
  ({ categories }: CategoriesSummaryCardProps) => {
    const totalCategories = categories.length;
    const systemCategories = categories.filter((c) => c.isDefault).length;
    const customCategories = categories.filter((c) => !c.isDefault).length;

    const stats = [
      {
        label: "Total Categories",
        value: totalCategories,
        icon: IconTag,
        color: "text-primary",
        bg: "bg-primary/10",
      },
      {
        label: "System Categories",
        value: systemCategories,
        icon: IconLock,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-500/10",
      },
      {
        label: "Custom Categories",
        value: customCategories,
        icon: IconUser,
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-500/10",
      },
    ];

    return (
      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-primary/10 via-primary/5 to-background shadow-none">
        <div className="absolute inset-0 bg-grid-white/10 mask-[radial-gradient(white,transparent_80%)]" />

        <div className="relative p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                Category Overview
              </p>
              <div className="text-4xl font-bold tracking-tight">
                {totalCategories}
              </div>
              <p className="text-sm text-muted-foreground">
                {totalCategories === 1 ? "category" : "categories"} available
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <IconTag className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={cn("rounded-lg p-3 space-y-2", bg)}>
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", color)} />
                  <p className="text-xs font-medium text-muted-foreground">
                    {label}
                  </p>
                </div>
                <p className={cn("text-2xl font-bold", color)}>{value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {categories.slice(0, 10).map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-xs font-medium">{category.name}</span>
              </div>
            ))}
            {categories.length > 10 && (
              <div className="flex items-center px-3 py-1.5 rounded-full bg-background/50 border">
                <span className="text-xs font-medium text-muted-foreground">
                  +{categories.length - 10} more
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  },
);

CategoriesSummaryCard.displayName = "CategoriesSummaryCard";
