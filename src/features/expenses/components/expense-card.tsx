"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  IconCalendar,
  IconCategory,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Link from "next/link";
import type { ExpenseWithRelations } from "../types";

type ExpenseCardProps = {
  expense: ExpenseWithRelations;
  onEdit: (expense: ExpenseWithRelations) => void;
  onDelete: (id: string, description?: string) => void;
};

export const ExpenseCard = ({ expense, onEdit, onDelete }: ExpenseCardProps) => {
  const isIncome = expense.type === "INCOME";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base truncate">
                {expense.description || "No description"}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <IconCalendar className="h-3.5 w-3.5 shrink-0" />
                <span>{format(new Date(expense.date), "MMM dd, yyyy")}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "text-xl font-bold font-mono",
                  isIncome
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {isIncome ? "+" : "-"}
                {formatCurrency(Number(expense.amount))}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <IconDotsVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(expense)}>
                    <IconPencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      onDelete(expense.id, expense.description || undefined)
                    }
                    className="text-red-600"
                  >
                    <IconTrash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              style={{
                borderColor: expense.category.color,
                color: expense.category.color,
              }}
              className="gap-1"
            >
              <IconCategory className="h-3 w-3" />
              {expense.category.name}
            </Badge>

            {expense.group ? (
              <Link href={`/groups/${expense.group.id}`}>
                <Badge
                  variant="outline"
                  className="gap-1 hover:bg-accent cursor-pointer"
                >
                  <IconUsers className="h-3 w-3" />
                  {expense.group.name}
                </Badge>
              </Link>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <IconWallet className="h-3 w-3" />
                Personal
              </Badge>
            )}

            {expense.account && (
              <Badge variant="secondary" className="gap-1 text-xs">
                {expense.account.name}
              </Badge>
            )}

            <Badge variant="secondary" className="gap-1 text-xs capitalize">
              {expense.paymentMethod.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
