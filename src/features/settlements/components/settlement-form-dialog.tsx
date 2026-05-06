"use client";

import { useEffect, useState } from "react";
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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateSettlement } from "../hooks/use-create-settlement";
import { createSettlementSchema, type CreateSettlementInput } from "../schemas";
import type { MemberInfo } from "@/features/groups/types";
import { toast } from "sonner";

type SettlementFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  members: MemberInfo[];
};

export const SettlementFormDialog = ({
  open,
  onOpenChange,
  groupId,
  members,
}: SettlementFormDialogProps) => {
  const { createSettlement, isCreating } = useCreateSettlement();
  const [payerId, setPayerId] = useState("");
  const [receiverId, setReceiverId] = useState("");

  const form = useForm<CreateSettlementInput>({
    resolver: zodResolver(createSettlementSchema),
    mode: "onSubmit",
    defaultValues: {
      amount: 0,
      notes: "",
      groupId,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        amount: 0,
        notes: "",
        groupId,
      });
      setPayerId("");
      setReceiverId("");
    }
  }, [open, groupId, form]);

  const onSubmit = async (data: CreateSettlementInput) => {
    try {
      const payer = members.find((m) => (m.userId || m.contactId) === payerId);
      const receiver = members.find(
        (m) => (m.userId || m.contactId) === receiverId,
      );

      if (!payer || !receiver) {
        toast.error("Please select both payer and receiver");
        return;
      }

      const payload = {
        ...data,
        payerUserId: payer.userId || null,
        payerContactId: payer.contactId || null,
        receiverUserId: receiver.userId || null,
        receiverContactId: receiver.contactId || null,
      };

      await createSettlement(payload);
      toast.success("Settlement recorded successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to record settlement");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record when a member pays back what they owe
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>From (Payer) *</FormLabel>
              <Select value={payerId} onValueChange={setPayerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem
                      key={member.id}
                      value={member.userId || member.contactId || ""}
                    >
                      {member.name}
                      {member.isCurrentUser && " (You)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <FormLabel>To (Receiver) *</FormLabel>
              <Select value={receiverId} onValueChange={setReceiverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select who received" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem
                      key={member.id}
                      value={member.userId || member.contactId || ""}
                    >
                      {member.name}
                      {member.isCurrentUser && " (You)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <DatePicker
                    date={field.value instanceof Date ? field.value : undefined}
                    onSelect={field.onChange}
                    placeholder="Select date"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes..."
                      {...field}
                      value={field.value || ""}
                      rows={3}
                    />
                  </FormControl>
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
              <Button
                type="submit"
                disabled={isCreating || !payerId || !receiverId}
              >
                {isCreating ? "Recording..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
