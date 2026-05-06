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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ContactSelect } from "@/features/contacts/components/contact-select";
import { useCreateGroup } from "../hooks/use-create-group";
import { useUpdateGroup } from "../hooks/use-update-group";
import { createGroupSchema, type CreateGroupInput } from "../schemas";
import type { GroupWithMembers } from "../types";
import { toast } from "sonner";

type GroupFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: GroupWithMembers;
};

export const GroupFormDialog = ({
  open,
  onOpenChange,
  group,
}: GroupFormDialogProps) => {
  const isEditing = !!group;
  const { createGroup, isCreating } = useCreateGroup();
  const { updateGroup, isUpdating } = useUpdateGroup();

  const form = useForm<CreateGroupInput>({
    resolver: zodResolver(createGroupSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      description: "",
      memberIds: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && group) {
        const contactMemberIds = group.members
          .filter((m) => m.contactId)
          .map((m) => m.contactId!);

        form.reset({
          name: group.name,
          description: group.description || "",
          memberIds: contactMemberIds,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          memberIds: [],
        });
      }
    }
  }, [open, isEditing, group, form]);

  const onSubmit = async (data: CreateGroupInput) => {
    try {
      if (isEditing && group) {
        await updateGroup({
          id: group.id,
          data: {
            name: data.name,
            description: data.description,
          },
        });
        toast.success("Group updated successfully");
      } else {
        await createGroup(data);
        toast.success("Group created successfully");
      }
      onOpenChange(false);
    } catch {
      toast.error(
        isEditing ? "Failed to update group" : "Failed to create group"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Group" : "Create New Group"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the group details below."
              : "Create a new group to split expenses with friends and family."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Weekend Trip" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description..."
                      {...field}
                      value={field.value || ""}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <FormField
                control={form.control}
                name="memberIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Members *</FormLabel>
                    <FormControl>
                      <ContactSelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select contacts to add"
                      />
                    </FormControl>
                    <FormDescription>
                      You'll be automatically added as the group admin.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isEditing && (
              <div className="text-sm text-muted-foreground">
                To add or remove members, use the member management options in the group detail page.
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isEditing ? "Update" : "Create"} Group
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
