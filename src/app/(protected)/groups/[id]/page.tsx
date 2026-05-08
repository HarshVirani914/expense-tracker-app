"use client";

import { GroupExpenseFormDialog } from "@/features/expenses/components/group-expense-form-dialog";
import { useExpenses } from "@/features/expenses/hooks/use-expenses";
import { useGroupBalances } from "@/features/groups/hooks/use-group-balances";
import { GroupFormDialog } from "@/features/groups/components/group-form-dialog";
import { useGroup } from "@/features/groups/hooks/use-group";
import { getMembersInfo } from "@/features/groups/utils/member-info";
import { SettlementFormDialog } from "@/features/settlements/components/settlement-form-dialog";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { GroupHeader } from "@/features/groups/components/group-header";
import { GroupStatsBar } from "@/features/groups/components/group-stats-bar";
import { UserBalanceCard } from "@/features/groups/components/user-balance-card";
import { GroupBalancesCard } from "@/features/groups/components/group-balances-card";
import { GroupMembersCard } from "@/features/groups/components/group-members-card";
import { GroupActivityCard } from "@/features/groups/components/group-activity-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function GroupDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { group, isLoading } = useGroup(id);
  const { balances, isLoading: isLoadingBalances } = useGroupBalances(id);
  const { expenses, isLoading: isLoadingExpenses } = useExpenses({
    groupId: id,
    limit: 10,
    sortBy: "date",
    sortOrder: "desc",
  });

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-9">
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
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

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <GroupHeader
        groupName={group.name}
        description={group.description || undefined}
        isAdmin={isAdmin}
        onBack={() => router.push("/groups")}
        onAddExpense={() => setIsExpenseDialogOpen(true)}
        onEditGroup={() => setIsEditGroupDialogOpen(true)}
      />

      {/* Stats Bar - Desktop: Above content, Mobile: Below header */}
      <div className="lg:hidden">
        <GroupStatsBar
          memberCount={group.members.length}
          expenseCount={group._count?.expenses ?? 0}
          totalSpent={totalGroupSpent}
        />
      </div>

      {/* Desktop: 3-column layout (sidebar + main), Mobile: stacked */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Sidebar - Desktop only (Context: Stats + Members) */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <GroupStatsBar
            memberCount={group.members.length}
            expenseCount={group._count?.expenses ?? 0}
            totalSpent={totalGroupSpent}
          />

          <GroupMembersCard
            members={group.members}
            showAll={showAllMembers}
            onToggleShowAll={() => setShowAllMembers(!showAllMembers)}
          />
        </div>

        {/* Main Content - Balance Cards + Activity */}
        <div className="lg:col-span-9 space-y-6">
          {/* Balance Cards - 2-column on md+, stacked on mobile */}
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

          {/* Members - Mobile/Tablet only (hidden on desktop) */}
          <div className="lg:hidden">
            <GroupMembersCard
              members={group.members}
              showAll={showAllMembers}
              onToggleShowAll={() => setShowAllMembers(!showAllMembers)}
            />
          </div>

          {/* Activity - Full width */}
          <GroupActivityCard
            expenses={expenses}
            isLoading={isLoadingExpenses}
            onAddExpense={() => setIsExpenseDialogOpen(true)}
            onViewAll={() => router.push(`/expenses?groupId=${id}`)}
          />
        </div>
      </div>

      {/* Dialogs */}
      <GroupExpenseFormDialog
        open={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        defaultGroupId={group.id}
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
    </div>
  );
}
