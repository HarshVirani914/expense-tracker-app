"use client";

import { Button } from "@/components/ui/button";
import { CategorySpendingSummaryCard } from "@/features/categories/components/category-spending-summary-card";
import { CategorySpendingList } from "@/features/categories/components/category-spending-list";
import { ManageCategoriesSheet } from "@/features/categories/components/manage-categories-sheet";
import { useCategorySpending } from "@/features/categories/hooks/use-category-spending";
import { IconSettings, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryFormDialog } from "@/features/categories/components/category-form-dialog";

export default function CategoriesPage() {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { categorySpending, isLoading } = useCategorySpending();

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {!isMobile && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground text-base">
              Track your spending by category
            </p>
          </div>
          <div className="flex gap-2">
            <ManageCategoriesSheet />
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
              size="lg"
            >
              <IconPlus className="h-5 w-5" />
              Add Category
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </>
      ) : categorySpending && categorySpending.length > 0 ? (
        <>
          <CategorySpendingSummaryCard categorySpending={categorySpending} />
          <CategorySpendingList categorySpending={categorySpending} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">
            No spending data available. Add some expenses to see insights.
          </p>
        </div>
      )}

      <CategoryFormDialog open={isDialogOpen} onOpenChange={handleCloseDialog} />

      {isMobile && (
        <div className="fixed bottom-24 right-4 flex flex-col gap-2 z-40">
          <ManageCategoriesSheet
            trigger={
              <Button
                size="lg"
                variant="outline"
                className="h-14 w-14 rounded-full shadow-2xl bg-background hover:scale-110 transition-transform"
              >
                <IconSettings className="h-6 w-6" />
              </Button>
            }
          />
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="lg"
            className="h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-transform"
          >
            <IconPlus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
