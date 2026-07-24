"use client"

import { BudgetCard } from "./budget-card"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { IconTarget } from "@tabler/icons-react"
import type { BudgetWithSpending } from "../types"

type BudgetListProps = {
  budgets: BudgetWithSpending[] | undefined
  isLoading?: boolean
  onEdit?: (budget: BudgetWithSpending) => void
  onDelete?: (id: string) => void
  onAddBudget?: () => void
}

export const BudgetList = ({
  budgets,
  isLoading,
  onEdit,
  onDelete,
  onAddBudget,
}: BudgetListProps) => {
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
      <EmptyState
        icon={IconTarget}
        title="No budgets yet"
        description="Create a budget to start tracking your spending limits"
        actionLabel="Create Budget"
        onAction={onAddBudget}
      />
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
