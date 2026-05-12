"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IconSettings,
  IconPencil,
  IconTrash,
  IconLock,
  IconPlus,
} from "@tabler/icons-react";
import { useState } from "react";
import { useCategories } from "../hooks/use-categories";
import { useDeleteCategory } from "../hooks/use-delete-category";
import { CategoryFormDialog } from "./category-form-dialog";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import type { Category } from "../types";
import { Skeleton } from "@/components/ui/skeleton";

type ManageCategoriesSheetProps = {
  trigger?: React.ReactNode;
};

export const ManageCategoriesSheet = ({
  trigger,
}: ManageCategoriesSheetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >(undefined);

  const { categories, isLoading } = useCategories();
  const { deleteCategory, isDeleting } = useDeleteCategory();
  const { confirm } = useConfirmDialog();

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCategory(undefined);
  };

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

  const handleAddNew = () => {
    setSelectedCategory(undefined);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {trigger || (
            <Button variant="outline" className="gap-2">
              <IconSettings className="h-4 w-4" />
              Manage Categories
            </Button>
          )}
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Manage Categories</SheetTitle>
            <SheetDescription>
              Edit or delete your expense categories
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4 p-4">
            <Button onClick={handleAddNew} className="w-full gap-2">
              <IconPlus className="h-4 w-4" />
              Add New Category
            </Button>

            <Separator />

            <div className="h-[calc(100vh-16rem)] overflow-y-auto pr-2">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {categories?.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div
                        className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {category.name}
                        </h3>
                        {category.isDefault && (
                          <Badge
                            variant="secondary"
                            className="text-xs font-normal mt-1 gap-1"
                          >
                            <IconLock className="h-3 w-3" />
                            System
                          </Badge>
                        )}
                      </div>

                      {!category.isDefault && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category)}
                            className="h-8 w-8"
                          >
                            <IconPencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDelete(category.id, category.name)
                            }
                            disabled={isDeleting}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CategoryFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        category={selectedCategory}
      />
    </>
  );
};
