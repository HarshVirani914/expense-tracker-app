"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateExpense } from "../hooks/use-create-expense";
import { useUpdateExpense } from "../hooks/use-update-expense";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { createExpenseSchema, type CreateExpenseInput } from "../schemas";
import type { ExpenseWithRelations } from "../types";
import { ExpenseType, PaymentMethod } from "@/types/prisma";
import { toast } from "sonner";
import type { AccountWithBalance } from "@/features/accounts/types";

type ExpenseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: ExpenseWithRelations;
};

export const ExpenseFormDialog = ({
  open,
  onOpenChange,
  expense,
}: ExpenseFormDialogProps) => {
  const isEditing = !!expense;
  const { categories } = useCategories();
  const { accounts } = useAccounts();

  const { createExpense, isCreating } = useCreateExpense();
  const { updateExpense, isUpdating } = useUpdateExpense();

  const form = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    mode: "onSubmit",
    defaultValues: {
      amount: 0,
      description: "",
      type: ExpenseType.EXPENSE,
      date: new Date(),
      paymentMethod: PaymentMethod.OTHER,
      notes: "",
      categoryId: "",
      accountId: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && expense) {
        form.reset({
          amount: Number(expense.amount),
          description: expense.description || "",
          type: expense.type,
          date: new Date(expense.date),
          paymentMethod: expense.paymentMethod,
          notes: expense.notes || "",
          categoryId: expense.categoryId,
          accountId: expense.accountId || undefined,
        });
      } else {
        form.reset({
          amount: 0,
          description: "",
          type: ExpenseType.EXPENSE,
          date: new Date(),
          paymentMethod: PaymentMethod.OTHER,
          notes: "",
          categoryId: "",
          accountId: undefined,
        });
      }
    }
  }, [open, isEditing, expense, form]);

  const onSubmit = async (data: CreateExpenseInput) => {
    try {
      if (isEditing && expense) {
        await updateExpense({
          id: expense.id,
          data,
        });
        toast.success("Expense updated successfully");
      } else {
        await createExpense(data);
        toast.success("Expense created successfully");
      }
      onOpenChange(false);
    } catch {
      toast.error(
        isEditing ? "Failed to update expense" : "Failed to create expense",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the expense details below."
              : "Fill in the details to create a new expense."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ExpenseType.EXPENSE}>
                          Expense
                        </SelectItem>
                        <SelectItem value={ExpenseType.INCOME}>
                          Income
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Grocery shopping" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
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
                    <FormLabel>Account</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No account</SelectItem>
                        {accounts?.map((account: AccountWithBalance) => (
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <DatePicker
                      date={field.value instanceof Date ? field.value : undefined}
                      onSelect={field.onChange}
                      placeholder="Select date"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                        <SelectItem value={PaymentMethod.CARD}>Card</SelectItem>
                        <SelectItem value={PaymentMethod.UPI}>UPI</SelectItem>
                        <SelectItem value={PaymentMethod.BANK_TRANSFER}>
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value={PaymentMethod.OTHER}>
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional notes..." {...field} />
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
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isEditing ? "Update" : "Create"} Expense
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
