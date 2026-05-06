"use client";

import { useCategories } from "../hooks/use-categories";
import { useDeleteCategory } from "../hooks/use-delete-category";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash, IconTag } from "@tabler/icons-react";
import { toast } from "sonner";
import type { Category } from "../types";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";

type CategoryListProps = {
  onEdit: (category: Category) => void;
};

export const CategoryList = ({ onEdit }: CategoryListProps) => {
  const { categories, isLoading } = useCategories();
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
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3 px-4 rounded-lg border bg-card"
          >
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 flex-1 max-w-xs" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg border-dashed bg-muted/20">
        <IconTag className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <h3 className="font-medium text-base mb-1">No categories yet</h3>
        <p className="text-muted-foreground text-sm">
          Create your first category to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className="group flex items-center gap-3 py-3 px-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
        >
          <div
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: category.color }}
          />

          <span className="font-medium text-sm flex-1">{category.name}</span>

          {category.isDefault && (
            <Badge variant="secondary" className="text-xs font-normal">
              System
            </Badge>
          )}

          {!category.isDefault && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(category)}
                className="h-7 w-7"
              >
                <IconEdit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(category.id, category.name)}
                disabled={isDeleting}
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <IconTrash className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
