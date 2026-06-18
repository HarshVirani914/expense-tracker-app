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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type ExpenseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: ExpenseWithRelations;
};

function ExpenseFormContent({
  form,
  categories,
  accounts,
  isCreating,
  isUpdating,
  isEditing,
  isIncome,
  onSubmit,
  onCancel,
  isMobile,
}: {
  form: ReturnType<typeof useForm<CreateExpenseInput>>;
  categories: { id: string; name: string }[] | undefined;
  accounts: AccountWithBalance[] | undefined;
  isCreating: boolean;
  isUpdating: boolean;
  isEditing: boolean;
  isIncome: boolean;
  onSubmit: (data: CreateExpenseInput) => Promise<void>;
  onCancel: () => void;
  isMobile: boolean;
}) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-4", isMobile && "px-4 pb-2")}
      >
        {/* Amount + type — always side by side */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    placeholder="0.00"
                    className={cn(isMobile && "h-12 text-base")}
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn(isMobile && "h-12 text-base")}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ExpenseType.EXPENSE}>Expense</SelectItem>
                    <SelectItem value={ExpenseType.INCOME}>Income</SelectItem>
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
                <Input
                  placeholder="e.g., Grocery shopping"
                  className={cn(isMobile && "h-12 text-base")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category + Account */}
        <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2")}>
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn(isMobile && "h-12 text-base")}>
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
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? undefined : value)
                  }
                  value={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger className={cn(isMobile && "h-12 text-base")}>
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

        {/* Date + Payment method */}
        <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2")}>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn(isMobile && "h-12 text-base")}>
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
                    <SelectItem value={PaymentMethod.OTHER}>Other</SelectItem>
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
                <Input
                  placeholder="Additional notes..."
                  className={cn(isMobile && "h-12 text-base")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit buttons — rendered inside the drawer/dialog footer container via slot */}
        {!isMobile && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? `Update ${isIncome ? "Income" : "Expense"}`
                : `Add ${isIncome ? "Income" : "Expense"}`}
            </Button>
          </DialogFooter>
        )}
      </form>
    </Form>
  );
}

export const ExpenseFormDialog = ({
  open,
  onOpenChange,
  expense,
}: ExpenseFormDialogProps) => {
  const isMobile = useIsMobile();
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
      accountId: null,
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
          accountId: expense.accountId || null,
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
          accountId: null,
        });
      }
    }
  }, [open, isEditing, expense, form]);

  const watchedType = form.watch("type");
  const isIncome = watchedType === ExpenseType.INCOME;

  const onSubmit = async (data: CreateExpenseInput) => {
    try {
      if (isEditing && expense) {
        await updateExpense({ id: expense.id, data });
        toast.success(`${isIncome ? "Income" : "Expense"} updated successfully`);
      } else {
        await createExpense(data);
        toast.success(`${isIncome ? "Income" : "Expense"} created successfully`);
      }
      onOpenChange(false);
    } catch {
      toast.error(
        isEditing
          ? `Failed to update ${isIncome ? "income" : "expense"}`
          : `Failed to create ${isIncome ? "income" : "expense"}`,
      );
    }
  };

  const title = isEditing
    ? `Edit ${isIncome ? "Income" : "Expense"}`
    : `Add ${isIncome ? "Income" : "Expense"}`;

  const description = isEditing
    ? `Update the ${isIncome ? "income" : "expense"} details below.`
    : `Fill in the details to create a new ${isIncome ? "income" : "expense"}.`;

  const formProps = {
    form,
    categories,
    accounts,
    isCreating,
    isUpdating,
    isEditing,
    isIncome,
    onSubmit,
    onCancel: () => onOpenChange(false),
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="flex max-h-[95dvh] min-h-0 flex-col">
          <DrawerHeader className="shrink-0 text-left">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
            <ExpenseFormContent {...formProps} isMobile />
          </div>
          <DrawerFooter className="shrink-0 pt-2">
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isCreating || isUpdating}
              className="h-12 w-full bg-[#C9993F] text-[#080C16] hover:bg-[#B8872E]"
            >
              {isCreating || isUpdating
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? `Update ${isIncome ? "Income" : "Expense"}`
                : `Add ${isIncome ? "Income" : "Expense"}`}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 w-full"
            >
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ExpenseFormContent {...formProps} isMobile={false} />
      </DialogContent>
    </Dialog>
  );
};
