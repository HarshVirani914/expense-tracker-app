"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGroups } from "../hooks/use-groups";
import { useDeleteGroup } from "../hooks/use-delete-group";
import type { GroupWithMembers, GroupFilters } from "../types";
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
import { Skeleton } from "@/components/ui/skeleton";
import { IconUsers } from "@tabler/icons-react";
import { toast } from "sonner";
import { GroupCard } from "./group-card";

type GroupListProps = {
  onEdit: (group: GroupWithMembers) => void;
  filters: GroupFilters;
};

const GridSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} className="h-32 w-full" />
    ))}
  </div>
);

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
    return <GridSkeleton />;
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <IconUsers className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No groups found</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          {filters.search
            ? "Try adjusting your search to find what you're looking for."
            : "Create your first group to start splitting expenses with others."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            onView={handleViewGroup}
            onEdit={onEdit}
            onDelete={handleDeleteClick}
          />
        ))}
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
