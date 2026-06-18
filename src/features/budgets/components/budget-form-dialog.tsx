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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { useCreateBudget, useUpdateBudget } from "../hooks"
import { createBudgetSchema } from "../schemas"
import type { BudgetWithSpending } from "../types"
import type { CreateBudgetInput } from "../schemas"

type BudgetFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget?: BudgetWithSpending
}

export const BudgetFormDialog = ({ open, onOpenChange, budget }: BudgetFormDialogProps) => {
  const { categories } = useCategories()
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()

  const form = useForm<CreateBudgetInput>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      amount: budget?.amount || 0,
      period: budget?.period || 'MONTHLY',
      categoryId: budget?.categoryId || '',
      startDate: budget?.startDate ? new Date(budget.startDate).toISOString() : new Date().toISOString(),
    },
  })

  useEffect(() => {
    if (budget) {
      form.reset({
        amount: budget.amount,
        period: budget.period,
        categoryId: budget.categoryId,
        startDate: new Date(budget.startDate).toISOString(),
      })
    } else {
      form.reset({
        amount: 0,
        period: 'MONTHLY',
        categoryId: '',
        startDate: new Date().toISOString(),
      })
    }
  }, [budget, form, open])

  const onSubmit = async (data: CreateBudgetInput) => {
    try {
      if (budget) {
        await updateBudget.mutateAsync({ id: budget.id, data })
      } else {
        await createBudget.mutateAsync(data)
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  }

  const isLoading = createBudget.isPending || updateBudget.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{budget ? 'Edit Budget' : 'Create Budget'}</DialogTitle>
          <DialogDescription>
            {budget
              ? 'Update your budget details'
              : 'Set a spending limit for a category'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount</FormLabel>
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
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isLoading ? 'Saving...' : budget ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
