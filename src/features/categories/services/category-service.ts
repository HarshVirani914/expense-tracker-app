import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types'
import { DEFAULT_CATEGORIES } from '../types'

export const categoryService = {
  async list(userId: string): Promise<Category[]> {
    try {
      let categories = await prisma.category.findMany({
        where: {
          OR: [{ userId }, { isDefault: true, userId: null }],
        },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      })

      if (categories.length === 0) {
        categories = await this.seedDefaults(userId)
      }

      return categories
    } catch (error) {
      logger.error('Failed to list categories', { error, userId })
      throw new Error('Failed to fetch categories')
    }
  },

  async get(userId: string, categoryId: string): Promise<Category> {
    try {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          OR: [{ userId }, { isDefault: true, userId: null }],
        },
      })

      if (!category) {
        throw new Error('Category not found')
      }

      return category
    } catch (error) {
      logger.error('Failed to get category', { error, userId, categoryId })
      throw error
    }
  },

  async create(userId: string, data: CreateCategoryInput): Promise<Category> {
    try {
      const existing = await prisma.category.findFirst({
        where: {
          name: data.name,
          userId,
        },
      })

      if (existing) {
        throw new Error('A category with this name already exists')
      }

      const category = await prisma.category.create({
        data: {
          ...data,
          userId,
          isDefault: false,
        },
      })

      logger.info('Category created', { userId, categoryId: category.id })
      return category
    } catch (error) {
      logger.error('Failed to create category', { error, userId, data })
      throw error
    }
  },

  async update(
    userId: string,
    categoryId: string,
    data: UpdateCategoryInput
  ): Promise<Category> {
    try {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId,
          isDefault: false,
        },
      })

      if (!category) {
        throw new Error('Category not found or cannot be modified')
      }

      if (data.name) {
        const existing = await prisma.category.findFirst({
          where: {
            name: data.name,
            userId,
            id: { not: categoryId },
          },
        })

        if (existing) {
          throw new Error('A category with this name already exists')
        }
      }

      const updated = await prisma.category.update({
        where: { id: categoryId },
        data,
      })

      logger.info('Category updated', { userId, categoryId })
      return updated
    } catch (error) {
      logger.error('Failed to update category', { error, userId, categoryId, data })
      throw error
    }
  },

  async delete(userId: string, categoryId: string): Promise<void> {
    try {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId,
          isDefault: false,
        },
        include: {
          _count: {
            select: { expenses: true },
          },
        },
      })

      if (!category) {
        throw new Error('Category not found or cannot be deleted')
      }

      if (category._count.expenses > 0) {
        throw new Error(
          `Cannot delete category with ${category._count.expenses} associated expenses`
        )
      }

      await prisma.category.delete({
        where: { id: categoryId },
      })

      logger.info('Category deleted', { userId, categoryId })
    } catch (error) {
      logger.error('Failed to delete category', { error, userId, categoryId })
      throw error
    }
  },

  async seedDefaults(userId: string): Promise<Category[]> {
    try {
      const existing = await prisma.category.findMany({
        where: {
          OR: [{ userId }, { isDefault: true, userId: null }],
        },
      })

      if (existing.length > 0) {
        return existing
      }

      const categories = await prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          name: cat.name,
          color: cat.color,
          isDefault: false,
          userId,
        })),
      })

      logger.info('Default categories seeded', { userId, count: categories.count })

      return this.list(userId)
    } catch (error) {
      logger.error('Failed to seed default categories', { error, userId })
      throw new Error('Failed to initialize categories')
    }
  },
}
