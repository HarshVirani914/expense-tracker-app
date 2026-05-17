"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ExpenseWithRelations } from "@/features/expenses/types";
import { formatCurrency } from "@/lib/format";
import { MONEY_SEMANTICS } from "@/lib/money-semantics";
import { format } from "date-fns";
import {
  IconPlus,
  IconReceipt,
  IconArrowRight,
  IconDotsVertical,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";

const SPLIT_TYPE_LABELS: Record<string, string> = {
  EQUAL: "Equal split",
  EXACT: "Exact amounts",
  PERCENTAGE: "Percentage split",
  SHARES: "Share split",
};

type ParticipantRow = NonNullable<
  ExpenseWithRelations["participants"]
>[number];

const getSplitSummary = (
  participants: ExpenseWithRelations["participants"],
) => {
  if (!participants?.length) {
    return null;
  }
  const types = [...new Set(participants.map((p) => p.splitType))];
  if (types.length > 1) {
    return "Mixed split types";
  }
  const only = types[0];
  if (!only) return null;
  return SPLIT_TYPE_LABELS[only] ?? String(only);
};

const getPayerSummary = (
  participants: NonNullable<ExpenseWithRelations["participants"]>,
  getParticipantDisplayName: (p: ParticipantRow) => string,
) => {
  const payers = participants.filter((p) => p.paidAmount > 0.01);
  if (payers.length === 0) {
    return "No payer recorded";
  }
  if (payers.length === 1) {
    return `${getParticipantDisplayName(payers[0])} paid`;
  }
  if (payers.length === 2) {
    return `${getParticipantDisplayName(payers[0])} and ${getParticipantDisplayName(payers[1])} paid`;
  }
  return `${payers.length} people paid`;
};

const defaultParticipantName = (p: ParticipantRow) =>
  p.contact?.name ??
  (p.userId ? "Member" : p.contactId ? "Contact" : "Someone");

type GroupActivityCardProps = {
  expenses: ExpenseWithRelations[] | undefined;
  isLoading: boolean;
  onAddExpense: () => void;
  onViewAll: () => void;
  onEditExpense: (expense: ExpenseWithRelations) => void;
  onDeleteExpense: (expenseId: string) => void;
  getParticipantDisplayName?: (participant: ParticipantRow) => string;
};

export const GroupActivityCard = ({
  expenses,
  isLoading,
  onAddExpense,
  onViewAll,
  onEditExpense,
  onDeleteExpense,
  getParticipantDisplayName: getParticipantDisplayNameProp,
}: GroupActivityCardProps) => {
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);

  const resolveName =
    getParticipantDisplayNameProp ?? defaultParticipantName;
  const handleDeleteConfirm = () => {
    if (deleteExpenseId) {
      onDeleteExpense(deleteExpenseId);
      setDeleteExpenseId(null);
    }
  };
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent activity</CardTitle>
          <CardDescription className="text-xs">
            {MONEY_SEMANTICS.groupActivityCardSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent activity</CardTitle>
          <CardDescription className="text-xs">
            {MONEY_SEMANTICS.groupActivityCardSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
              <IconReceipt className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Add an expense to get started tracking group spending
            </p>
            <Button onClick={onAddExpense} className="gap-2">
              <IconPlus className="h-4 w-4" />
              Add First Expense
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Recent activity</CardTitle>
              <CardDescription className="text-xs mt-1">
                {MONEY_SEMANTICS.groupActivityCardSubtitle}
              </CardDescription>
            </div>
            {expenses.length >= 10 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewAll}
                className="gap-1.5"
              >
                View All
                <IconArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {expenses.map((expense) => {
              const participants = expense.participants;
              const splitSummary = getSplitSummary(participants);
              const payerSummary =
                participants && participants.length > 0
                  ? getPayerSummary(participants, resolveName)
                  : null;
              const metaParts = [payerSummary, splitSummary].filter(
                Boolean,
              ) as string[];
              const billTotal = formatCurrency(Number(expense.amount));
              const spokenSummary =
                metaParts.length > 0
                  ? `Full bill ${billTotal}. ${metaParts.join(". ")}.`
                  : `Full bill ${billTotal}.`;

              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-4 p-4 border shadow-none rounded-lg hover:bg-foreground/5 transition-colors group"
                >
                  <div
                    className="flex items-center justify-center w-11 h-11 rounded-lg shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: expense.category.color + "20" }}
                  >
                    <IconReceipt
                      className="h-5 w-5"
                      style={{ color: expense.category.color }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-base truncate mb-1.5">
                      {expense.description || expense.category.name}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: expense.category.color + "15",
                          color: expense.category.color,
                          borderColor: expense.category.color + "30",
                        }}
                      >
                        {expense.category.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(expense.date), "MMM d, yyyy")}
                      </span>
                      {participants && participants.length > 1 && (
                        <>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {participants.length} on split
                          </span>
                        </>
                      )}
                    </div>
                    {metaParts.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {metaParts.join(" · ")}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div className="font-semibold text-xl">
                      <span className="sr-only">{spokenSummary}</span>
                      <span aria-hidden="true">{billTotal}</span>
                    </div>
                    {/* All expenses belong to the user, show edit/delete for all */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-11 w-11 min-h-11 min-w-11 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconDotsVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onEditExpense(expense)}
                        >
                          <IconEdit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteExpenseId(expense.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <IconTrash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteExpenseId} onOpenChange={(open) => !open && setDeleteExpenseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone and will affect group balances.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
