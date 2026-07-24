"use client"

import { RecurringExpenseCard } from "./recurring-expense-card"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { IconRepeat } from "@tabler/icons-react"
import type { RecurringExpenseWithRelations } from "../types"

type RecurringExpenseListProps = {
  recurringExpenses: RecurringExpenseWithRelations[] | undefined
  isLoading?: boolean
  onEdit?: (recurringExpense: RecurringExpenseWithRelations) => void
  onDelete?: (id: string) => void
  onToggle?: (id: string) => void
  onAddRecurringExpense?: () => void
}

export const RecurringExpenseList = ({
  recurringExpenses,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
  onAddRecurringExpense,
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
      <EmptyState
        icon={IconRepeat}
        title="No recurring expenses yet"
        description="Create a recurring expense to automate regular transactions"
        actionLabel="Add Recurring Expense"
        onAction={onAddRecurringExpense}
      />
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
