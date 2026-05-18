"use client";

import { Button } from "@/components/ui/button";
import { FeaturePageHero } from "@/components/layout/feature-page-hero";
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
    <div className="flex min-w-0 w-full max-w-full flex-col gap-6">
      {!isMobile && (
        <FeaturePageHero className="p-4 sm:p-5 @container/hero">
          <div className="flex min-w-0 flex-col gap-4 @4xl/hero:flex-row @4xl/hero:items-start @4xl/hero:justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <h1 className="text-3xl font-bold tracking-tight min-[480px]:text-4xl">
                Categories
              </h1>
              <p className="text-muted-foreground text-base wrap-break-word">
                Track your spending by category
              </p>
            </div>
            <div className="flex min-w-0 w-full shrink-0 flex-wrap items-center gap-2 @4xl/hero:w-auto @4xl/hero:justify-end">
              <ManageCategoriesSheet
                trigger={
                  <Button variant="outline" size="lg" className="gap-2 shrink-0">
                    <IconSettings className="h-5 w-5" />
                    Manage Categories
                  </Button>
                }
              />
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="min-w-0 gap-2 shadow-lg hover:shadow-xl transition-shadow shrink-0"
                size="lg"
              >
                <IconPlus className="h-5 w-5 shrink-0" />
                Add Category
              </Button>
            </div>
          </div>
        </FeaturePageHero>
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

      <CategoryFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
      />

      {isMobile && (
        <div className="fixed bottom-26 right-6 flex flex-col gap-2 z-40">
          <ManageCategoriesSheet
            trigger={
              <Button
                size="lg"
                variant="secondary"
                className="h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-transform"
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
