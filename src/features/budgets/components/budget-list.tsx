"use client"

import { BudgetCard } from "./budget-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { BudgetWithSpending } from "../types"

type BudgetListProps = {
  budgets: BudgetWithSpending[] | undefined
  isLoading?: boolean
  onEdit?: (budget: BudgetWithSpending) => void
  onDelete?: (id: string) => void
}

export const BudgetList = ({ budgets, isLoading, onEdit, onDelete }: BudgetListProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    )
  }

  if (!budgets || budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg mb-2">No budgets yet</p>
        <p className="text-muted-foreground text-sm">
          Create a budget to start tracking your spending limits
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {budgets.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
