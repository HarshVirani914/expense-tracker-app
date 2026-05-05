"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExpenseFormDialog } from "@/features/expenses/components/expense-form-dialog";
import { AccountFormDialog } from "@/features/accounts/components/account-form-dialog";

export const QuickActions = () => {
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <Button
          onClick={() => setExpenseDialogOpen(true)}
          className="gap-2 w-full md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
        <Button
          onClick={() => setAccountDialogOpen(true)}
          variant="outline"
          className="gap-2 w-full md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      <ExpenseFormDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
      />

      <AccountFormDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
      />
    </>
  );
};
