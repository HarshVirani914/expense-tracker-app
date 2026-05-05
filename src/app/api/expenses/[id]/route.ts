import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { expenseService } from '@/features/expenses/services/expense-service'
import { updateExpenseSchema } from '@/features/expenses/schemas'
import type { ApiResponse, ApiError } from '@/types/api'
import type { ExpenseWithRelations } from '@/features/expenses/types'

type Params = Promise<{ id: string }>

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const user = await requireCurrentUser()
    const { id } = await params

    const expense = await expenseService.get(user.id, id)

    return NextResponse.json<ApiResponse<ExpenseWithRelations>>({
      data: expense,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch expense'
    const statusCode = message === 'Expense not found' ? 404 : 500

    return NextResponse.json<ApiError>(
      {
        error: statusCode === 404 ? 'NotFoundError' : 'FetchError',
        message,
        statusCode,
      },
      { status: statusCode }
    )
  }
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    const user = await requireCurrentUser()
    const { id } = await params
    const body = await request.json()

    const validatedData = updateExpenseSchema.parse(body)

    const expense = await expenseService.update(user.id, id, validatedData)

    return NextResponse.json<ApiResponse<ExpenseWithRelations>>({
      data: expense,
      message: 'Expense updated successfully',
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

      const statusCode = error.message === 'Expense not found' ? 404 : 400

      return NextResponse.json<ApiError>(
        {
          error: statusCode === 404 ? 'NotFoundError' : 'UpdateError',
          message: error.message,
          statusCode,
        },
        { status: statusCode }
      )
    }

    return NextResponse.json<ApiError>(
      {
        error: 'ServerError',
        message: 'Failed to update expense',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const user = await requireCurrentUser()
    const { id } = await params

    await expenseService.delete(user.id, id)

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      message: 'Expense deleted successfully',
    })
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = error.message.includes('not found') ? 404 : 400

      return NextResponse.json<ApiError>(
        {
          error: statusCode === 404 ? 'NotFoundError' : 'DeleteError',
          message: error.message,
          statusCode,
        },
        { status: statusCode }
      )
    }

    return NextResponse.json<ApiError>(
      {
        error: 'ServerError',
        message: 'Failed to delete expense',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
