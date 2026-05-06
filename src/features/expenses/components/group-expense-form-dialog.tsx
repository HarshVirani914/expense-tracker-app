"use client";

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
import { useGroups } from "@/features/groups/hooks/use-groups";
import type { MemberInfo } from "@/features/groups/types";
import { getMembersInfo } from "@/features/groups/utils/member-info";
import { apiClient } from "@/lib/api-client";
import { SplitType } from "@/types/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createGroupExpenseSchema,
  type CreateGroupExpenseInput,
  type ParticipantInput,
} from "../schemas";
import { EqualSplit } from "./split-calculator/equal-split";
import { ExactSplit } from "./split-calculator/exact-split";
import { PercentageSplit } from "./split-calculator/percentage-split";
import { SharesSplit } from "./split-calculator/shares-split";
import { SplitPreview } from "./split-calculator/split-preview";

type GroupExpenseFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultGroupId?: string;
};

export const GroupExpenseFormDialog = ({
  open,
  onOpenChange,
  defaultGroupId,
}: GroupExpenseFormDialogProps) => {
  const queryClient = useQueryClient();
  const { categories } = useCategories();
  const { groups } = useGroups({ limit: 100 });

  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    defaultGroupId || "",
  );
  const [groupMembers, setGroupMembers] = useState<MemberInfo[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [splitType, setSplitType] = useState<SplitType>(SplitType.EQUAL);
  const [participants, setParticipants] = useState<ParticipantInput[]>([]);
  const [payers, setPayers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateGroupExpenseInput>({
    resolver: zodResolver(createGroupExpenseSchema),
    mode: "onSubmit",
    defaultValues: {
      amount: 0,
      description: "",
      categoryId: "",
      groupId: defaultGroupId || "",
      participants: [],
    },
  });

  useEffect(() => {
    const loadGroupMembers = async () => {
      if (!selectedGroupId) {
        setGroupMembers([]);
        return;
      }

      try {
        const response = await apiClient.get<{ data: any }>(
          `/api/groups/${selectedGroupId}`,
        );
        const group = response.data;
        const members = getMembersInfo(group, "");
        setGroupMembers(members);
        setSelectedMembers(members.map((m) => m.userId || m.contactId || ""));
      } catch (error) {
        toast.error("Failed to load group members");
      }
    };

    loadGroupMembers();
  }, [selectedGroupId]);

  const getSelectedMembersInfo = () => {
    return groupMembers.filter((m) =>
      selectedMembers.includes(m.userId || m.contactId || ""),
    );
  };

  const handlePayerChange = (memberId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    const newPayers = { ...payers, [memberId]: numAmount };
    setPayers(newPayers);

    const updatedParticipants = participants.map((p) => ({
      ...p,
      paidAmount: newPayers[p.memberIdOrContact] || 0,
    }));
    setParticipants(updatedParticipants);
  };

  const onSubmit = async (data: CreateGroupExpenseInput) => {
    try {
      setIsSubmitting(true);

      const participantsWithPayers = participants.map((p) => ({
        ...p,
        paidAmount: payers[p.memberIdOrContact] || 0,
      }));

      const totalPaid = participantsWithPayers.reduce(
        (sum, p) => sum + p.paidAmount,
        0,
      );
      if (Math.abs(totalPaid - data.amount) > 0.01) {
        toast.error("Total paid amount must equal expense amount");
        return;
      }

      const payload = {
        ...data,
        participants: participantsWithPayers,
      };

      await apiClient.post("/api/expenses/group", payload);

      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({
        queryKey: ["group-balances", selectedGroupId],
      });

      toast.success("Group expense created successfully");
      onOpenChange(false);

      form.reset();
      setParticipants([]);
      setPayers({});
    } catch (error) {
      toast.error("Failed to create group expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = form.watch("amount");
  const selectedMembersInfo = getSelectedMembersInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Group Expense</DialogTitle>
          <DialogDescription>
            Split an expense with your group members
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <DatePicker
                      date={
                        field.value instanceof Date ? field.value : undefined
                      }
                      onSelect={field.onChange}
                      placeholder="Select date"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      }}
                      defaultValue={field.value}
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

            {groupMembers.length > 0 && (
              <>
                <div className="space-y-3">
                  <FormLabel>Who paid?</FormLabel>
                  <div className="space-y-2">
                    {groupMembers.map((member) => {
                      const memberId = member.userId || member.contactId || "";
                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-2"
                        >
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={payers[memberId] || ""}
                            onChange={(e) =>
                              handlePayerChange(memberId, e.target.value)
                            }
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground w-32">
                            {member.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <FormLabel>Split Type</FormLabel>
                  <Tabs
                    value={splitType}
                    onValueChange={(v) => setSplitType(v as SplitType)}
                  >
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value={SplitType.EQUAL}>Equal</TabsTrigger>
                      <TabsTrigger value={SplitType.EXACT}>Exact</TabsTrigger>
                      <TabsTrigger value={SplitType.PERCENTAGE}>%</TabsTrigger>
                      <TabsTrigger value={SplitType.SHARES}>Shares</TabsTrigger>
                    </TabsList>
                    <TabsContent value={SplitType.EQUAL}>
                      <EqualSplit
                        members={selectedMembersInfo}
                        totalAmount={totalAmount}
                        participants={participants}
                        onParticipantsChange={setParticipants}
                      />
                    </TabsContent>
                    <TabsContent value={SplitType.EXACT}>
                      <ExactSplit
                        members={selectedMembersInfo}
                        totalAmount={totalAmount}
                        participants={participants}
                        onParticipantsChange={setParticipants}
                      />
                    </TabsContent>
                    <TabsContent value={SplitType.PERCENTAGE}>
                      <PercentageSplit
                        members={selectedMembersInfo}
                        totalAmount={totalAmount}
                        participants={participants}
                        onParticipantsChange={setParticipants}
                      />
                    </TabsContent>
                    <TabsContent value={SplitType.SHARES}>
                      <SharesSplit
                        members={selectedMembersInfo}
                        totalAmount={totalAmount}
                        participants={participants}
                        onParticipantsChange={setParticipants}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <SplitPreview
                  members={selectedMembersInfo}
                  participants={participants}
                  totalAmount={totalAmount}
                />
              </>
            )}

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
                disabled={isSubmitting || participants.length === 0}
              >
                {isSubmitting ? "Creating..." : "Create Expense"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
