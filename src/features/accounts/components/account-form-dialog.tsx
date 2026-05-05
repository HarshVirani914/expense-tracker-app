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
import { useCreateAccount } from "../hooks/use-create-account";
import { useUpdateAccount } from "../hooks/use-update-account";
import { createAccountSchema, type CreateAccountInput } from "../schemas";
import type { AccountWithBalance } from "../types";
import { AccountType } from "@/types/prisma";
import { toast } from "sonner";

type AccountFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: AccountWithBalance;
};

export const AccountFormDialog = ({
  open,
  onOpenChange,
  account,
}: AccountFormDialogProps) => {
  const isEditing = !!account;

  const { createAccount, isCreating } = useCreateAccount();
  const { updateAccount, isUpdating } = useUpdateAccount();

  const form = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      type: AccountType.SAVINGS,
      initialBalance: 0,
      currency: "INR",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && account) {
        form.reset({
          name: account.name,
          type: account.type,
          initialBalance: Number(account.initialBalance),
          currency: account.currency,
        });
      } else {
        form.reset({
          name: "",
          type: AccountType.SAVINGS,
          initialBalance: 0,
          currency: "INR",
        });
      }
    }
  }, [open, isEditing, account, form]);

  const onSubmit = async (data: CreateAccountInput) => {
    try {
      if (isEditing && account) {
        await updateAccount({
          id: account.id,
          data,
        });
        toast.success("Account updated successfully");
      } else {
        await createAccount(data);
        toast.success("Account created successfully");
      }
      onOpenChange(false);
    } catch {
      toast.error(
        isEditing ? "Failed to update account" : "Failed to create account",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Account" : "Add New Account"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the account details below."
              : "Create a new account to track your finances."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Primary Savings" {...field} />
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
                  <FormLabel>Account Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={AccountType.SAVINGS}>
                        Savings
                      </SelectItem>
                      <SelectItem value={AccountType.CURRENT}>
                        Current
                      </SelectItem>
                      <SelectItem value={AccountType.WALLET}>Wallet</SelectItem>
                      <SelectItem value={AccountType.CASH}>Cash</SelectItem>
                      <SelectItem value={AccountType.CREDIT_CARD}>
                        Credit Card
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="initialBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Balance</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input placeholder="INR" {...field} maxLength={3} />
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
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isEditing ? "Update" : "Create"} Account
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
