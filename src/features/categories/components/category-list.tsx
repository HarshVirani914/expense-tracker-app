"use client";

import { useCategories } from "../hooks/use-categories";
import { useDeleteCategory } from "../hooks/use-delete-category";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "../types";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { GridSkeleton } from "@/components/skeletons";

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
    return <GridSkeleton count={8} />;
  }

  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No categories found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => (
        <Card key={category.id} className="relative overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full h-2"
            style={{ backgroundColor: category.color }}
          />
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{category.name}</h3>
                {category.isDefault && (
                  <Badge variant="secondary" className="mt-2">
                    Default
                  </Badge>
                )}
              </div>
              {!category.isDefault && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />{" "}
                    {isDeleting ? "Deleting..." : ""}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
