'use client'

import { useState } from 'react'
import { ExpenseList } from '@/features/expenses/components/expense-list'
import { ExpenseFormDialog } from '@/features/expenses/components/expense-form-dialog'
import type { ExpenseWithRelations } from '@/features/expenses/types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function ExpensesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<
    ExpenseWithRelations | undefined
  >(undefined)

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your expenses</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <ExpenseList onEdit={handleEdit} />

      <ExpenseFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        expense={selectedExpense}
      />
    </div>
  )
}
