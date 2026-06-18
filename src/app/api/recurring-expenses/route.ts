import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { recurringExpenseService } from '@/features/recurring-expenses/services/recurring-expense-service'
import { createRecurringExpenseSchema } from '@/features/recurring-expenses/schemas'
import { cachedJson } from '@/lib/api-response'
import type { ApiResponse, ApiError } from '@/types/api'

export async function GET() {
  try {
    const user = await requireCurrentUser()
    const recurringExpenses = await recurringExpenseService.list(user.id)

    return cachedJson<ApiResponse<any>>({
      data: recurringExpenses,
      message: 'Recurring expenses retrieved successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch recurring expenses'
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

    const validatedData = createRecurringExpenseSchema.parse(body)
    const recurringExpense = await recurringExpenseService.create(user.id, validatedData)

    return NextResponse.json<ApiResponse<any>>(
      {
        data: recurringExpense,
        message: 'Recurring expense created successfully',
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
        message: 'Failed to create recurring expense',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
