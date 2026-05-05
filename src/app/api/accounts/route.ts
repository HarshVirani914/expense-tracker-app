import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { accountService } from '@/features/accounts/services/account-service'
import { createAccountSchema } from '@/features/accounts/schemas'
import type { ApiResponse, ApiError } from '@/types/api'
import type { AccountWithBalance } from '@/features/accounts/types'

export async function GET() {
  try {
    const user = await requireCurrentUser()

    const accounts = await accountService.list(user.id)

    return NextResponse.json<ApiResponse<AccountWithBalance[]>>({
      data: accounts,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch accounts'
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

    const validatedData = createAccountSchema.parse(body)

    const account = await accountService.create(user.id, validatedData)

    return NextResponse.json<ApiResponse<AccountWithBalance>>(
      {
        data: account,
        message: 'Account created successfully',
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
        message: 'Failed to create account',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
