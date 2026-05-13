"use client"

import { RecurringExpenseCard } from "./recurring-expense-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { RecurringExpenseWithRelations } from "../types"

type RecurringExpenseListProps = {
  recurringExpenses: RecurringExpenseWithRelations[] | undefined
  isLoading?: boolean
  onEdit?: (recurringExpense: RecurringExpenseWithRelations) => void
  onDelete?: (id: string) => void
  onToggle?: (id: string) => void
}

export const RecurringExpenseList = ({
  recurringExpenses,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
}: RecurringExpenseListProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    )
  }

  if (!recurringExpenses || recurringExpenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg mb-2">No recurring expenses yet</p>
        <p className="text-muted-foreground text-sm">
          Create a recurring expense to automate regular transactions
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recurringExpenses.map((recurringExpense) => (
        <RecurringExpenseCard
          key={recurringExpense.id}
          recurringExpense={recurringExpense}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}
