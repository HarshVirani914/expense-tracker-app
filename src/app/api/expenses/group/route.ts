import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { createGroupExpenseSchema } from '@/features/expenses/schemas'
import type { ApiResponse, ApiError } from '@/types/api'

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser()
    const body = await request.json()

    const validatedData = createGroupExpenseSchema.parse(body)

    const group = await prisma.group.findFirst({
      where: {
        id: validatedData.groupId,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json<ApiError>(
        {
          error: 'NotFoundError',
          message: 'Group not found or you are not a member',
          statusCode: 404,
        },
        { status: 404 }
      )
    }

    const category = await prisma.category.findFirst({
      where: {
        id: validatedData.categoryId,
        OR: [{ userId: user.id }, { isDefault: true, userId: null }],
      },
    })

    if (!category) {
      return NextResponse.json<ApiError>(
        {
          error: 'NotFoundError',
          message: 'Category not found',
          statusCode: 404,
        },
        { status: 404 }
      )
    }

    const totalOwed = validatedData.participants.reduce((sum, p) => sum + p.oweAmount, 0)
    if (Math.abs(totalOwed - validatedData.amount) > 0.01) {
      return NextResponse.json<ApiError>(
        {
          error: 'ValidationError',
          message: 'Total split amounts must equal expense amount',
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          amount: validatedData.amount,
          description: validatedData.description,
          date: new Date(validatedData.date),
          type: 'EXPENSE',
          paymentMethod: 'OTHER',
          userId: user.id,
          categoryId: validatedData.categoryId,
          groupId: validatedData.groupId,
        },
        include: {
          category: true,
          group: true,
        },
      })

      const participantData = validatedData.participants.map((p) => {
        const isUser = p.isUser
        return {
          expenseId: expense.id,
          userId: isUser ? p.memberIdOrContact : null,
          contactId: !isUser ? p.memberIdOrContact : null,
          paidAmount: p.paidAmount,
          oweAmount: p.oweAmount,
          splitType: p.splitType,
          splitValue: p.splitValue,
        }
      })

      await tx.expenseParticipant.createMany({
        data: participantData,
      })

      return expense
    })

    logger.info('Group expense created', { userId: user.id, expenseId: result.id })

    return NextResponse.json<ApiResponse<typeof result>>(
      {
        data: result,
        message: 'Group expense created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return NextResponse.json<ApiError>(
          {
            error: 'ValidationError',
            message: 'Invalid input data',
            statusCode: 400,
            details: JSON.parse(error.message),
          },
          { status: 400 }
        )
      }

      logger.error('Failed to create group expense', { error, userId: 'unknown' })

      return NextResponse.json<ApiError>(
        {
          error: 'CreateError',
          message: error.message,
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiError>(
      {
        error: 'ServerError',
        message: 'Failed to create group expense',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
