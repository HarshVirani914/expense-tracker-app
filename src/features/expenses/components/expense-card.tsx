"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
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
    <div className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-accent/50">
      {/* Category color tile */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
        style={{
          backgroundColor: `${expense.category.color}18`,
          color: expense.category.color,
        }}
      >
        {expense.category.name.slice(0, 1).toUpperCase()}
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight">
          {expense.description || "No description"}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{expense.category.name}</span>
          {expense.account && (
            <>
              <span aria-hidden>·</span>
              <span>{expense.account.name}</span>
            </>
          )}
          {expense.group && (
            <>
              <span aria-hidden>·</span>
              <Link
                href={`/groups/${expense.group.id}`}
                className="inline-flex items-center gap-0.5 hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <IconUsers className="h-3 w-3" />
                {expense.group.name}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Amount + actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            isIncome
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400",
          )}
        >
          {isIncome ? "+" : "−"}
          {formatCurrency(Number(expense.amount))}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(expense)}>
              <IconPencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(expense.id, expense.description || undefined)}
              className="text-red-600"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
