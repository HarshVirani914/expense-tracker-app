import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { recurringExpenseService } from '@/features/recurring-expenses/services/recurring-expense-service'
import { updateRecurringExpenseSchema } from '@/features/recurring-expenses/schemas'
import type { ApiResponse, ApiError } from '@/types/api'
import { RecurringExpense } from '@/features/recurring-expenses/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCurrentUser()
    const { id } = await params

    const recurringExpense = await recurringExpenseService.getById(id, user.id)

    if (!recurringExpense) {
      return NextResponse.json<ApiError>(
        {
          error: 'NotFoundError',
          message: 'Recurring expense not found',
          statusCode: 404,
        },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse<RecurringExpense>>({
      data: recurringExpense,
      message: 'Recurring expense retrieved successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch recurring expense'
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

    const validatedData = updateRecurringExpenseSchema.parse(body)
    const recurringExpense = await recurringExpenseService.update(id, user.id, validatedData)

    return NextResponse.json<ApiResponse<RecurringExpense>>({
      data: { ...recurringExpense, amount: Number(recurringExpense.amount) },
      message: 'Recurring expense updated successfully',
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
        message: 'Failed to update recurring expense',
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

    await recurringExpenseService.delete(id, user.id)

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      message: 'Recurring expense deleted successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete recurring expense'
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
