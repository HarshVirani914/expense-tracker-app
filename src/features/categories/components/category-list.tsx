"use client";

import { useCategories } from "../hooks/use-categories";
import { useDeleteCategory } from "../hooks/use-delete-category";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconEdit, IconTrash, IconTag } from "@tabler/icons-react";
import { toast } from "sonner";
import type { Category } from "../types";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
      <Card className="divide-y">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </Card>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Card className="border-dashed">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <IconTag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No categories yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Get started by creating your first category to organize your expenses.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="divide-y">
      {categories.map((category) => (
        <div
          key={category.id}
          className={cn(
            "group flex items-center gap-4 p-4 transition-colors hover:bg-muted/50",
            category.isDefault && "bg-muted/30"
          )}
        >
          <div
            className="rounded-xl p-2.5 shrink-0 transition-transform duration-200 group-hover:scale-110"
            style={{ backgroundColor: category.color + "20" }}
          >
            <IconTag className="h-5 w-5" style={{ color: category.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-base">{category.name}</span>
              {category.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  Default
                </Badge>
              )}
            </div>
          </div>

          <div
            className="w-1 h-8 rounded-full transition-all duration-200 group-hover:w-1.5"
            style={{ backgroundColor: category.color }}
          />

          {!category.isDefault && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(category)}
                className="h-8 w-8"
              >
                <IconEdit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(category.id, category.name)}
                disabled={isDeleting}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </Card>
  );
};
