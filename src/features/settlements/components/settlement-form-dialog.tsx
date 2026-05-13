"use client";

import { useEffect, useState, useRef } from "react";
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
import { logger } from "@/lib/logger";

type SettlementFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  members: MemberInfo[];
  prefilledData?: {
    payerId: string;
    receiverId: string;
    amount: number;
  };
};

export const SettlementFormDialog = ({
  open,
  onOpenChange,
  groupId,
  members,
  prefilledData,
}: SettlementFormDialogProps) => {
  const { createSettlement, isCreating } = useCreateSettlement();
  const [payerId, setPayerId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [payerError, setPayerError] = useState("");
  const [receiverError, setReceiverError] = useState("");
  const prevOpenRef = useRef(false);

  const form = useForm<CreateSettlementInput>({
    resolver: zodResolver(createSettlementSchema),
    mode: "onBlur",
    defaultValues: {
      amount: undefined,
      notes: "",
      groupId,
      date: new Date(),
      payerUserId: null,
      payerContactId: null,
      receiverUserId: null,
      receiverContactId: null,
    },
  });

  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;
    prevOpenRef.current = open;

    if (justOpened) {
      let initialPayerId = "";
      let initialReceiverId = "";
      let initialAmount: number | undefined = undefined;

      if (prefilledData) {
        if (prefilledData.payerId === "currentUser") {
          const currentUser = members.find((m) => m.isCurrentUser);
          initialPayerId = currentUser?.userId || currentUser?.contactId || "";
        } else {
          initialPayerId = prefilledData.payerId;
        }

        if (prefilledData.receiverId === "currentUser") {
          const currentUser = members.find((m) => m.isCurrentUser);
          initialReceiverId =
            currentUser?.userId || currentUser?.contactId || "";
        } else {
          initialReceiverId = prefilledData.receiverId;
        }

        initialAmount = prefilledData.amount;

        const payer = members.find(
          (m) => (m.userId || m.contactId || "") === initialPayerId
        );
        const receiver = members.find(
          (m) => (m.userId || m.contactId || "") === initialReceiverId
        );

        if (payer) {
          form.setValue("payerUserId", payer.userId || null);
          form.setValue("payerContactId", payer.contactId || null);
        }
        if (receiver) {
          form.setValue("receiverUserId", receiver.userId || null);
          form.setValue("receiverContactId", receiver.contactId || null);
        }
      }

      form.reset({
        amount: initialAmount,
        notes: "",
        groupId,
        date: new Date(),
        payerUserId: null,
        payerContactId: null,
        receiverUserId: null,
        receiverContactId: null,
      });

      requestAnimationFrame(() => {
        setPayerId(initialPayerId);
        setReceiverId(initialReceiverId);
        setPayerError("");
        setReceiverError("");
      });
    }
  }, [open, groupId, form, members, prefilledData]);

  const onSubmit = async (data: CreateSettlementInput) => {
    try {
      setPayerError("");
      setReceiverError("");

      if (!payerId) {
        setPayerError("Please select who paid");
        return;
      }

      if (!receiverId) {
        setReceiverError("Please select who received");
        return;
      }

      if (payerId === receiverId) {
        toast.error("Payer and receiver cannot be the same person");
        return;
      }

      const payer = members.find((m) => (m.userId || m.contactId) === payerId);
      const receiver = members.find(
        (m) => (m.userId || m.contactId) === receiverId,
      );

      if (!payer) {
        setPayerError("Selected payer not found");
        return;
      }

      if (!receiver) {
        setReceiverError("Selected receiver not found");
        return;
      }

      const payload = {
        amount: data.amount,
        date: data.date,
        notes: data.notes,
        groupId: data.groupId,
        payerUserId: payer.userId || null,
        payerContactId: payer.contactId || null,
        receiverUserId: receiver.userId || null,
        receiverContactId: receiver.contactId || null,
      };

      logger.info("Submitting settlement", {
        payerId,
        receiverId,
        data: payload,
      });

      await createSettlement(payload);
      toast.success("Settlement recorded successfully");
      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to record settlement";
      toast.error(errorMessage);
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
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseFloat(value) : undefined);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>From (Payer) *</FormLabel>
              <Select
                value={payerId}
                onValueChange={(value) => {
                  setPayerId(value);
                  setPayerError("");
                  const payer = members.find(
                    (m) => (m.userId || m.contactId) === value,
                  );
                  if (payer) {
                    form.setValue("payerUserId", payer.userId || null);
                    form.setValue("payerContactId", payer.contactId || null);
                  }
                }}
              >
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
              {payerError && (
                <p className="text-sm font-medium text-destructive">
                  {payerError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <FormLabel>To (Receiver) *</FormLabel>
              <Select
                value={receiverId}
                onValueChange={(value) => {
                  setReceiverId(value);
                  setReceiverError("");
                  const receiver = members.find(
                    (m) => (m.userId || m.contactId) === value,
                  );
                  if (receiver) {
                    form.setValue("receiverUserId", receiver.userId || null);
                    form.setValue(
                      "receiverContactId",
                      receiver.contactId || null,
                    );
                  }
                }}
              >
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
              {receiverError && (
                <p className="text-sm font-medium text-destructive">
                  {receiverError}
                </p>
              )}
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
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Recording..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
