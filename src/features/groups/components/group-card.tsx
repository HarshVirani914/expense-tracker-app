"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  IconUsers,
  IconReceipt,
  IconEye,
  IconDotsVertical,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import type { GroupWithMembers } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type GroupCardProps = {
  group: GroupWithMembers;
  onView: (groupId: string) => void;
  onEdit: (group: GroupWithMembers) => void;
  onDelete: (group: GroupWithMembers) => void;
};

export const GroupCard = ({
  group,
  onView,
  onEdit,
  onDelete,
}: GroupCardProps) => {
  const memberCount = group.members.length;
  const expenseCount = group._count?.expenses || 0;
  const hasExpenses = expenseCount > 0;

  return (
    <Card
      className="group shadow-none hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onView(group.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="space-y-1">
              <h3 className="font-semibold text-base truncate">{group.name}</h3>
              {group.description ? (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {group.description}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No description
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className={cn(
                  "gap-1.5 font-medium",
                  hasExpenses &&
                    "bg-primary/10 text-primary hover:bg-primary/20",
                )}
              >
                <IconUsers className="h-3.5 w-3.5" />
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </Badge>

              <Badge
                variant={hasExpenses ? "default" : "secondary"}
                className="gap-1.5 font-medium"
              >
                <IconReceipt className="h-3.5 w-3.5" />
                {expenseCount} {expenseCount === 1 ? "expense" : "expenses"}
              </Badge>
            </div>
          </div>

          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onView(group.id)}
            >
              <IconEye className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <IconDotsVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(group)}>
                  <IconEdit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(group)}
                  className="text-destructive focus:text-destructive"
                >
                  <IconTrash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
