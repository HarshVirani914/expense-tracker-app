"use client";

import { Button } from "@/components/ui/button";
import { IconReceipt, IconPlus } from "@tabler/icons-react";

type ExpenseEmptyStateProps = {
  onAddExpense?: () => void;
};

export const ExpenseEmptyState = ({
  onAddExpense,
}: ExpenseEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-primary/10 p-6 mb-4">
        <IconReceipt className="h-12 w-12 text-primary" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">No expenses yet</h3>
      
      <p className="text-muted-foreground max-w-md mb-6">
        Start tracking your spending by adding your first expense. Keep track of where your money goes!
      </p>
      
      {onAddExpense && (
        <Button onClick={onAddExpense} size="lg" className="gap-2">
          <IconPlus className="h-5 w-5" />
          Add First Expense
        </Button>
      )}
    </div>
  );
};
