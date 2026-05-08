import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type { GroupBalance } from '../types'

export const balanceService = {
  async calculateGroupBalances(groupId: string, currentUserId: string): Promise<GroupBalance[]> {
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
              contact: true,
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

      if (!group) {
        throw new Error('Group not found')
      }

      const balanceMap = new Map<
        string,
        {
          memberName: string
          isCurrentUser: boolean
          totalPaid: number
          totalOwed: number
        }
      >()

      group.members.forEach((member) => {
        const memberId = member.userId || member.contactId || ''
        const memberName = member.userId
          ? member.user?.name || 'Unknown User'
          : member.contact?.name || 'Unknown Contact'
        const isCurrentUser = member.userId === currentUserId

        balanceMap.set(memberId, {
          memberName,
          isCurrentUser,
          totalPaid: 0,
          totalOwed: 0,
        })
      })

      group.expenses.forEach((expense) => {
        expense.participants.forEach((participant) => {
          const memberId = participant.userId || participant.contactId
          if (!memberId) return

          const balance = balanceMap.get(memberId)
          if (balance) {
            balance.totalPaid += Number(participant.paidAmount)
            balance.totalOwed += Number(participant.oweAmount)
          }
        })
      })

      group.settlements.forEach((settlement) => {
        const payerId = settlement.payerUserId || settlement.payerContactId
        const receiverId = settlement.receiverUserId || settlement.receiverContactId
        const amount = Number(settlement.amount)

        if (payerId) {
          const payerBalance = balanceMap.get(payerId)
          if (payerBalance) {
            payerBalance.totalPaid += amount
          }
        }

        if (receiverId) {
          const receiverBalance = balanceMap.get(receiverId)
          if (receiverBalance) {
            receiverBalance.totalOwed += amount
          }
        }
      })

      const balances: GroupBalance[] = []
      const creditors: { memberId: string; amount: number }[] = []
      const debtors: { memberId: string; amount: number }[] = []

      balanceMap.forEach((balance, memberId) => {
        const netBalance = balance.totalPaid - balance.totalOwed

        if (netBalance > 0.01) {
          creditors.push({ memberId, amount: netBalance })
        } else if (netBalance < -0.01) {
          debtors.push({ memberId, amount: -netBalance })
        }

        balances.push({
          memberId,
          memberName: balance.memberName,
          isCurrentUser: balance.isCurrentUser,
          totalPaid: balance.totalPaid,
          totalOwed: balance.totalOwed,
          netBalance,
          owesTo: [],
          owedBy: [],
        })
      })

      creditors.sort((a, b) => b.amount - a.amount)
      debtors.sort((a, b) => b.amount - a.amount)

      let ci = 0
      let di = 0

      while (ci < creditors.length && di < debtors.length) {
        const creditor = creditors[ci]
        const debtor = debtors[di]
        const amount = Math.min(creditor.amount, debtor.amount)

        const creditorBalance = balances.find((b) => b.memberId === creditor.memberId)
        const debtorBalance = balances.find((b) => b.memberId === debtor.memberId)

        if (creditorBalance && debtorBalance) {
          creditorBalance.owedBy.push({
            memberId: debtor.memberId,
            memberName: debtorBalance.memberName,
            amount,
          })

          debtorBalance.owesTo.push({
            memberId: creditor.memberId,
            memberName: creditorBalance.memberName,
            amount,
          })
        }

        creditor.amount -= amount
        debtor.amount -= amount

        if (creditor.amount < 0.01) ci++
        if (debtor.amount < 0.01) di++
      }

      return balances
    } catch (error) {
      logger.error('Failed to calculate group balances', { error, groupId })
      throw new Error('Failed to calculate group balances')
    }
  },

  async getMemberBalance(
    groupId: string,
    memberId: string,
    currentUserId: string
  ): Promise<GroupBalance | null> {
    try {
      const balances = await this.calculateGroupBalances(groupId, currentUserId)
      return balances.find((b) => b.memberId === memberId) || null
    } catch (error) {
      logger.error('Failed to get member balance', { error, groupId, memberId })
      throw error
    }
  },
}
