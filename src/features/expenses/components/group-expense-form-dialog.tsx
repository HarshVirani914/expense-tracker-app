"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useGroupMembers } from "@/features/groups/hooks/use-group-members";
import { useGroups } from "@/features/groups/hooks/use-groups";
import { SplitType } from "@/types/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateGroupExpense } from "../hooks/use-create-group-expense";
import { useSplitCalculation } from "../hooks/use-split-calculation";
import {
  createGroupExpenseSchema,
  type CreateGroupExpenseInput,
} from "../schemas";
import { EqualSplit } from "./split-calculator/equal-split";
import { ExactSplit } from "./split-calculator/exact-split";
import { PercentageSplit } from "./split-calculator/percentage-split";
import { SharesSplit } from "./split-calculator/shares-split";
import { SplitPreview } from "./split-calculator/split-preview";
import { useUpdateGroupExpense } from "../hooks/use-update-group-expense";
import type { ExpenseWithRelations } from "../types";
import { logger } from "@/lib/logger";

type GroupExpenseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultGroupId?: string;
  expense?: ExpenseWithRelations;
};

export const GroupExpenseFormDialog = ({
  open,
  onOpenChange,
  defaultGroupId,
  expense,
}: GroupExpenseFormDialogProps) => {
  const { categories } = useCategories();
  const { groups } = useGroups({ limit: 100 });

  const isEditMode = !!expense;

  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    expense?.groupId || defaultGroupId || "",
  );
  const [splitType, setSplitType] = useState<SplitType>(SplitType.EQUAL);
  const [splitValues, setSplitValues] = useState<Record<string, number>>({});
  const [payerId, setPayerId] = useState<string>("");

  const { members: groupMembers } = useGroupMembers(selectedGroupId);
  const { createGroupExpense, isCreating } =
    useCreateGroupExpense(selectedGroupId);
  const { updateGroupExpense, isUpdating } =
    useUpdateGroupExpense(selectedGroupId);

  const form = useForm<CreateGroupExpenseInput>({
    resolver: zodResolver(createGroupExpenseSchema),
    mode: "onSubmit",
    defaultValues: expense ? {
      amount: Number(expense.amount),
      description: expense.description || "",
      date: new Date(expense.date),
      categoryId: expense.categoryId,
      groupId: expense.groupId || defaultGroupId || "",
      participants: [],
    } : {
      amount: 0,
      description: "",
      date: new Date(),
      categoryId: "",
      groupId: defaultGroupId || "",
      participants: [],
    },
  });

  const totalAmount = form.watch("amount");

  // Reset state when dialog closes or switches mode
  useEffect(() => {
    if (!open) {
      // Reset all state when dialog closes
      setSplitType(SplitType.EQUAL);
      setSplitValues({});
      setPayerId("");
      form.reset({
        amount: 0,
        description: "",
        date: new Date(),
        categoryId: "",
        groupId: defaultGroupId || "",
        participants: [],
      });
    }
  }, [open, form, defaultGroupId]);

  // Initialize form with expense data when editing
  useEffect(() => {
    if (expense && open && groupMembers.length > 0) {
      // Reset form with expense data
      form.reset({
        amount: Number(expense.amount),
        description: expense.description || "",
        date: new Date(expense.date),
        categoryId: expense.categoryId,
        groupId: expense.groupId || "",
        participants: [],
      });
      setSelectedGroupId(expense.groupId || "");
      
      // Load participants configuration if available
      if (expense.participants && expense.participants.length > 0) {
        // Detect split type from first participant
        const firstParticipant = expense.participants[0];
        const detectedSplitType = firstParticipant.splitType as SplitType;
        setSplitType(detectedSplitType);
        
        // Find who paid (participant with paidAmount > 0)
        const payer = expense.participants.find((p) => 
          Number(p.paidAmount) > 0
        );
        
        if (payer) {
          const payerMemberId = payer.userId || payer.contactId || "";
          setPayerId(payerMemberId);
        }
        
        // Load split values for each participant
        // Create a map of actual member IDs for matching
        const memberIdMap = new Map<string, string>();
        groupMembers.forEach(member => {
          const memberId = member.userId || member.contactId || "";
          if (memberId) {
            memberIdMap.set(memberId, memberId);
          }
        });

        const loadedSplitValues: Record<string, number> = {};
        expense.participants.forEach((p) => {
          const participantId = p.userId || p.contactId || "";
          // Only load if this participant is still in the group
          if (participantId && memberIdMap.has(participantId)) {
            loadedSplitValues[participantId] = Number(p.splitValue);
          }
        });
        
        // Set split values
        setSplitValues(loadedSplitValues);
      }
    } else if (!expense && open && groupMembers.length > 0) {
      // Creating new expense - set defaults only once
      setSplitType(SplitType.EQUAL);
      setSplitValues({});
      
      // Set default payer to current user
      if (!payerId) {
        const currentUser = groupMembers.find((m) => m.isCurrentUser);
        if (currentUser) {
          setPayerId(currentUser.userId || currentUser.contactId || "");
        }
      }
    }
  }, [expense, open, form, groupMembers, payerId]);

  const participants = useSplitCalculation(
    groupMembers,
    totalAmount,
    splitType,
    splitValues,
    payerId,
  );

  // Sync calculated participants to form field for validation
  useEffect(() => {
    form.setValue("participants", participants, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [participants, form]);

  const handleSplitValuesChange = useCallback(
    (values: Record<string, number>) => {
      setSplitValues(values);
    },
    [],
  );

  const handleSplitTypeChange = useCallback((newType: SplitType) => {
    setSplitType(newType);
    setSplitValues({});
  }, []);

  const onSubmit = useCallback(
    async (data: CreateGroupExpenseInput) => {
      try {
        if (isEditMode && expense) {
          await updateGroupExpense({
            id: expense.id,
            data: {
              amount: data.amount,
              description: data.description,
              date: data.date,
              categoryId: data.categoryId,
              participants: data.participants,
            },
          });
          toast.success("Group expense updated successfully");
        } else {
          await createGroupExpense(data);
          toast.success("Group expense created successfully");
        }

        // Close dialog - cleanup will happen in useEffect
        onOpenChange(false);
      } catch (error) {
        logger.error(`Failed to ${isEditMode ? 'update' : 'create'} group expense`, { error });
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} group expense`);
      }
    },
    [isEditMode, expense, updateGroupExpense, createGroupExpense, onOpenChange],
  );

  const isFormValid = useMemo(() => {
    if (participants.length === 0) return false;
    if (totalAmount <= 0) return false;

    const totalOwed = participants.reduce((sum, p) => sum + p.oweAmount, 0);
    if (Math.abs(totalOwed - totalAmount) > 0.01) return false;

    const totalPaid = participants.reduce((sum, p) => sum + p.paidAmount, 0);
    if (Math.abs(totalPaid - totalAmount) > 0.01) return false;

    if (splitType === SplitType.PERCENTAGE) {
      const totalPercentage = participants.reduce(
        (sum, p) => sum + p.splitValue,
        0,
      );
      if (Math.abs(totalPercentage - 100) > 0.01) return false;
    }

    return true;
  }, [participants, totalAmount, splitType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-7xl w-full max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-2xl">
            {isEditMode ? "Edit Group Expense" : "Add Group Expense"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update expense and split configuration" : "Split an expense with your group members"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Left Column - Expense Details */}
                <div className="p-6 lg:border-r border-border space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      Expense Details
                    </h3>

                    <div className="space-y-4">
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
                                className="text-lg"
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

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Dinner at restaurant"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Date</FormLabel>
                              <DatePicker
                                date={
                                  field.value instanceof Date
                                    ? field.value
                                    : undefined
                                }
                                onSelect={field.onChange}
                                placeholder="Select date"
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories?.map((category) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.id}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="groupId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Group *</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedGroupId(value);
                                setPayerId(""); // Reset payer when group changes
                              }}
                              value={field.value}
                              disabled={isEditMode} // Can't change group when editing
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {groups?.map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                    {group.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Split Configuration */}
                <div className="p-6 space-y-6 bg-muted/30">
                  {groupMembers.length > 0 ? (
                    <>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">
                          Split Configuration
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          {splitType === SplitType.EXACT
                            ? "Specify who paid what amounts."
                            : "Select who paid for this expense."}
                        </p>

                        {/* Who Paid Selector */}
                        {splitType !== SplitType.EXACT && (
                          <div className="mb-4">
                            <label className="text-sm font-medium mb-2 block">
                              Who paid?
                            </label>
                            <Select value={payerId} onValueChange={setPayerId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select who paid" />
                              </SelectTrigger>
                              <SelectContent>
                                {groupMembers.map((member) => (
                                  <SelectItem
                                    key={member.userId || member.contactId}
                                    value={
                                      member.userId || member.contactId || ""
                                    }
                                  >
                                    {member.name}
                                    {member.isCurrentUser && " (You)"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <Tabs
                          onValueChange={(v) =>
                            handleSplitTypeChange(v as SplitType)
                          }
                          value={splitType}
                          orientation="horizontal"
                          className="flex-col w-full"
                        >
                          <TabsList className="w-full">
                            <TabsTrigger value={SplitType.EQUAL}>
                              Equal
                            </TabsTrigger>
                            <TabsTrigger value={SplitType.EXACT}>
                              Exact
                            </TabsTrigger>
                            <TabsTrigger value={SplitType.PERCENTAGE}>
                              %
                            </TabsTrigger>
                            <TabsTrigger value={SplitType.SHARES}>
                              Shares
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value={SplitType.EQUAL}>
                            <EqualSplit
                              members={groupMembers}
                              totalAmount={totalAmount}
                            />
                          </TabsContent>
                          <TabsContent value={SplitType.EXACT}>
                            <ExactSplit
                              members={groupMembers}
                              totalAmount={totalAmount}
                              initialValues={splitValues}
                              onChange={handleSplitValuesChange}
                            />
                          </TabsContent>
                          <TabsContent value={SplitType.PERCENTAGE}>
                            <PercentageSplit
                              members={groupMembers}
                              totalAmount={totalAmount}
                              initialValues={splitValues}
                              onChange={handleSplitValuesChange}
                            />
                          </TabsContent>
                          <TabsContent value={SplitType.SHARES}>
                            <SharesSplit
                              members={groupMembers}
                              totalAmount={totalAmount}
                              initialValues={splitValues}
                              onChange={handleSplitValuesChange}
                            />
                          </TabsContent>
                        </Tabs>
                      </div>

                      <SplitPreview
                        members={groupMembers}
                        participants={participants}
                        totalAmount={totalAmount}
                      />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[300px]">
                      <div className="text-center space-y-2">
                        <p className="text-muted-foreground">
                          Select a group to configure split
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer with actions */}
            <div className="border-t px-6 py-4 bg-background shrink-0 rounded-b-4xl">
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
                  disabled={isCreating || isUpdating || !isFormValid}
                  className="min-w-[140px]"
                >
                  {isCreating || isUpdating 
                    ? (isEditMode ? "Updating..." : "Creating...") 
                    : (isEditMode ? "Update Expense" : "Create Expense")}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
