"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGroups } from "../hooks/use-groups";
import { useDeleteGroup } from "../hooks/use-delete-group";
import type { GroupWithMembers, GroupFilters } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconUsers,
  IconReceipt,
  IconEye,
} from "@tabler/icons-react";
import { toast } from "sonner";

type GroupListProps = {
  onEdit: (group: GroupWithMembers) => void;
  filters: GroupFilters;
};

export const GroupList = ({ onEdit, filters }: GroupListProps) => {
  const router = useRouter();
  const { groups, isLoading } = useGroups(filters);
  const { deleteGroup, isDeleting } = useDeleteGroup();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<GroupWithMembers | null>(
    null
  );

  const handleDeleteClick = (group: GroupWithMembers) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return;

    try {
      await deleteGroup(groupToDelete.id);
      toast.success("Group deleted successfully");
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete group";
      toast.error(message);
    }
  };

  const handleViewGroup = (groupId: string) => {
    router.push(`/groups/${groupId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <IconUsers className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Create your first group to start splitting expenses with others.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group Name</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Expenses</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow
                key={group.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleViewGroup(group.id)}
              >
                <TableCell>
                  <div className="font-medium">{group.name}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="gap-1">
                    <IconUsers className="h-3 w-3" />
                    {group.members.length}
                  </Badge>
                </TableCell>
                <TableCell>
                  {group._count && group._count.expenses > 0 ? (
                    <Badge variant="secondary" className="gap-1">
                      <IconReceipt className="h-3 w-3" />
                      {group._count.expenses}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">0</span>
                  )}
                </TableCell>
                <TableCell>
                  {group.description ? (
                    <span className="text-sm text-muted-foreground line-clamp-1">
                      {group.description}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      No description
                    </span>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewGroup(group.id)}
                    >
                      <IconEye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <IconDotsVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(group)}>
                          <IconEdit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(group)}
                          className="text-destructive focus:text-destructive"
                        >
                          <IconTrash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{groupToDelete?.name}</span>?
              {groupToDelete?._count && groupToDelete._count.expenses > 0 ? (
                <span className="block mt-2 text-amber-600">
                  This group has {groupToDelete._count.expenses} expense(s). All
                  expense data will be permanently deleted.
                </span>
              ) : null}
              <span className="block mt-2">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
