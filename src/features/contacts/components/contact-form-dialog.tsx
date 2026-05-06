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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateContact } from "../hooks/use-create-contact";
import { useUpdateContact } from "../hooks/use-update-contact";
import { createContactSchema, type CreateContactInput } from "../schemas";
import type { ContactWithRelations } from "../types";
import { toast } from "sonner";

type ContactFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: ContactWithRelations;
};

export const ContactFormDialog = ({
  open,
  onOpenChange,
  contact,
}: ContactFormDialogProps) => {
  const isEditing = !!contact;
  const { createContact, isCreating } = useCreateContact();
  const { updateContact, isUpdating } = useUpdateContact();

  const form = useForm<CreateContactInput>({
    resolver: zodResolver(createContactSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && contact) {
        form.reset({
          name: contact.name,
          email: contact.email || "",
          phone: contact.phone || "",
        });
      } else {
        form.reset({
          name: "",
          email: "",
          phone: "",
        });
      }
    }
  }, [open, isEditing, contact, form]);

  const onSubmit = async (data: CreateContactInput) => {
    try {
      if (isEditing && contact) {
        await updateContact({
          id: contact.id,
          data,
        });
        toast.success("Contact updated successfully");
      } else {
        await createContact(data);
        toast.success("Contact created successfully");
      }
      onOpenChange(false);
    } catch {
      toast.error(
        isEditing ? "Failed to update contact" : "Failed to create contact",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Contact" : "Add New Contact"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the contact details below."
              : "Add a new person to your contacts for group expenses."}
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
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      maxLength={15}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter phone number with at least 10 digits
                  </FormDescription>
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
                {isEditing ? "Update" : "Create"} Contact
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
