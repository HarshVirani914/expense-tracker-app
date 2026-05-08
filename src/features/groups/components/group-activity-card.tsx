"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExpenseWithRelations } from "@/features/expenses/types";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import { IconPlus, IconReceipt } from "@tabler/icons-react";

type GroupActivityCardProps = {
  expenses: ExpenseWithRelations[] | undefined;
  isLoading: boolean;
  onAddExpense: () => void;
  onViewAll: () => void;
};

export const GroupActivityCard = ({
  expenses,
  isLoading,
  onAddExpense,
  onViewAll,
}: GroupActivityCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          {expenses && expenses.length >= 10 && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : expenses && expenses.length > 0 ? (
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10 text-primary shrink-0">
                  <IconReceipt className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-base truncate mb-1">
                    {expense.description || "Untitled Expense"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{expense.category.name}</span>
                    <span>•</span>
                    <span>{format(new Date(expense.date), "MMM d")}</span>
                    {expense.participants && expense.participants.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{expense.participants.length} people</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-semibold text-lg">
                    {formatCurrency(Number(expense.amount))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto mb-4">
              <IconReceipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No expenses yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add an expense to get started tracking group spending
            </p>
            <Button onClick={onAddExpense} className="gap-2">
              <IconPlus className="h-4 w-4" />
              Add First Expense
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
