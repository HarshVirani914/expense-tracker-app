import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { budgetService } from '@/features/budgets/services/budget-service'
import { updateBudgetSchema } from '@/features/budgets/schemas'
import type { ApiResponse, ApiError } from '@/types/api'
import type { BudgetWithSpending, Budget } from '@/features/budgets/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCurrentUser()
    const { id } = await params

    const budget = await budgetService.getById(id, user.id)

    if (!budget) {
      return NextResponse.json<ApiError>(
        {
          error: 'NotFoundError',
          message: 'Budget not found',
          statusCode: 404,
        },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse<BudgetWithSpending>>({
      data: budget,
      message: 'Budget retrieved successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch budget'
    return NextResponse.json<ApiError>(
      {
        error: 'FetchError',
        message,
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCurrentUser()
    const { id } = await params
    const body = await request.json()

    const validatedData = updateBudgetSchema.parse(body)
    const budget = await budgetService.update(id, user.id, validatedData)

    return NextResponse.json<ApiResponse<Budget>>({
      data: { ...budget, amount: Number(budget.amount), period: budget.period as Budget['period'] },
      message: 'Budget updated successfully',
    })
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

      return NextResponse.json<ApiError>(
        {
          error: 'UpdateError',
          message: error.message,
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiError>(
      {
        error: 'ServerError',
        message: 'Failed to update budget',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCurrentUser()
    const { id } = await params

    await budgetService.delete(id, user.id)

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      message: 'Budget deleted successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete budget'
    return NextResponse.json<ApiError>(
      {
        error: 'DeleteError',
        message,
        statusCode: 400,
      },
      { status: 400 }
    )
  }
}
