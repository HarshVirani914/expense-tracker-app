"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { useAccounts } from "@/features/accounts/hooks/use-accounts"
import { useCreateRecurringExpense, useUpdateRecurringExpense } from "../hooks"
import { createRecurringExpenseSchema } from "../schemas"
import type { RecurringExpenseWithRelations } from "../types"
import type { CreateRecurringExpenseInput } from "../schemas"

type RecurringExpenseFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recurringExpense?: RecurringExpenseWithRelations
}

export const RecurringExpenseFormDialog = ({
  open,
  onOpenChange,
  recurringExpense,
}: RecurringExpenseFormDialogProps) => {
  const { categories } = useCategories()
  const { accounts } = useAccounts()
  const createRecurringExpense = useCreateRecurringExpense()
  const updateRecurringExpense = useUpdateRecurringExpense()

  const form = useForm<CreateRecurringExpenseInput>({
    resolver: zodResolver(createRecurringExpenseSchema),
    defaultValues: {
      amount: recurringExpense?.amount || 0,
      description: recurringExpense?.description || '',
      type: recurringExpense?.type || 'EXPENSE',
      frequency: recurringExpense?.frequency || 'MONTHLY',
      customDays: recurringExpense?.customDays || undefined,
      categoryId: recurringExpense?.categoryId || '',
      accountId: recurringExpense?.accountId || undefined,
      startDate: recurringExpense?.startDate ? new Date(recurringExpense.startDate).toISOString() : new Date().toISOString(),
      endDate: recurringExpense?.endDate ? new Date(recurringExpense.endDate).toISOString() : undefined,
    },
  })

  const watchedFrequency = form.watch('frequency')

  useEffect(() => {
    if (recurringExpense) {
      form.reset({
        amount: recurringExpense.amount,
        description: recurringExpense.description || '',
        type: recurringExpense.type,
        frequency: recurringExpense.frequency,
        customDays: recurringExpense.customDays || undefined,
        categoryId: recurringExpense.categoryId,
        accountId: recurringExpense.accountId || undefined,
        startDate: new Date(recurringExpense.startDate).toISOString(),
        endDate: recurringExpense.endDate ? new Date(recurringExpense.endDate).toISOString() : undefined,
      })
    } else {
      form.reset({
        amount: 0,
        description: '',
        type: 'EXPENSE',
        frequency: 'MONTHLY',
        customDays: undefined,
        categoryId: '',
        accountId: undefined,
        startDate: new Date().toISOString(),
        endDate: undefined,
      })
    }
  }, [recurringExpense, form, open])

  const onSubmit = async (data: CreateRecurringExpenseInput) => {
    try {
      if (recurringExpense) {
        await updateRecurringExpense.mutateAsync({ id: recurringExpense.id, data })
      } else {
        await createRecurringExpense.mutateAsync(data)
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      // Error handled in mutation hooks
    }
  }

  const isLoading = createRecurringExpense.isPending || updateRecurringExpense.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {recurringExpense ? 'Edit Recurring Expense' : 'Create Recurring Expense'}
          </DialogTitle>
          <DialogDescription>
            {recurringExpense
              ? 'Update your recurring expense details'
              : 'Set up an expense that repeats automatically'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                      <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                        inputMode="decimal"
                      placeholder="0.00"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a description..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account (Optional)</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value === "none" ? undefined : value)
                    }} 
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedFrequency === 'CUSTOM' && (
              <FormField
                control={form.control}
                name="customDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        placeholder="Number of days"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString())}
                        placeholder="Select start date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString())}
                        placeholder="Select end date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : recurringExpense ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
