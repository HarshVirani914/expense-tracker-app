import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { budgetService } from '@/features/budgets/services/budget-service'
import { createBudgetSchema } from '@/features/budgets/schemas'
import type { ApiResponse, ApiError } from '@/types/api'
import type { BudgetWithSpending, Budget } from '@/features/budgets/types'

export async function GET() {
  try {
    const user = await requireCurrentUser()
    const budgets = await budgetService.list(user.id)

    return NextResponse.json<ApiResponse<BudgetWithSpending[]>>({
      data: budgets,
      message: 'Budgets retrieved successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch budgets'
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

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser()
    const body = await request.json()

    const validatedData = createBudgetSchema.parse(body)
    const budget = await budgetService.create(user.id, validatedData)

    return NextResponse.json<ApiResponse<Budget>>(
      {
        data: { ...budget, amount: Number(budget.amount), period: budget.period as Budget['period'] },
        message: "Budget created successfully",
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
        message: 'Failed to create budget',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
