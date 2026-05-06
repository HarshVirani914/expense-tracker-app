import { Prisma } from '@/generated/prisma/client'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import type { PaginatedResponse } from '@/types/api'
import type {
  AddMemberInput,
  CreateGroupInput,
  GroupFilters,
  GroupWithMembers,
  UpdateGroupInput,
} from '../types'
import { getMembersInfo } from '../utils/member-info'

export const groupService = {
  async list(
    userId: string,
    filters: GroupFilters
  ): Promise<PaginatedResponse<GroupWithMembers>> {
    try {
      const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = filters

      const skip = (page - 1) * limit

      const where: Prisma.GroupWhereInput = {
        members: {
          some: {
            userId,
          },
        },
        ...(search && {
          name: { contains: search, mode: 'insensitive' },
        }),
      }

      const [groups, total] = await Promise.all([
        prisma.group.findMany({
          where,
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                contact: true,
              },
            },
            _count: {
              select: {
                expenses: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.group.count({ where }),
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        data: groups,
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
      logger.error('Failed to list groups', { error, userId, filters })
      throw new Error('Failed to fetch groups')
    }
  },

  async get(userId: string, groupId: string): Promise<GroupWithMembers> {
    try {
      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
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
                  email: true,
                },
              },
              contact: true,
            },
          },
          _count: {
            select: {
              expenses: true,
            },
          },
        },
      })

      if (!group) {
        throw new Error('Group not found')
      }

      return group
    } catch (error) {
      logger.error('Failed to get group', { error, userId, groupId })
      throw error
    }
  },

  async create(userId: string, data: CreateGroupInput): Promise<GroupWithMembers> {
    try {
      const contacts = await prisma.contact.findMany({
        where: {
          id: { in: data.memberIds },
          userId,
        },
      })

      if (contacts.length !== data.memberIds.length) {
        throw new Error('One or more contacts not found')
      }

      const group = await prisma.group.create({
        data: {
          name: data.name,
          description: data.description || null,
          members: {
            create: [
              {
                userId,
                role: 'admin',
              },
              ...data.memberIds.map((contactId) => ({
                contactId,
                role: 'member',
              })),
            ],
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              contact: true,
            },
          },
          _count: {
            select: {
              expenses: true,
            },
          },
        },
      })

      logger.info('Group created', { userId, groupId: group.id })
      return group
    } catch (error) {
      logger.error('Failed to create group', { error, userId, data })
      throw error
    }
  },

  async update(
    userId: string,
    groupId: string,
    data: UpdateGroupInput
  ): Promise<GroupWithMembers> {
    try {
      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
          members: {
            some: {
              userId,
              role: 'admin',
            },
          },
        },
      })

      if (!group) {
        throw new Error('Group not found or you do not have permission to edit')
      }

      const updated = await prisma.group.update({
        where: { id: groupId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description || null }),
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              contact: true,
            },
          },
          _count: {
            select: {
              expenses: true,
            },
          },
        },
      })

      logger.info('Group updated', { userId, groupId })
      return updated
    } catch (error) {
      logger.error('Failed to update group', { error, userId, groupId, data })
      throw error
    }
  },

  async delete(userId: string, groupId: string): Promise<void> {
    try {
      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
          members: {
            some: {
              userId,
              role: 'admin',
            },
          },
        },
      })

      if (!group) {
        throw new Error('Group not found or you do not have permission to delete')
      }

      await prisma.group.delete({
        where: { id: groupId },
      })

      logger.info('Group deleted', { userId, groupId })
    } catch (error) {
      logger.error('Failed to delete group', { error, userId, groupId })
      throw error
    }
  },

  async addMember(
    userId: string,
    groupId: string,
    data: AddMemberInput
  ): Promise<GroupWithMembers> {
    try {
      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
          members: {
            some: {
              userId,
            },
          },
        },
      })

      if (!group) {
        throw new Error('Group not found')
      }

      const contact = await prisma.contact.findFirst({
        where: {
          id: data.contactId,
          userId,
        },
      })

      if (!contact) {
        throw new Error('Contact not found')
      }

      const existingMember = await prisma.groupMember.findFirst({
        where: {
          groupId,
          contactId: data.contactId,
        },
      })

      if (existingMember) {
        throw new Error('Contact is already a member of this group')
      }

      await prisma.groupMember.create({
        data: {
          groupId,
          contactId: data.contactId,
          role: 'member',
        },
      })

      const updated = await this.get(userId, groupId)

      logger.info('Member added to group', { userId, groupId, contactId: data.contactId })
      return updated
    } catch (error) {
      logger.error('Failed to add member to group', { error, userId, groupId, data })
      throw error
    }
  },

  async removeMember(
    userId: string,
    groupId: string,
    memberId: string
  ): Promise<GroupWithMembers> {
    try {
      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
          members: {
            some: {
              userId,
            },
          },
        },
      })

      if (!group) {
        throw new Error('Group not found')
      }

      const member = await prisma.groupMember.findFirst({
        where: {
          id: memberId,
          groupId,
        },
      })

      if (!member) {
        throw new Error('Member not found in this group')
      }

      if (member.userId === userId && member.role === 'admin') {
        const adminCount = await prisma.groupMember.count({
          where: {
            groupId,
            role: 'admin',
          },
        })

        if (adminCount === 1) {
          throw new Error('Cannot remove the last admin from the group')
        }
      }

      await prisma.groupMember.delete({
        where: { id: memberId },
      })

      const updated = await this.get(userId, groupId)

      logger.info('Member removed from group', { userId, groupId, memberId })
      return updated
    } catch (error) {
      logger.error('Failed to remove member from group', { error, userId, groupId, memberId })
      throw error
    }
  },

  getMembersInfo,
}
