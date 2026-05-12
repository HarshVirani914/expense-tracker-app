"use client";

import { useConfirmDialog } from "@/components/confirm-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  IconAlertCircle,
  IconArrowRight,
  IconExternalLink,
  IconMail,
  IconPencil,
  IconPhone,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { useCheckContactDeletion } from "../hooks/use-check-contact-deletion";
import { useContactSharedExpenses } from "../hooks/use-contact-shared-expenses";
import { useDeleteContact } from "../hooks/use-delete-contact";
import type { ContactWithRelations } from "../types";

type ManageContactSheetProps = {
  contact: ContactWithRelations;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contact: ContactWithRelations) => void;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const ManageContactSheet = ({
  contact,
  isOpen,
  onClose,
  onEdit,
}: ManageContactSheetProps) => {
  const { deleteContact, isDeleting } = useDeleteContact();
  const { deletionCheck, isLoading: isCheckingDeletion } =
    useCheckContactDeletion(contact.id);
  const { sharedExpenses, isLoading: isLoadingExpenses } =
    useContactSharedExpenses(contact.id, 5);
  const { confirm } = useConfirmDialog();

  const handleDelete = async () => {
    if (!deletionCheck) return;

    let description = `Are you sure you want to delete "${contact.name}"?`;

    if (!deletionCheck.canDelete) {
      const { activeGroups, totalOwed, totalOwing } = deletionCheck.reasons;
      const reasons = [];

      if (activeGroups.length > 0) {
        reasons.push(
          `\n• Part of ${activeGroups.length} active group(s): ${activeGroups.map((g) => g.name).join(", ")}`,
        );
      }
      if (totalOwed > 0) {
        reasons.push(
          `\n• Owed ${formatCurrency(totalOwed)} from unsettled expenses`,
        );
      }
      if (totalOwing > 0) {
        reasons.push(
          `\n• Owes ${formatCurrency(totalOwing)} in unsettled expenses`,
        );
      }

      description = `Cannot delete "${contact.name}" because they are:${reasons.join("")}\n\nPlease settle all expenses and remove from groups first.`;
    } else {
      description += " This action cannot be undone.";
    }

    const confirmed = await confirm({
      title: "Delete Contact",
      description,
      confirmText: deletionCheck.canDelete ? "Delete" : "OK",
      cancelText: "Cancel",
      variant: deletionCheck.canDelete ? "destructive" : "default",
    });

    if (confirmed && deletionCheck.canDelete) {
      try {
        await deleteContact(contact.id);
        toast.success("Contact deleted successfully");
        onClose();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete contact";
        toast.error(message);
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="p-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Contact Details</SheetTitle>
          <SheetDescription>
            View and manage contact information
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className={cn("h-16 w-16", getAvatarColor(contact.name))}>
              <AvatarFallback className="text-white font-semibold text-xl bg-transparent">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold">{contact.name}</h3>
              {contact._count && (
                <p className="text-sm text-muted-foreground">
                  {contact._count.groupMemberships > 0
                    ? "Active"
                    : "No activity"}
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-3">Contact Information</h4>
            <div className="space-y-2">
              {contact.email ? (
                <div className="flex items-center gap-2 text-sm">
                  <IconMail className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.email}</span>
                </div>
              ) : null}
              {contact.phone ? (
                <div className="flex items-center gap-2 text-sm">
                  <IconPhone className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.phone}</span>
                </div>
              ) : null}
              {!contact.email && !contact.phone && (
                <p className="text-sm text-muted-foreground italic">
                  No contact information
                </p>
              )}
            </div>
          </div>

          {contact._count && contact._count.groupMemberships > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">Groups</h4>
                <Link
                  href={`/groups?contact=${contact.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full p-2 bg-blue-500/10">
                      <IconUsers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">View Groups</p>
                      <p className="text-xs text-muted-foreground">
                        Member of {contact._count.groupMemberships}{" "}
                        {contact._count.groupMemberships === 1
                          ? "group"
                          : "groups"}
                      </p>
                    </div>
                  </div>
                  <IconExternalLink className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            </>
          )}

          {contact._count && contact._count.expenseParticipants > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">
                    Recent Shared Expenses
                  </h4>
                  <Badge variant="secondary">
                    {contact._count.expenseParticipants} total
                  </Badge>
                </div>

                {isLoadingExpenses ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : sharedExpenses && sharedExpenses.length > 0 ? (
                  <div className="space-y-2">
                    {sharedExpenses.map((expense) => (
                      <Link
                        key={expense.id}
                        href={`/groups/${expense.groupId}`}
                        onClick={onClose}
                        className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: expense.categoryColor,
                                }}
                              />
                              <p className="text-sm font-medium truncate">
                                {expense.description || expense.categoryName}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {expense.groupName} •{" "}
                              {format(new Date(expense.date), "MMM d, yyyy")}
                            </p>
                            <div className="flex items-center gap-3 text-xs">
                              <span
                                className={
                                  expense.userPaid > expense.userOwes
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-muted-foreground"
                                }
                              >
                                You:{" "}
                                {formatCurrency(
                                  expense.userPaid - expense.userOwes,
                                )}
                              </span>
                              <span
                                className={
                                  expense.contactPaid > expense.contactOwes
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-muted-foreground"
                                }
                              >
                                {contact.name}:{" "}
                                {formatCurrency(
                                  expense.contactPaid - expense.contactOwes,
                                )}
                              </span>
                            </div>
                          </div>
                          <IconArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No shared expenses yet
                  </p>
                )}
              </div>
            </>
          )}

          {isCheckingDeletion ? (
            <>
              <Separator />
              <Skeleton className="h-20 w-full" />
            </>
          ) : (
            deletionCheck &&
            !deletionCheck.canDelete && (
              <>
                <Separator />
                <Alert variant="destructive">
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertDescription className="space-y-2">
                    <p className="font-medium">Cannot delete this contact:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {deletionCheck.reasons.activeGroups.length > 0 && (
                        <li>
                          Member of {deletionCheck.reasons.activeGroups.length}{" "}
                          group(s):{" "}
                          {deletionCheck.reasons.activeGroups.map((g, i) => (
                            <span key={g.id}>
                              <Link
                                href={`/groups/${g.id}`}
                                className="underline hover:text-destructive-foreground"
                                onClick={onClose}
                              >
                                {g.name}
                              </Link>
                              {i <
                                deletionCheck.reasons.activeGroups.length - 1 &&
                                ", "}
                            </span>
                          ))}
                        </li>
                      )}
                      {deletionCheck.reasons.totalOwed > 0 && (
                        <li>
                          Owed {formatCurrency(deletionCheck.reasons.totalOwed)}{" "}
                          from {deletionCheck.reasons.unsettledExpenses}{" "}
                          unsettled expense(s)
                        </li>
                      )}
                      {deletionCheck.reasons.totalOwing > 0 && (
                        <li>
                          Owes{" "}
                          {formatCurrency(deletionCheck.reasons.totalOwing)} in
                          unsettled expenses
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              </>
            )
          )}

          <Separator />

          <div className="flex gap-2">
            <Button
              onClick={() => onEdit(contact)}
              className="flex-1 gap-2"
              variant="outline"
            >
              <IconPencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={handleDelete}
              disabled={
                isDeleting || isCheckingDeletion || !deletionCheck?.canDelete
              }
              variant="destructive"
              className="flex-1 gap-2"
            >
              <IconTrash className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
