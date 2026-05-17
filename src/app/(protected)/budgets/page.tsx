"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { IconPlus } from "@tabler/icons-react"
import { BudgetList } from "@/features/budgets/components/budget-list"
import { BudgetFormDialog } from "@/features/budgets/components/budget-form-dialog"
import { FeaturePageHero } from "@/components/layout/feature-page-hero"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useBudgets, useDeleteBudget } from "@/features/budgets/hooks"
import type { BudgetWithSpending } from "@/features/budgets/types"
import { formatCurrencyWithDecimals } from "@/lib/format"

export default function BudgetsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<BudgetWithSpending | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null)

  const { budgets, isLoading } = useBudgets()
  const deleteBudget = useDeleteBudget()

  const handleEdit = (budget: BudgetWithSpending) => {
    setSelectedBudget(budget)
    setFormOpen(true)
  }

  const handleDelete = (id: string) => {
    setBudgetToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (budgetToDelete) {
      await deleteBudget.mutateAsync(budgetToDelete)
      setBudgetToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) {
      setSelectedBudget(undefined)
    }
  }

  const totalBudgeted = budgets?.reduce((sum, b) => sum + b.amount, 0) || 0
  const totalSpent = budgets?.reduce((sum, b) => sum + b.spent, 0) || 0

  return (
    <div className="flex flex-col gap-6">
      <FeaturePageHero className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row gap-4 items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
            <p className="text-muted-foreground">
              Set spending limits and track your progress
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <IconPlus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
        </div>
      </FeaturePageHero>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Budgeted</p>
            <p className="text-3xl font-bold">{formatCurrencyWithDecimals(totalBudgeted)}</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-3xl font-bold">{formatCurrencyWithDecimals(totalSpent)}</p>
            <p className="text-sm text-muted-foreground">
              {totalBudgeted > 0 
                ? `${((totalSpent / totalBudgeted) * 100).toFixed(1)}% of budget`
                : 'No budget set'}
            </p>
          </div>
        </Card>
      </div>

      <BudgetList
        budgets={budgets}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <BudgetFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        budget={selectedBudget}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Budget"
        description="Are you sure you want to delete this budget? This action cannot be undone."
      />
    </div>
  )
}
