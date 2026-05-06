"use client";

import { useState } from "react";
import { useContacts } from "../hooks/use-contacts";
import { useDeleteContact } from "../hooks/use-delete-contact";
import type { ContactWithRelations } from "../types";
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
  IconMail,
  IconPhone,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconUsers,
  IconReceipt,
} from "@tabler/icons-react";
import { toast } from "sonner";
import type { ContactFilters } from "../types";

type ContactListProps = {
  onEdit: (contact: ContactWithRelations) => void;
  filters: ContactFilters;
};

export const ContactList = ({ onEdit, filters }: ContactListProps) => {
  const { contacts, isLoading } = useContacts(filters);
  const { deleteContact, isDeleting } = useDeleteContact();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] =
    useState<ContactWithRelations | null>(null);

  const handleDeleteClick = (contact: ContactWithRelations) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return;

    try {
      await deleteContact(contactToDelete.id);
      toast.success("Contact deleted successfully");
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete contact";
      toast.error(message);
    }
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

  if (!contacts || contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <IconUsers className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No contacts yet</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Add your first contact to start splitting expenses with friends and family.
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
              <TableHead>Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead>Expenses</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="font-medium">{contact.name}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-sm">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <IconMail className="h-3.5 w-3.5" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <IconPhone className="h-3.5 w-3.5" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {!contact.email && !contact.phone && (
                      <span className="text-muted-foreground text-xs italic">
                        No contact info
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {contact._count && contact._count.groupMemberships > 0 ? (
                    <Badge variant="secondary" className="gap-1">
                      <IconUsers className="h-3 w-3" />
                      {contact._count.groupMemberships}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">0</span>
                  )}
                </TableCell>
                <TableCell>
                  {contact._count && contact._count.expenseParticipants > 0 ? (
                    <Badge variant="secondary" className="gap-1">
                      <IconReceipt className="h-3 w-3" />
                      {contact._count.expenseParticipants}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">0</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(contact)}>
                        <IconEdit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(contact)}
                        className="text-destructive focus:text-destructive"
                      >
                        <IconTrash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{contactToDelete?.name}</span>?
              {contactToDelete?._count &&
              (contactToDelete._count.groupMemberships > 0 ||
                contactToDelete._count.expenseParticipants > 0) ? (
                <span className="block mt-2 text-destructive">
                  This contact is part of {contactToDelete._count.groupMemberships}{" "}
                  group(s) and {contactToDelete._count.expenseParticipants}{" "}
                  expense(s). Deletion is not allowed.
                </span>
              ) : (
                <span className="block mt-2">
                  This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={
                isDeleting ||
                (contactToDelete?._count &&
                  (contactToDelete._count.groupMemberships > 0 ||
                    contactToDelete._count.expenseParticipants > 0))
              }
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
