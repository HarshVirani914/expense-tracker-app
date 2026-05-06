"use client";

import { useState } from "react";
import { useSettlements } from "../hooks/use-settlements";
import { useDeleteSettlement } from "../hooks/use-delete-settlement";
import type { SettlementWithRelations } from "../types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  IconArrowRight,
  IconTrash,
  IconCash,
  IconCalendar,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { toast } from "sonner";

type SettlementHistoryProps = {
  groupId: string;
};

export const SettlementHistory = ({ groupId }: SettlementHistoryProps) => {
  const { settlements, isLoading } = useSettlements({ groupId });
  const { deleteSettlement, isDeleting } = useDeleteSettlement();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settlementToDelete, setSettlementToDelete] =
    useState<SettlementWithRelations | null>(null);

  const handleDeleteClick = (settlement: SettlementWithRelations) => {
    setSettlementToDelete(settlement);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!settlementToDelete) return;

    try {
      await deleteSettlement(settlementToDelete.id);
      toast.success("Settlement deleted successfully");
      setDeleteDialogOpen(false);
      setSettlementToDelete(null);
    } catch {
      toast.error("Failed to delete settlement");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (!settlements || settlements.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <IconCash className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            No settlements recorded yet
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Settlement History</h3>
        <div className="space-y-3">
          {settlements.map((settlement) => {
            const payerName =
              settlement.payerUser?.name ||
              settlement.payerContact?.name ||
              "Unknown";
            const receiverName =
              settlement.receiverUser?.name ||
              settlement.receiverContact?.name ||
              "Unknown";

            return (
              <div
                key={settlement.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{payerName}</span>
                    <IconArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{receiverName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <IconCalendar className="h-3.5 w-3.5" />
                      {format(new Date(settlement.date), "MMM d, yyyy")}
                    </div>
                    <Badge className="bg-green-600">
                      ${Number(settlement.amount).toFixed(2)}
                    </Badge>
                  </div>
                  {settlement.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {settlement.notes}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(settlement)}
                  className="text-destructive hover:text-destructive"
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Settlement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this settlement record? This action
              cannot be undone.
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
