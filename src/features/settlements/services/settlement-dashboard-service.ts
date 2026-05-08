import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

type OutstandingDebt = {
  groupId: string
  groupName: string
  memberName: string
  memberId: string
  isUser: boolean
  amount: number
  type: 'owes' | 'owed'
}

export const settlementDashboardService = {
  async getOutstandingDebts(userId: string): Promise<OutstandingDebt[]> {
    try {
      const groups = await prisma.group.findMany({
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
              contact: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          expenses: {
            include: {
              participants: true,
            },
          },
          settlements: true,
        },
      })

      const debts: OutstandingDebt[] = []

      for (const group of groups) {
        const balances = new Map<string, number>()

        for (const expense of group.expenses) {
          for (const participant of expense.participants) {
            const memberId = participant.userId || participant.contactId || ''
            const currentBalance = balances.get(memberId) || 0
            const paidAmount = Number(participant.paidAmount)
            const oweAmount = Number(participant.oweAmount)
            balances.set(
              memberId,
              currentBalance + paidAmount - oweAmount
            )
          }
        }

        for (const settlement of group.settlements) {
          const payerId =
            settlement.payerUserId || settlement.payerContactId || ''
          const receiverId =
            settlement.receiverUserId || settlement.receiverContactId || ''
          const settlementAmount = Number(settlement.amount)

          const payerBalance = balances.get(payerId) || 0
          balances.set(payerId, payerBalance - settlementAmount)

          const receiverBalance = balances.get(receiverId) || 0
          balances.set(receiverId, receiverBalance + settlementAmount)
        }

        const userMemberId = group.members.find((m) => m.userId === userId)?.id
        if (!userMemberId) continue

        const userMember = group.members.find((m) => m.userId === userId)
        if (!userMember) continue

        const userBalanceKey = userMember.userId || userMember.contactId || ''
        const userBalance = balances.get(userBalanceKey) || 0

        if (Math.abs(userBalance) < 0.01) continue

        for (const [memberId, balance] of balances.entries()) {
          if (memberId === userBalanceKey) continue
          if (Math.abs(balance) < 0.01) continue

          const member = group.members.find(
            (m) =>
              (m.userId || m.contactId || '') === memberId
          )
          if (!member) continue

          if (userBalance < 0 && balance > 0) {
            const settlementAmount = Math.min(
              Math.abs(userBalance),
              Math.abs(balance)
            )

          debts.push({
            groupId: group.id,
            groupName: group.name,
            memberName: member.user?.name || member.contact?.name || 'Unknown',
            memberId: member.userId || member.contactId || '',
            isUser: !!member.userId,
            amount: settlementAmount,
            type: 'owes',
          })
          } else if (userBalance > 0 && balance < 0) {
            const settlementAmount = Math.min(
              Math.abs(userBalance),
              Math.abs(balance)
            )

          debts.push({
            groupId: group.id,
            groupName: group.name,
            memberName: member.user?.name || member.contact?.name || 'Unknown',
            memberId: member.userId || member.contactId || '',
            isUser: !!member.userId,
            amount: settlementAmount,
            type: 'owed',
          })
          }
        }
      }

      return debts
    } catch (error) {
      logger.error('Failed to get outstanding debts', { error, userId })
      throw new Error('Failed to fetch outstanding debts')
    }
  },
}
