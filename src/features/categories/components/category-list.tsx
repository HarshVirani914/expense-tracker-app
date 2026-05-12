"use client";

import { useCategories } from "../hooks/use-categories";
import { useDeleteCategory } from "../hooks/use-delete-category";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconTag } from "@tabler/icons-react";
import { toast } from "sonner";
import type { Category } from "../types";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryCard } from "./category-card";

type CategoryListProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onAddCategory?: () => void;
  isLoading?: boolean;
};

export const CategoryList = ({
  categories,
  onEdit,
  onAddCategory,
  isLoading,
}: CategoryListProps) => {
  const { deleteCategory, isDeleting } = useDeleteCategory();
  const { confirm } = useConfirmDialog();

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: "Delete Category",
      description: `Are you sure you want to delete "${name}"? This action cannot be undone and will affect all expenses using this category.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (confirmed) {
      try {
        await deleteCategory(id);
        toast.success("Category deleted successfully");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete category";
        toast.error(message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <IconTag className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Create your first category to organize your expenses
          </p>
          {onAddCategory && (
            <Button onClick={onAddCategory} size="lg">
              Add First Category
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};
