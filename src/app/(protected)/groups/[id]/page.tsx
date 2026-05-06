"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GroupExpenseFormDialog } from "@/features/expenses/components/group-expense-form-dialog";
import { useExpenses } from "@/features/expenses/hooks/use-expenses";
import { GroupBalanceSummary } from "@/features/groups/components/group-balance-summary";
import { GroupFormDialog } from "@/features/groups/components/group-form-dialog";
import { useGroup } from "@/features/groups/hooks/use-group";
import { getMembersInfo } from "@/features/groups/utils/member-info";
import { SettlementFormDialog } from "@/features/settlements/components/settlement-form-dialog";
import { SettlementHistory } from "@/features/settlements/components/settlement-history";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import {
  IconArrowLeft,
  IconCash,
  IconEdit,
  IconPlus,
  IconReceipt,
  IconUsers,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function GroupDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { group, isLoading } = useGroup(id);
  const { expenses, isLoading: isLoadingExpenses } = useExpenses({
    groupId: id,
    limit: 5,
    sortBy: "date",
    sortOrder: "desc",
  });
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isSettlementDialogOpen, setIsSettlementDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold mb-2">Group not found</h3>
        <p className="text-muted-foreground mb-4">
          The group you're looking for doesn't exist or you don't have access to
          it.
        </p>
        <Button onClick={() => router.push("/groups")}>Back to Groups</Button>
      </div>
    );
  }

  const userMember = group.members.find((m) => m.user);
  const isAdmin = userMember?.role === "admin";
  const hasExpenses = (group._count?.expenses ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/groups")}
            className="gap-2 -ml-2"
          >
            <IconArrowLeft className="h-4 w-4" />
            Back to Groups
          </Button>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <IconUsers className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                {group.name}
              </h1>
              {isAdmin && <Badge variant="secondary">Admin</Badge>}
            </div>
            {group.description && (
              <p className="text-muted-foreground text-base pl-[52px]">
                {group.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => setIsExpenseDialogOpen(true)}
          >
            <IconPlus className="h-5 w-5" />
            Add Expense
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    onClick={() => setIsSettlementDialogOpen(true)}
                    disabled={!hasExpenses}
                  >
                    <IconCash className="h-5 w-5" />
                    Record Payment
                  </Button>
                </span>
              </TooltipTrigger>
              {!hasExpenses && (
                <TooltipContent>
                  <p>Add expenses before recording payments</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          {isAdmin && (
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => {
                setIsEditGroupDialogOpen(true);
              }}
            >
              <IconEdit className="h-5 w-5" />
              Edit Group
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <IconUsers className="h-5 w-5 text-primary" />
            Members ({group.members.length})
          </h3>
          <div className="space-y-2">
            {group.members.map((member) => {
              const name =
                member.user?.name || member.contact?.name || "Unknown";
              const email = member.user?.email || member.contact?.email;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <div className="font-medium">{name}</div>
                    {email && (
                      <div className="text-xs text-muted-foreground">
                        {email}
                      </div>
                    )}
                  </div>
                  {member.role === "admin" && (
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <GroupBalanceSummary groupId={group.id} />

          <SettlementHistory groupId={group.id} />

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <IconReceipt className="h-5 w-5 text-primary" />
              Recent Expenses
            </h3>
            {isLoadingExpenses ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : expenses && expenses.length > 0 ? (
              <div className="space-y-2">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {expense.description || "Untitled Expense"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{expense.category.name}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(expense.date), "MMM d, yyyy")}
                        </span>
                        {expense.participants && expense.participants.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{expense.participants.length} people</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(Number(expense.amount))}
                      </div>
                    </div>
                  </div>
                ))}
                {expenses.length >= 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => router.push(`/expenses?groupId=${id}`)}
                  >
                    View All Expenses
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No expenses yet.</p>
                <p className="text-sm mt-2">Add an expense to get started.</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <GroupExpenseFormDialog
        open={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        defaultGroupId={group.id}
      />

      <SettlementFormDialog
        open={isSettlementDialogOpen}
        onOpenChange={setIsSettlementDialogOpen}
        groupId={group.id}
        members={getMembersInfo(group, "")}
      />

      <GroupFormDialog
        open={isEditGroupDialogOpen}
        onOpenChange={setIsEditGroupDialogOpen}
        group={group}
      />
    </div>
  );
}
