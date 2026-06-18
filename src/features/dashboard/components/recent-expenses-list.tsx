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
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { IconUsers, IconArrowRight, IconReceipt } from "@tabler/icons-react";
import Link from "next/link";
import { memo } from "react";
import { formatCurrency } from "@/lib/format";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type RecentExpensesListProps = {
  expenses: ExpenseWithRelations[];
};

const MOBILE_PREVIEW_LIMIT = 8;

function formatDateLabel(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEE, MMM d");
}

const TimelineRow = ({ expense }: { expense: ExpenseWithRelations }) => {
  const isIncome = expense.type === "INCOME";
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/50">
      {/* Category color tile */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
        style={{
          backgroundColor: `${expense.category.color}18`,
          color: expense.category.color,
        }}
      >
        {expense.category.name.slice(0, 1).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight">
          {expense.description || "No description"}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {expense.category.name}
          {expense.group && (
            <span>
              {" · "}
              <Link
                href={`/groups/${expense.group.id}`}
                className="inline-flex items-center gap-0.5 hover:text-foreground"
              >
                <IconUsers className="h-3 w-3" />
                {expense.group.name}
              </Link>
            </span>
          )}
        </p>
      </div>

      <span
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          isIncome
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400",
        )}
      >
        {isIncome ? "+" : "−"}
        {formatCurrency(Number(expense.amount))}
      </span>
    </div>
  );
};

const MobileTimeline = ({ expenses }: { expenses: ExpenseWithRelations[] }) => {
  const limited = expenses.slice(0, MOBILE_PREVIEW_LIMIT);

  // Group by date
  const grouped = limited.reduce<Map<string, ExpenseWithRelations[]>>(
    (acc, expense) => {
      const key = format(new Date(expense.date), "yyyy-MM-dd");
      if (!acc.has(key)) acc.set(key, []);
      acc.get(key)!.push(expense);
      return acc;
    },
    new Map(),
  );

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([dateKey, dayExpenses]) => {
        const dayNet = dayExpenses.reduce((sum, e) => {
          const amt = Number(e.amount);
          return e.type === "INCOME" ? sum + amt : sum - amt;
        }, 0);

        return (
          <div key={dateKey}>
            {/* Date section header */}
            <div className="mb-1 flex items-center justify-between px-2 py-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {formatDateLabel(dateKey)}
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold tabular-nums",
                  dayNet >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {dayNet >= 0 ? "+" : ""}
                {formatCurrency(Math.abs(dayNet))}
              </span>
            </div>

            <div className="-mx-2">
              {dayExpenses.map((expense) => (
                <TimelineRow key={expense.id} expense={expense} />
              ))}
            </div>
          </div>
        );
      })}

      {expenses.length > MOBILE_PREVIEW_LIMIT && (
        <p className="px-2 text-center text-xs text-muted-foreground">
          Showing {MOBILE_PREVIEW_LIMIT} of {expenses.length}.{" "}
          <Link
            href="/expenses"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </p>
      )}
    </div>
  );
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
            <MobileTimeline expenses={expenses} />
          ) : (
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
                            <Badge className="shrink-0 bg-emerald-600 text-xs">
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
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400",
                        )}
                      >
                        {expense.type === "INCOME" ? "+" : "−"}
                        {formatCurrency(Number(expense.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
);

RecentExpensesList.displayName = "RecentExpensesList";
