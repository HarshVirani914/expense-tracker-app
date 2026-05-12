import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { expenseService } from '@/features/expenses/services/expense-service'
import { expenseFiltersSchema } from '@/features/expenses/schemas'
import type { ApiResponse, ApiError } from '@/types/api'
import type { ExpenseSummary } from '@/features/expenses/types'

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser()
    const { searchParams } = new URL(request.url)

    const filters = Object.fromEntries(searchParams.entries())
    const validatedFilters = expenseFiltersSchema.parse(filters)

    const summary = await expenseService.getSummary(user.id, validatedFilters)

    return NextResponse.json<ApiResponse<ExpenseSummary>>({
      data: summary,
      message: 'Expense summary fetched successfully',
    })
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

    const message = error instanceof Error ? error.message : 'Failed to fetch expense summary'
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
