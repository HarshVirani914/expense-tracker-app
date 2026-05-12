"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconArrowLeft,
  IconEdit,
  IconPlus,
  IconUsers,
} from "@tabler/icons-react";

type GroupHeaderProps = {
  groupName: string;
  description?: string;
  isAdmin: boolean;
  memberCount: number;
  onBack: () => void;
  onAddExpense: () => void;
  onEditGroup: () => void;
  isMobile?: boolean;
};

export const GroupHeader = ({
  groupName,
  description,
  isAdmin,
  memberCount,
  onBack,
  onAddExpense,
  onEditGroup,
  isMobile = false,
}: GroupHeaderProps) => {
  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-2 -ml-2"
      >
        <IconArrowLeft className="h-4 w-4" />
        Back to Groups
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {groupName}
            </h1>
            {isAdmin && (
              <Badge variant="default" className="gap-1.5">
                Admin
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <IconUsers className="h-4 w-4" />
              <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
            </div>
            {description && (
              <>
                <span>•</span>
                <p className="line-clamp-1">{description}</p>
              </>
            )}
          </div>
        </div>

        {!isMobile && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="default"
              size="lg"
              className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
              onClick={onAddExpense}
            >
              <IconPlus className="h-5 w-5" />
              Add Expense
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
        )}
      </div>
    </div>
  );
};
