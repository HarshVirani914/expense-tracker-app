"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconArrowLeft,
  IconEdit,
  IconPlus,
} from "@tabler/icons-react";

type GroupHeaderProps = {
  groupName: string;
  description?: string;
  isAdmin: boolean;
  onBack: () => void;
  onAddExpense: () => void;
  onEditGroup: () => void;
};

export const GroupHeader = ({
  groupName,
  description,
  isAdmin,
  onBack,
  onAddExpense,
  onEditGroup,
}: GroupHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-4 pb-6 border-b">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 shrink-0"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {groupName}
            </h1>
            {isAdmin && <Badge variant="secondary" className="shrink-0">Admin</Badge>}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground truncate">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="default"
          size="lg"
          className="gap-2"
          onClick={onAddExpense}
        >
          <IconPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Expense</span>
        </Button>
        {isAdmin && (
          <Button
            variant="outline"
            size="lg"
            onClick={onEditGroup}
          >
            <IconEdit className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
