"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExpenseWithRelations } from "@/features/expenses/types";
import { format, formatDistanceToNow } from "date-fns";
import { IconUsers, IconArrowRight, IconReceipt } from "@tabler/icons-react";
import Link from "next/link";
import { memo } from "react";
import { formatCurrency } from "@/lib/format";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type RecentExpensesListProps = {
  expenses: ExpenseWithRelations[];
};

export const RecentExpensesList = memo(
  ({ expenses }: RecentExpensesListProps) => {
    const isMobile = useIsMobile();

    if (expenses.length === 0) {
      return (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconReceipt className="h-5 w-5 shrink-0 text-primary" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <IconReceipt className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No expenses yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start tracking by adding your first expense
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <IconReceipt className="h-5 w-5 shrink-0 text-primary" />
            Recent Expenses
          </CardTitle>
          <Link href="/expenses">
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <IconArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                >
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                    style={{
                      backgroundColor: `${expense.category.color}20`,
                      color: expense.category.color,
                    }}
                  >
                    💰
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">
                        {expense.description || "No description"}
                      </p>
                      {expense.type === "INCOME" && (
                        <Badge className="text-xs shrink-0 bg-green-600">
                          Income
                        </Badge>
                      )}
                      {expense.group && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          <IconUsers className="h-2.5 w-2.5 mr-1" />
                          {expense.group.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{expense.category.name}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(expense.date), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "font-semibold text-sm shrink-0",
                      expense.type === "INCOME"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {expense.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(Number(expense.amount))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      {format(new Date(expense.date), "MMM dd")}
                    </TableCell>
                    <TableCell>
                      {expense.description || "No description"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {expense.type === "INCOME" ? (
                          <Badge className="bg-green-600 text-xs">
                            Income
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Expense
                          </Badge>
                        )}
                        {expense.group && (
                          <Link href={`/groups/${expense.group.id}`}>
                            <Badge
                              variant="outline"
                              className="gap-1 hover:border-primary hover:text-primary cursor-pointer text-xs"
                            >
                              <IconUsers className="h-3 w-3" />
                              {expense.group.name}
                            </Badge>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: expense.category.color,
                          color: expense.category.color,
                        }}
                      >
                        {expense.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        expense.type === "INCOME"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {expense.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(Number(expense.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  },
);

RecentExpensesList.displayName = "RecentExpensesList";
