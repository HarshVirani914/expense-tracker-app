import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { updateGroupExpenseSchema } from '@/features/expenses/schemas'
import { expenseService } from '@/features/expenses/services/expense-service'
import type { ApiResponse, ApiError } from '@/types/api'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: expenseId } = await params
    const user = await requireCurrentUser()
    const body = await request.json()

    const validatedData = updateGroupExpenseSchema.parse(body)

    const result = await expenseService.updateGroupExpense(
      user.id,
      expenseId,
      validatedData
    )

    return NextResponse.json<ApiResponse<typeof result>>({
      data: result,
      message: 'Group expense updated successfully',
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
          statusCode: error.message.includes('not found') ? 404 : 400,
        },
        { status: error.message.includes('not found') ? 404 : 400 }
      )
    }

    return NextResponse.json<ApiError>(
      {
        error: 'ServerError',
        message: 'Failed to update group expense',
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
    const { id: expenseId } = await params
    const user = await requireCurrentUser()

    await expenseService.deleteGroupExpense(user.id, expenseId)

    return NextResponse.json<ApiResponse<undefined>>({
      data: undefined,
      message: 'Group expense deleted successfully',
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json<ApiError>(
        {
          error: 'DeleteError',
          message: error.message,
          statusCode: error.message.includes('not found') ? 404 : 400,
        },
        { status: error.message.includes('not found') ? 404 : 400 }
      )
    }

    return NextResponse.json<ApiError>(
      {
        error: 'ServerError',
        message: 'Failed to delete group expense',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
