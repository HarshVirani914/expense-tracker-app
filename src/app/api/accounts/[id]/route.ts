import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { accountService } from '@/features/accounts/services/account-service'
import { updateAccountSchema } from '@/features/accounts/schemas'
import type { ApiResponse, ApiError } from '@/types/api'
import type { AccountWithBalance } from '@/features/accounts/types'

type Params = Promise<{ id: string }>

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const user = await requireCurrentUser()
    const { id } = await params

    const account = await accountService.get(user.id, id)

    return NextResponse.json<ApiResponse<AccountWithBalance>>({
      data: account,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch account'
    const statusCode = message === 'Account not found' ? 404 : 500

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

    const validatedData = updateAccountSchema.parse(body)

    const account = await accountService.update(user.id, id, validatedData)

    return NextResponse.json<ApiResponse<AccountWithBalance>>({
      data: account,
      message: 'Account updated successfully',
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

      const statusCode = error.message === 'Account not found' ? 404 : 400

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
        message: 'Failed to update account',
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

    await accountService.delete(user.id, id)

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      message: 'Account deleted successfully',
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
        message: 'Failed to delete account',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
