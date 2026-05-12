"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { IconArrowRight } from "@tabler/icons-react";
import type { CategorySpending } from "../types";

type CategorySpendingListProps = {
  categorySpending: CategorySpending[];
  limit?: number;
};

export const CategorySpendingList = ({
  categorySpending,
  limit = 10,
}: CategorySpendingListProps) => {
  const topCategories = categorySpending
    .filter((cat) => cat.totalAmount > 0)
    .slice(0, limit);

  const maxAmount = topCategories[0]?.totalAmount || 1;

  if (topCategories.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <IconArrowRight className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No spending data</h3>
          <p className="text-muted-foreground max-w-md">
            Start adding expenses to see your category-wise spending breakdown
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Top Spending Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topCategories.map((category, index) => {
          const percentage = (category.totalAmount / maxAmount) * 100;
          const isTop3 = index < 3;

          return (
            <div key={category.categoryId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: category.categoryColor }}
                    />
                    <span className="font-medium text-sm truncate">
                      {category.categoryName}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {category.transactionCount}{" "}
                    {category.transactionCount === 1 ? "transaction" : "transactions"}
                  </span>
                </div>
                <span
                  className={cn(
                    "font-bold text-sm ml-4 shrink-0",
                    isTop3
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {formatCurrency(category.totalAmount)}
                </span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all",
                    isTop3
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  )}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: isTop3
                      ? category.categoryColor
                      : undefined,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
