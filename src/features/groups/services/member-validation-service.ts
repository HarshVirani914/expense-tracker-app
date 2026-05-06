import { prisma } from "@/lib/prisma";

export type MemberValidationResult = {
  canRemove: boolean;
  reason?: string;
  hasExpenses: boolean;
  hasSettlements: boolean;
  expenseCount: number;
  settlementCount: number;
};

export const memberValidationService = {
  async canRemoveMember(
    memberId: string
  ): Promise<MemberValidationResult> {
    const member = await prisma.groupMember.findUnique({
      where: { id: memberId },
      select: {
        userId: true,
        contactId: true,
      },
    });

    if (!member) {
      return {
        canRemove: false,
        reason: "Member not found",
        hasExpenses: false,
        hasSettlements: false,
        expenseCount: 0,
        settlementCount: 0,
      };
    }

    const expenseCount = await prisma.expenseParticipant.count({
      where: member.userId
        ? { userId: member.userId }
        : { contactId: member.contactId! },
    });

    const settlementCount = await prisma.settlement.count({
      where: {
        OR: member.userId
          ? [
              { payerUserId: member.userId },
              { receiverUserId: member.userId },
            ]
          : [
              { payerContactId: member.contactId! },
              { receiverContactId: member.contactId! },
            ],
      },
    });

    const hasExpenses = expenseCount > 0;
    const hasSettlements = settlementCount > 0;

    if (hasExpenses || hasSettlements) {
      const reasons = [];
      if (hasExpenses) {
        reasons.push(`${expenseCount} expense${expenseCount > 1 ? "s" : ""}`);
      }
      if (hasSettlements) {
        reasons.push(
          `${settlementCount} settlement${settlementCount > 1 ? "s" : ""}`
        );
      }

      return {
        canRemove: false,
        reason: `Cannot remove member with ${reasons.join(" and ")}. Deleting this member would lose financial records.`,
        hasExpenses,
        hasSettlements,
        expenseCount,
        settlementCount,
      };
    }

    return {
      canRemove: true,
      hasExpenses: false,
      hasSettlements: false,
      expenseCount: 0,
      settlementCount: 0,
    };
  },

  async validateMemberUpdates(
    groupId: string,
    newMemberContactIds: string[]
  ): Promise<{
    canUpdate: boolean;
    membersToRemove: string[];
    membersToAdd: string[];
    blockedRemovals: Array<{ memberId: string; reason: string }>;
  }> {
    const currentMembers = await prisma.groupMember.findMany({
      where: {
        groupId,
        contactId: { not: null },
      },
      select: {
        id: true,
        contactId: true,
      },
    });

    const currentContactIds = currentMembers
      .map((m) => m.contactId)
      .filter((id): id is string => id !== null);

    const membersToRemove = currentMembers.filter(
      (m) => m.contactId && !newMemberContactIds.includes(m.contactId)
    );

    const membersToAdd = newMemberContactIds.filter(
      (id) => !currentContactIds.includes(id)
    );

    const blockedRemovals: Array<{ memberId: string; reason: string }> = [];

    for (const member of membersToRemove) {
      const validation = await memberValidationService.canRemoveMember(
        member.id
      );
      if (!validation.canRemove) {
        blockedRemovals.push({
          memberId: member.id,
          reason: validation.reason || "Cannot remove member",
        });
      }
    }

    return {
      canUpdate: blockedRemovals.length === 0,
      membersToRemove: membersToRemove.map((m) => m.id),
      membersToAdd,
      blockedRemovals,
    };
  },
};
