"use client";

import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";
import { IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { memo } from "react";
import { formatCurrency } from "@/lib/format";

type RecentExpensesListProps = {
  expenses: ExpenseWithRelations[];
};

export const RecentExpensesList = memo(
  ({ expenses }: RecentExpensesListProps) => {
    if (expenses.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No expenses yet.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
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
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    {format(new Date(expense.date), "MMM dd")}
                  </TableCell>
                  <TableCell>
                    {expense.description || "No description"}
                  </TableCell>
                  <TableCell>
                    {expense.group ? (
                      <Link href={`/groups/${expense.group.id}`}>
                        <Badge
                          variant="outline"
                          className="gap-1 hover:border-primary hover:text-primary cursor-pointer"
                        >
                          <IconUsers className="h-3 w-3" />
                          {expense.group.name}
                        </Badge>
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Personal
                      </span>
                    )}
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
                    className={`text-right font-medium ${expense.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
                  >
                    {expense.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(Number(expense.amount))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  },
);

RecentExpensesList.displayName = "RecentExpensesList";
