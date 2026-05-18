"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ExpenseList } from "@/features/expenses/components/expense-list";
import { ExpenseFiltersBar } from "@/features/expenses/components/expense-filters";
import { ExpenseFormDialog } from "@/features/expenses/components/expense-form-dialog";
import { GroupExpenseFormDialog } from "@/features/expenses/components/group-expense-form-dialog";
import { ExpenseSummaryCard } from "@/features/expenses/components/expense-summary-card";
import { useExpenseSummary } from "@/features/expenses/hooks/use-expense-summary";
import type {
  ExpenseWithRelations,
  ExpenseFilters,
} from "@/features/expenses/types";
import { FeaturePageHero } from "@/components/layout/feature-page-hero";
import { ExportDialog } from "@/features/import-export/components/export-dialog";
import { ImportDialog } from "@/features/import-export/components/import-dialog";
import { Button } from "@/components/ui/button";
import { IconPlus, IconFileImport, IconFileExport } from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

function ExpensesPageContent() {
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGroupExpenseDialogOpen, setIsGroupExpenseDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<
    ExpenseWithRelations | undefined
  >(undefined);

  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    limit: 20,
  });

  const filtersWithParams = useMemo(() => {
    const groupId = searchParams.get("group");
    const categoryId = searchParams.get("category");
    const accountId = searchParams.get("account");

    return {
      ...filters,
      ...(groupId && { groupId }),
      ...(categoryId && { categoryId }),
      ...(accountId && { accountId }),
    };
  }, [filters, searchParams]);

  const { summary, isLoading: isSummaryLoading } = useExpenseSummary(filtersWithParams);

  const handleEdit = (expense: ExpenseWithRelations) => {
    setSelectedExpense(expense);
    // Open appropriate dialog based on expense type
    if (expense.groupId) {
      setIsGroupExpenseDialogOpen(true);
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedExpense(undefined);
  };

  const handleCloseGroupExpenseDialog = () => {
    setIsGroupExpenseDialogOpen(false);
    setSelectedExpense(undefined);
  };

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-6">
      {!isMobile && (
        <FeaturePageHero className="p-4 sm:p-5 @container/hero">
          <div className="flex min-w-0 flex-col gap-4 @4xl/hero:flex-row @4xl/hero:items-start @4xl/hero:justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <h1 className="text-3xl font-bold tracking-tight min-[480px]:text-4xl">
                Expenses
              </h1>
              <p className="text-muted-foreground text-base wrap-break-word">
                Track and manage all your expenses
              </p>
            </div>
            <div className="flex min-w-0 w-full shrink-0 flex-wrap items-center gap-2 @4xl/hero:w-auto @4xl/hero:justify-end">
              <Button
                onClick={() => setIsImportOpen(true)}
                variant="outline"
                size="lg"
                className="gap-2 shrink-0"
              >
                <IconFileImport className="h-5 w-5" />
                Import
              </Button>
              <Button
                onClick={() => setIsExportOpen(true)}
                variant="outline"
                size="lg"
                className="gap-2 shrink-0"
              >
                <IconFileExport className="h-5 w-5" />
                Export
              </Button>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="min-w-0 gap-2 shadow-lg hover:shadow-xl transition-shadow shrink-0"
                size="lg"
              >
                <IconPlus className="h-5 w-5 shrink-0" />
                Add Expense
              </Button>
            </div>
          </div>
        </FeaturePageHero>
      )}

      {isSummaryLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : summary ? (
        <ExpenseSummaryCard {...summary} />
      ) : null}

      {isMobile && (
        <div className="flex gap-2">
          <Button
            onClick={() => setIsImportOpen(true)}
            variant="outline"
            className="flex-1 gap-2"
          >
            <IconFileImport className="h-4 w-4" />
            Import CSV
          </Button>
          <Button
            onClick={() => setIsExportOpen(true)}
            variant="outline"
            className="flex-1 gap-2"
          >
            <IconFileExport className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      )}

      <ExpenseFiltersBar filters={filtersWithParams} onFiltersChange={setFilters} />

      <ExpenseList onEdit={handleEdit} filters={filtersWithParams} />

      <ExpenseFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        expense={selectedExpense}
      />

      <GroupExpenseFormDialog
        open={isGroupExpenseDialogOpen}
        onOpenChange={handleCloseGroupExpenseDialog}
        defaultGroupId={selectedExpense?.groupId || undefined}
        expense={selectedExpense}
      />

      <ImportDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
      <ExportDialog open={isExportOpen} onOpenChange={setIsExportOpen} />

      {isMobile && (
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="lg"
          className="fixed bottom-26 right-6 h-14 w-14 rounded-full shadow-2xl z-40 hover:scale-110 transition-transform"
        >
          <IconPlus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-w-0 w-full max-w-full flex-col gap-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    }>
      <ExpensesPageContent />
    </Suspense>
  );
}
