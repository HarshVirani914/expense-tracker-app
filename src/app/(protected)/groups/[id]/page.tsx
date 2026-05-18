"use client";

import { GroupExpenseFormDialog } from "@/features/expenses/components/group-expense-form-dialog";
import { useExpenses } from "@/features/expenses/hooks/use-expenses";
import { useDeleteGroupExpense } from "@/features/expenses/hooks/use-delete-group-expense";
import type { ExpenseWithRelations } from "@/features/expenses/types";
import { useGroupBalances } from "@/features/groups/hooks/use-group-balances";
import { GroupFormDialog } from "@/features/groups/components/group-form-dialog";
import { useGroup } from "@/features/groups/hooks/use-group";
import { getMembersInfo } from "@/features/groups/utils/member-info";
import { SettlementFormDialog } from "@/features/settlements/components/settlement-form-dialog";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { GroupHeader } from "@/features/groups/components/group-header";
import { GroupStatsCard } from "@/features/groups/components/group-stats-card";
import { UserBalanceCard } from "@/features/groups/components/user-balance-card";
import { GroupBalancesCard } from "@/features/groups/components/group-balances-card";
import { GroupMembersCard } from "@/features/groups/components/group-members-card";
import { GroupActivityCard } from "@/features/groups/components/group-activity-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { IconPlus, IconEdit } from "@tabler/icons-react";
import { toast } from "sonner";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function GroupDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const isMobile = useIsMobile();
  const { group, isLoading } = useGroup(id);
  const { balances, isLoading: isLoadingBalances } = useGroupBalances(id);
  const { expenses, isLoading: isLoadingExpenses } = useExpenses({
    groupId: id,
    limit: 10,
    sortBy: "date",
    sortOrder: "desc",
  });
  const { deleteGroupExpense, isDeleting } = useDeleteGroupExpense(id);

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<
    ExpenseWithRelations | undefined
  >(undefined);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [settlementDialog, setSettlementDialog] = useState<{
    open: boolean;
    prefilledData?: {
      payerId: string;
      receiverId: string;
      amount: number;
    };
  }>({
    open: false,
  });

  const getParticipantDisplayName = useMemo(() => {
    const memberList = group?.members ?? [];
    const byUserId: Record<string, string> = {};
    const byContactId: Record<string, string> = {};
    for (const m of memberList) {
      if (m.userId) {
        byUserId[m.userId] =
          m.user?.name?.trim() || m.user?.email || "Member";
      }
      if (m.contactId && m.contact) {
        byContactId[m.contactId] = m.contact.name;
      }
    }
    return (p: {
      userId: string | null;
      contactId: string | null;
      contact?: { name: string } | null;
    }) => {
      if (p.contact?.name) return p.contact.name;
      if (p.userId && byUserId[p.userId]) return byUserId[p.userId];
      if (p.contactId && byContactId[p.contactId])
        return byContactId[p.contactId];
      if (p.userId) return "Member";
      if (p.contactId) return "Contact";
      return "Someone";
    };
  }, [group?.members]);

  if (isLoading) {
    return (
      <div className="flex min-w-0 w-full max-w-full flex-col gap-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-xl font-semibold mb-2">Group not found</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          The group you&apos;re looking for doesn&apos;t exist or you don&apos;t
          have access to it.
        </p>
        <Button onClick={() => router.push("/groups")}>Back to Groups</Button>
      </div>
    );
  }

  const userMember = group.members.find((m) => m.user);
  const isAdmin = userMember?.role === "admin";
  const hasExpenses = (group._count?.expenses ?? 0) > 0;
  const userBalance = balances?.find((b) => b.isCurrentUser);
  const otherBalances = balances?.filter((b) => !b.isCurrentUser) || [];

  const totalGroupSpent =
    expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

  const members = getMembersInfo(group, "");

  const handleQuickSettle = (balance: (typeof otherBalances)[0]) => {
    if (!userBalance) return;

    const debt = balance.owesTo.find(
      (d) => d.memberId === userBalance.memberId,
    );
    const credit = balance.owedBy.find(
      (c) => c.memberId === userBalance.memberId,
    );

    if (debt) {
      setSettlementDialog({
        open: true,
        prefilledData: {
          payerId: balance.memberId,
          receiverId: userBalance.memberId,
          amount: debt.amount,
        },
      });
    } else if (credit) {
      setSettlementDialog({
        open: true,
        prefilledData: {
          payerId: userBalance.memberId,
          receiverId: balance.memberId,
          amount: credit.amount,
        },
      });
    }
  };

  const handleEditExpense = (expense: ExpenseWithRelations) => {
    setEditingExpense(expense);
    setIsExpenseDialogOpen(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteGroupExpense(expenseId);
      toast.success("Expense deleted successfully");
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  const handleCloseExpenseDialog = (open: boolean) => {
    setIsExpenseDialogOpen(open);
    if (!open) {
      setEditingExpense(undefined);
    }
  };

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-6">
      <GroupHeader
        groupName={group.name}
        description={group.description || undefined}
        isAdmin={isAdmin}
        memberCount={group.members.length}
        onBack={() => router.push("/groups")}
        onAddExpense={() => setIsExpenseDialogOpen(true)}
        onEditGroup={() => setIsEditGroupDialogOpen(true)}
        isMobile={isMobile}
      />

      <GroupStatsCard
        memberCount={group.members.length}
        expenseCount={group._count?.expenses ?? 0}
        totalSpent={totalGroupSpent}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <UserBalanceCard
          userBalance={userBalance}
          isLoading={isLoadingBalances}
        />

        <GroupBalancesCard
          balances={otherBalances}
          userBalance={userBalance}
          isLoading={isLoadingBalances}
          hasExpenses={hasExpenses}
          onQuickSettle={handleQuickSettle}
        />
      </div>

      <GroupMembersCard
        members={group.members}
        showAll={showAllMembers}
        onToggleShowAll={() => setShowAllMembers(!showAllMembers)}
      />

      <GroupActivityCard
        expenses={expenses}
        isLoading={isLoadingExpenses}
        onAddExpense={() => setIsExpenseDialogOpen(true)}
        onViewAll={() => router.push(`/expenses?groupId=${id}`)}
        onEditExpense={handleEditExpense}
        onDeleteExpense={handleDeleteExpense}
        getParticipantDisplayName={getParticipantDisplayName}
      />

      <GroupExpenseFormDialog
        open={isExpenseDialogOpen}
        onOpenChange={handleCloseExpenseDialog}
        defaultGroupId={group.id}
        expense={editingExpense}
      />

      <SettlementFormDialog
        open={settlementDialog.open}
        onOpenChange={(open) =>
          setSettlementDialog((prev) => ({ ...prev, open }))
        }
        groupId={group.id}
        members={members}
        prefilledData={settlementDialog.prefilledData}
      />

      <GroupFormDialog
        open={isEditGroupDialogOpen}
        onOpenChange={setIsEditGroupDialogOpen}
        group={group}
      />

      {isMobile && (
        <>
          <Button
            onClick={() => setIsExpenseDialogOpen(true)}
            size="lg"
            className="fixed bottom-26 right-6 h-14 w-14 rounded-full shadow-2xl z-40 hover:scale-110 transition-transform"
          >
            <IconPlus className="h-6 w-6" />
          </Button>

          {isAdmin && (
            <Button
              onClick={() => setIsEditGroupDialogOpen(true)}
              size="lg"
              variant="outline"
              className="fixed bottom-42 right-7 h-12 w-12 rounded-full shadow-xl z-40 hover:scale-110 transition-transform"
            >
              <IconEdit className="h-5 w-5" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
