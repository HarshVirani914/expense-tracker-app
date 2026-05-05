import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { expenseService } from '@/features/expenses/services/expense-service'
import { createExpenseSchema, expenseFiltersSchema } from '@/features/expenses/schemas'
import type { PaginatedResponse, ApiResponse, ApiError } from '@/types/api'
import type { ExpenseWithRelations } from '@/features/expenses/types'

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser()
    const { searchParams } = new URL(request.url)

    const filters = Object.fromEntries(searchParams.entries())
    const validatedFilters = expenseFiltersSchema.parse(filters)

    const expenses = await expenseService.list(user.id, validatedFilters)

    return NextResponse.json<PaginatedResponse<ExpenseWithRelations>>(expenses)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json<ApiError>(
        {
          error: 'ValidationError',
          message: 'Invalid filter parameters',
          statusCode: 400,
          details: JSON.parse(error.message),
        },
        { status: 400 }
      )
    }

    const message = error instanceof Error ? error.message : 'Failed to fetch expenses'
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

    const validatedData = createExpenseSchema.parse(body)

    const expense = await expenseService.create(user.id, validatedData)

    return NextResponse.json<ApiResponse<ExpenseWithRelations>>(
      {
        data: expense,
        message: 'Expense created successfully',
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
        message: 'Failed to create expense',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
