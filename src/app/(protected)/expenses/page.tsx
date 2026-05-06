'use client'

import { useState } from 'react'
import { ExpenseList } from '@/features/expenses/components/expense-list'
import { ExpenseFiltersBar } from '@/features/expenses/components/expense-filters'
import { ExpenseFormDialog } from '@/features/expenses/components/expense-form-dialog'
import type { ExpenseWithRelations, ExpenseFilters } from '@/features/expenses/types'
import { Button } from '@/components/ui/button'
import { IconPlus, IconReceipt } from '@tabler/icons-react'

export default function ExpensesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<
    ExpenseWithRelations | undefined
  >(undefined)
  
  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    limit: 20,
  })

  const handleEdit = (expense: ExpenseWithRelations) => {
    setSelectedExpense(expense)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedExpense(undefined)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <IconReceipt className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Expenses</h1>
          </div>
          <p className="text-muted-foreground text-base pl-[52px]">
            Track and manage all your expenses
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          size="lg"
        >
          <IconPlus className="h-5 w-5" />
          Add Expense
        </Button>
      </div>

      <ExpenseFiltersBar filters={filters} onFiltersChange={setFilters} />

      <ExpenseList onEdit={handleEdit} filters={filters} />

      <ExpenseFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        expense={selectedExpense}
      />
    </div>
  )
}
