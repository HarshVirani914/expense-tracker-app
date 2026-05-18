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

const RecentExpenseCardRow = ({ expense }: { expense: ExpenseWithRelations }) => (
  <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50">
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
      style={{
        backgroundColor: `${expense.category.color}20`,
        color: expense.category.color,
      }}
    >
      <IconReceipt className="h-5 w-5" aria-hidden />
    </div>

    <div className="min-w-0 flex-1">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <p className="truncate text-sm font-medium">
          {expense.description || "No description"}
        </p>
        {expense.type === "INCOME" && (
          <Badge className="shrink-0 bg-green-600 text-xs">Income</Badge>
        )}
        {expense.group && (
          <Badge variant="secondary" className="shrink-0 text-xs">
            <IconUsers className="mr-1 h-2.5 w-2.5" />
            {expense.group.name}
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{expense.category.name}</span>
        <span aria-hidden>•</span>
        <span>
          {formatDistanceToNow(new Date(expense.date), {
            addSuffix: true,
          })}
        </span>
      </div>
    </div>

    <div
      className={cn(
        "shrink-0 text-sm font-semibold tabular-nums",
        expense.type === "INCOME"
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400",
      )}
    >
      {expense.type === "INCOME" ? "+" : "-"}
      {formatCurrency(Number(expense.amount))}
    </div>
  </div>
);

const RecentExpensesCardList = ({
  expenses,
}: {
  expenses: ExpenseWithRelations[];
}) => (
  <div className="space-y-2">
    {expenses.map((expense) => (
      <RecentExpenseCardRow key={expense.id} expense={expense} />
    ))}
  </div>
);

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
              <div className="mb-3 rounded-full bg-muted p-3">
                <IconReceipt className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No expenses yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Start tracking by adding your first expense
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="@container/recent shadow-none">
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
        <CardContent className="min-w-0">
          {isMobile ? (
            <RecentExpensesCardList expenses={expenses} />
          ) : (
            <>
              <div className="@lg/recent:hidden">
                <RecentExpensesCardList expenses={expenses} />
              </div>
              <div className="hidden min-w-0 overflow-x-auto @lg/recent:block">
                <Table className="min-w-xl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-18 whitespace-nowrap">
                        Date
                      </TableHead>
                      <TableHead className="min-w-32 max-w-56">
                        Description
                      </TableHead>
                      <TableHead className="min-w-28">Type</TableHead>
                      <TableHead className="min-w-24">Category</TableHead>
                      <TableHead className="w-24 text-right whitespace-nowrap">
                        Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id} className="cursor-pointer">
                        <TableCell className="whitespace-nowrap font-medium">
                          {format(new Date(expense.date), "MMM dd")}
                        </TableCell>
                        <TableCell className="min-w-0 max-w-56">
                          <span className="block truncate">
                            {expense.description || "No description"}
                          </span>
                        </TableCell>
                        <TableCell className="min-w-0">
                          <div className="flex min-w-0 flex-wrap items-center gap-1">
                            {expense.type === "INCOME" ? (
                              <Badge className="shrink-0 bg-green-600 text-xs">
                                Income
                              </Badge>
                            ) : (
                              <Badge
                                variant="destructive"
                                className="shrink-0 text-xs"
                              >
                                Expense
                              </Badge>
                            )}
                            {expense.group && (
                              <Link href={`/groups/${expense.group.id}`}>
                                <Badge
                                  variant="outline"
                                  className="max-w-40 cursor-pointer gap-1 truncate text-xs hover:border-primary hover:text-primary"
                                >
                                  <IconUsers className="h-3 w-3 shrink-0" />
                                  <span className="truncate">
                                    {expense.group.name}
                                  </span>
                                </Badge>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className="max-w-36 truncate"
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
                            "whitespace-nowrap text-right font-medium tabular-nums",
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
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  },
);

RecentExpensesList.displayName = "RecentExpensesList";
