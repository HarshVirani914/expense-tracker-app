"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconPlus } from "@tabler/icons-react"
import { RecurringExpenseList } from "@/features/recurring-expenses/components/recurring-expense-list"
import { RecurringExpenseFormDialog } from "@/features/recurring-expenses/components/recurring-expense-form-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import {
  useRecurringExpenses,
  useDeleteRecurringExpense,
  useToggleRecurringExpense,
} from "@/features/recurring-expenses/hooks"
import type { RecurringExpenseWithRelations } from "@/features/recurring-expenses/types"

export default function RecurringExpensesPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [selectedRecurringExpense, setSelectedRecurringExpense] = useState<
    RecurringExpenseWithRelations | undefined
  >()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recurringExpenseToDelete, setRecurringExpenseToDelete] = useState<string | null>(null)

  const { recurringExpenses, isLoading } = useRecurringExpenses()
  const deleteRecurringExpense = useDeleteRecurringExpense()
  const toggleRecurringExpense = useToggleRecurringExpense()

  const activeExpenses = recurringExpenses?.filter((re) => re.isActive) || []
  const pausedExpenses = recurringExpenses?.filter((re) => !re.isActive) || []

  const handleEdit = (recurringExpense: RecurringExpenseWithRelations) => {
    setSelectedRecurringExpense(recurringExpense)
    setFormOpen(true)
  }

  const handleDelete = (id: string) => {
    setRecurringExpenseToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleToggle = async (id: string) => {
    await toggleRecurringExpense.mutateAsync(id)
  }

  const confirmDelete = async () => {
    if (recurringExpenseToDelete) {
      await deleteRecurringExpense.mutateAsync(recurringExpenseToDelete)
      setRecurringExpenseToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) {
      setSelectedRecurringExpense(undefined)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Recurring Expenses</h1>
          <p className="text-muted-foreground">
            Automate regular transactions that repeat
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Add Recurring
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">
            Active ({activeExpenses.length})
          </TabsTrigger>
          <TabsTrigger value="paused">
            Paused ({pausedExpenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <RecurringExpenseList
            recurringExpenses={activeExpenses}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        </TabsContent>

        <TabsContent value="paused" className="mt-6">
          <RecurringExpenseList
            recurringExpenses={pausedExpenses}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        </TabsContent>
      </Tabs>

      <RecurringExpenseFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        recurringExpense={selectedRecurringExpense}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Recurring Expense"
        description="Are you sure you want to delete this recurring expense? This action cannot be undone."
      />
    </div>
  )
}
