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
import { updateGroupSchema, type UpdateGroupInput } from "../schemas";
import type { GroupWithMembers } from "../types";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconAlertCircle } from "@tabler/icons-react";

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

  const form = useForm<UpdateGroupInput>({
    resolver: zodResolver(updateGroupSchema),
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

  const onSubmit = async (data: UpdateGroupInput) => {
    try {
      if (isEditing && group) {
        await updateGroup({
          id: group.id,
          data,
        });
        toast.success("Group updated successfully");
      } else {
        await createGroup({
          name: data.name!,
          description: data.description,
          memberIds: data.memberIds || [],
        });
        toast.success("Group created successfully");
      }
      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(
        isEditing ? "Failed to update group" : "Failed to create group",
        {
          description: errorMessage,
        }
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
              ? "Update the group details and members below."
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

            <FormField
              control={form.control}
              name="memberIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Members *</FormLabel>
                  <FormControl>
                    <ContactSelect
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select contacts to add"
                    />
                  </FormControl>
                  <FormDescription>
                    {isEditing
                      ? "Add or remove members. You cannot remove members with existing expenses or settlements."
                      : "You'll be automatically added as the group admin."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <Alert>
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Members with expenses or payment history cannot be removed to
                  preserve financial records. Settle all balances before
                  removing a member.
                </AlertDescription>
              </Alert>
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
