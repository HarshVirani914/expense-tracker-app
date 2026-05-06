import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type {
  SettlementWithRelations,
  CreateSettlementInput,
  SettlementFilters,
} from '../types'
import type { PaginatedResponse } from '@/types/api'
import { Prisma } from '@/generated/prisma/client'

export const settlementService = {
  async list(
    userId: string,
    filters: SettlementFilters
  ): Promise<PaginatedResponse<SettlementWithRelations>> {
    try {
      const { page = 1, limit = 20, groupId, sortBy = 'date', sortOrder = 'desc' } = filters

      const skip = (page - 1) * limit

      const where: Prisma.SettlementWhereInput = {
        group: {
          members: {
            some: {
              userId,
            },
          },
        },
        ...(groupId && { groupId }),
      }

      const [settlements, total] = await Promise.all([
        prisma.settlement.findMany({
          where,
          include: {
            group: {
              select: {
                id: true,
                name: true,
              },
            },
            payerUser: {
              select: {
                id: true,
                name: true,
              },
            },
            payerContact: {
              select: {
                id: true,
                name: true,
              },
            },
            receiverUser: {
              select: {
                id: true,
                name: true,
              },
            },
            receiverContact: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.settlement.count({ where }),
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        data: settlements,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      }
    } catch (error) {
      logger.error('Failed to list settlements', { error, userId, filters })
      throw new Error('Failed to fetch settlements')
    }
  },

  async create(userId: string, data: CreateSettlementInput): Promise<SettlementWithRelations> {
    try {
      const group = await prisma.group.findFirst({
        where: {
          id: data.groupId,
          members: {
            some: {
              userId,
            },
          },
        },
        include: {
          _count: {
            select: {
              expenses: true,
            },
          },
        },
      })

      if (!group) {
        throw new Error('Group not found or you are not a member')
      }

      if (group._count.expenses === 0) {
        throw new Error('Cannot record settlement in a group with no expenses')
      }

      if (data.payerUserId && data.receiverUserId && data.payerUserId === data.receiverUserId) {
        throw new Error('Payer and receiver cannot be the same person')
      }

      if (
        data.payerContactId &&
        data.receiverContactId &&
        data.payerContactId === data.receiverContactId
      ) {
        throw new Error('Payer and receiver cannot be the same person')
      }

      const settlement = await prisma.settlement.create({
        data: {
          amount: data.amount,
          date: data.date ? new Date(data.date) : new Date(),
          notes: data.notes || null,
          groupId: data.groupId,
          payerUserId: data.payerUserId || null,
          payerContactId: data.payerContactId || null,
          receiverUserId: data.receiverUserId || null,
          receiverContactId: data.receiverContactId || null,
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          payerUser: {
            select: {
              id: true,
              name: true,
            },
          },
          payerContact: {
            select: {
              id: true,
              name: true,
            },
          },
          receiverUser: {
            select: {
              id: true,
              name: true,
            },
          },
          receiverContact: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      logger.info('Settlement created', { userId, settlementId: settlement.id })
      return settlement
    } catch (error) {
      logger.error('Failed to create settlement', { error, userId, data })
      throw error
    }
  },

  async delete(userId: string, settlementId: string): Promise<void> {
    try {
      const settlement = await prisma.settlement.findFirst({
        where: {
          id: settlementId,
          group: {
            members: {
              some: {
                userId,
              },
            },
          },
        },
      })

      if (!settlement) {
        throw new Error('Settlement not found')
      }

      await prisma.settlement.delete({
        where: { id: settlementId },
      })

      logger.info('Settlement deleted', { userId, settlementId })
    } catch (error) {
      logger.error('Failed to delete settlement', { error, userId, settlementId })
      throw error
    }
  },
}
