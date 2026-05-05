"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateCategory } from "../hooks/use-create-category";
import { useUpdateCategory } from "../hooks/use-update-category";
import { createCategorySchema, type CreateCategoryInput } from "../schemas";
import type { Category } from "../types";
import { toast } from "sonner";

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
};

const DEFAULT_COLORS = [
  "#EF4444", // red
  "#F59E0B", // amber
  "#10B981", // green
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F43F5E", // rose
  "#6B7280", // gray
];

export const CategoryFormDialog = ({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) => {
  const isEditing = !!category;

  const { createCategory, isCreating } = useCreateCategory();
  const { updateCategory, isUpdating } = useUpdateCategory();

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && category) {
        form.reset({
          name: category.name,
          color: category.color,
        });
      } else {
        form.reset({
          name: "",
        });
      }
    }
  }, [open, isEditing, category, form]);

  const onSubmit = async (data: CreateCategoryInput) => {
    try {
      const categoryData = {
        name: data.name,
        color: data.color || "#9333EA",
      };

      if (isEditing && category) {
        await updateCategory({
          id: category.id,
          data: categoryData,
        });
        toast.success("Category updated successfully");
      } else {
        await createCategory(categoryData);
        toast.success("Category created successfully");
      }
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : isEditing
            ? "Failed to update category"
            : "Failed to create category";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the category details below."
              : "Create a new category for your expenses."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="space-y-3">
                    <div className="grid grid-cols-10 gap-2">
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            field.value === color
                              ? "border-primary scale-110"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          {...field}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="#9333EA"
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? (
                  <>{isEditing ? "Updating..." : "Creating..."}</>
                ) : (
                  <>{isEditing ? "Update" : "Create"} Category</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
