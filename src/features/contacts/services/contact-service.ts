import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type {
  ContactWithRelations,
  CreateContactInput,
  UpdateContactInput,
  ContactFilters,
} from '../types'
import type { PaginatedResponse } from '@/types/api'
import { Prisma } from '@/generated/prisma/client'

export const contactService = {
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

  async delete(userId: string, contactId: string): Promise<void> {
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

      if (
        contact._count &&
        (contact._count.groupMemberships > 0 || contact._count.expenseParticipants > 0)
      ) {
        throw new Error(
          'Cannot delete contact with active group memberships or expense participations'
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
