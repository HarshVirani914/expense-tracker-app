"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IconPencil, IconTrash, IconLock } from "@tabler/icons-react";
import type { Category } from "../types";

type CategoryCardProps = {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string, name: string) => void;
  isDeleting?: boolean;
};

export const CategoryCard = ({
  category,
  onEdit,
  onDelete,
  isDeleting,
}: CategoryCardProps) => {
  return (
    <Card className="group hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
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
            <h3 className="font-semibold text-base truncate">
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
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(category)}
                className="h-8 w-8"
              >
                <IconPencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(category.id, category.name)}
                disabled={isDeleting}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
