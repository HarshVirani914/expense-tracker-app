import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type {
  ContactWithRelations,
  CreateContactInput,
  UpdateContactInput,
  ContactFilters,
  ContactStats,
  ContactDeletionCheck,
  ContactSharedExpense,
} from '../types'
import type { PaginatedResponse } from '@/types/api'
import { Prisma } from '@/generated/prisma/client'

export const contactService = {
  async getSharedExpenses(
    userId: string,
    contactId: string,
    limit: number = 10
  ): Promise<ContactSharedExpense[]> {
    try {
      const expenses = await prisma.expense.findMany({
        where: {
          userId,
          groupId: { not: null },
          participants: {
            some: {
              contactId,
            },
          },
        },
        include: {
          category: true,
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          participants: {
            where: {
              OR: [{ contactId }, { userId }],
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        take: limit,
      })

      return expenses.map((expense) => {
        const userParticipant = expense.participants.find((p) => !p.contactId)
        const contactParticipant = expense.participants.find((p) => p.contactId === contactId)

        return {
          id: expense.id,
          amount: Number(expense.amount),
          description: expense.description,
          date: expense.date,
          groupId: expense.group?.id || '',
          groupName: expense.group?.name || '',
          categoryName: expense.category.name,
          categoryColor: expense.category.color,
          userPaid: userParticipant ? Number(userParticipant.paidAmount) : 0,
          userOwes: userParticipant ? Number(userParticipant.oweAmount) : 0,
          contactPaid: contactParticipant ? Number(contactParticipant.paidAmount) : 0,
          contactOwes: contactParticipant ? Number(contactParticipant.oweAmount) : 0,
        }
      })
    } catch (error) {
      logger.error('Failed to get shared expenses', { error, userId, contactId })
      throw new Error('Failed to fetch shared expenses')
    }
  },

  async getStats(userId: string): Promise<ContactStats> {
    try {
      const [totalContacts, contacts] = await Promise.all([
        prisma.contact.count({
          where: { userId },
        }),
        prisma.contact.findMany({
          where: { userId },
          include: {
            _count: {
              select: {
                groupMemberships: true,
                expenseParticipants: true,
              },
            },
          },
        }),
      ])

      const activeContacts = contacts.filter(
        (c) =>
          c._count.groupMemberships > 0 || c._count.expenseParticipants > 0
      ).length

      const totalGroupMemberships = contacts.reduce(
        (sum, c) => sum + c._count.groupMemberships,
        0
      )

      const totalExpenses = contacts.reduce(
        (sum, c) => sum + c._count.expenseParticipants,
        0
      )

      return {
        totalContacts,
        activeContacts,
        totalGroupMemberships,
        totalExpenses,
      }
    } catch (error) {
      logger.error('Failed to get contact stats', { error, userId })
      throw new Error('Failed to fetch contact stats')
    }
  },
  async list(
    userId: string,
    filters: ContactFilters
  ): Promise<PaginatedResponse<ContactWithRelations>> {
    try {
      const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = filters

      const skip = (page - 1) * limit

      const where: Prisma.ContactWhereInput = {
        userId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }),
      }

      const [contacts, total] = await Promise.all([
        prisma.contact.findMany({
          where,
          include: {
            _count: {
              select: {
                groupMemberships: true,
                expenseParticipants: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.contact.count({ where }),
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        data: contacts,
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
      logger.error('Failed to list contacts', { error, userId, filters })
      throw new Error('Failed to fetch contacts')
    }
  },

  async get(userId: string, contactId: string): Promise<ContactWithRelations> {
    try {
      const contact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          userId,
        },
        include: {
          _count: {
            select: {
              groupMemberships: true,
              expenseParticipants: true,
            },
          },
        },
      })

      if (!contact) {
        throw new Error('Contact not found')
      }

      return contact
    } catch (error) {
      logger.error('Failed to get contact', { error, userId, contactId })
      throw error
    }
  },

  async create(userId: string, data: CreateContactInput): Promise<ContactWithRelations> {
    try {
      const contact = await prisma.contact.create({
        data: {
          ...data,
          email: data.email || null,
          phone: data.phone || null,
          userId,
        },
        include: {
          _count: {
            select: {
              groupMemberships: true,
              expenseParticipants: true,
            },
          },
        },
      })

      logger.info('Contact created', { userId, contactId: contact.id })
      return contact
    } catch (error) {
      logger.error('Failed to create contact', { error, userId, data })
      throw error
    }
  },

  async update(
    userId: string,
    contactId: string,
    data: UpdateContactInput
  ): Promise<ContactWithRelations> {
    try {
      const contact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          userId,
        },
      })

      if (!contact) {
        throw new Error('Contact not found')
      }

      const updated = await prisma.contact.update({
        where: { id: contactId },
        data: {
          ...data,
          email: data.email || null,
          phone: data.phone || null,
        },
        include: {
          _count: {
            select: {
              groupMemberships: true,
              expenseParticipants: true,
            },
          },
        },
      })

      logger.info('Contact updated', { userId, contactId })
      return updated
    } catch (error) {
      logger.error('Failed to update contact', { error, userId, contactId, data })
      throw error
    }
  },

  async checkDeletion(userId: string, contactId: string): Promise<ContactDeletionCheck> {
    try {
      const contact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          userId,
        },
        include: {
          groupMemberships: {
            include: {
              group: true,
            },
          },
          expenseParticipants: {
            include: {
              expense: {
                include: {
                  group: true,
                },
              },
            },
          },
          settlementsFrom: true,
          settlementsTo: true,
        },
      })

      if (!contact) {
        throw new Error('Contact not found')
      }

      const activeGroups = contact.groupMemberships.map((membership) => ({
        id: membership.group.id,
        name: membership.group.name,
      }))

      let totalOwed = 0
      let totalOwing = 0

      contact.expenseParticipants.forEach((participant) => {
        const netAmount = Number(participant.paidAmount) - Number(participant.oweAmount)
        if (netAmount > 0) {
          totalOwed += netAmount
        } else if (netAmount < 0) {
          totalOwing += Math.abs(netAmount)
        }
      })

      contact.settlementsFrom.forEach((settlement) => {
        totalOwing -= Number(settlement.amount)
      })

      contact.settlementsTo.forEach((settlement) => {
        totalOwed -= Number(settlement.amount)
      })

      totalOwed = Math.max(0, totalOwed)
      totalOwing = Math.max(0, totalOwing)

      const unsettledExpenses = contact.expenseParticipants.filter(
        (participant) => Number(participant.oweAmount) > 0
      ).length

      const canDelete = activeGroups.length === 0 && totalOwed === 0 && totalOwing === 0

      return {
        canDelete,
        reasons: {
          activeGroups,
          unsettledExpenses,
          totalOwed,
          totalOwing,
        },
      }
    } catch (error) {
      logger.error('Failed to check contact deletion', { error, userId, contactId })
      throw error
    }
  },

  async delete(userId: string, contactId: string): Promise<void> {
    try {
      const deletionCheck = await this.checkDeletion(userId, contactId)

      if (!deletionCheck.canDelete) {
        const reasons = []
        if (deletionCheck.reasons.activeGroups.length > 0) {
          reasons.push(
            `part of ${deletionCheck.reasons.activeGroups.length} active group(s)`
          )
        }
        if (deletionCheck.reasons.totalOwed > 0) {
          reasons.push(`owed ${deletionCheck.reasons.totalOwed} in unsettled expenses`)
        }
        if (deletionCheck.reasons.totalOwing > 0) {
          reasons.push(`owes ${deletionCheck.reasons.totalOwing} in unsettled expenses`)
        }

        throw new Error(
          `Cannot delete contact: ${reasons.join(', ')}. Please settle all expenses and remove from groups first.`
        )
      }

      await prisma.contact.delete({
        where: { id: contactId },
      })

      logger.info('Contact deleted', { userId, contactId })
    } catch (error) {
      logger.error('Failed to delete contact', { error, userId, contactId })
      throw error
    }
  },
}
