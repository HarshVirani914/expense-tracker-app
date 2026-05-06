import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { settlementService } from '@/features/settlements/services/settlement-service'
import {
  createSettlementSchema,
  settlementFiltersSchema,
} from '@/features/settlements/schemas'
import type { PaginatedResponse, ApiResponse, ApiError } from '@/types/api'
import type { SettlementWithRelations } from '@/features/settlements/types'

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser()
    const { searchParams } = new URL(request.url)

    const filters = Object.fromEntries(searchParams.entries())
    const validatedFilters = settlementFiltersSchema.parse(filters)

    const settlements = await settlementService.list(user.id, validatedFilters)

    return NextResponse.json<PaginatedResponse<SettlementWithRelations>>(settlements)
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

    const message = error instanceof Error ? error.message : 'Failed to fetch settlements'
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

    const validatedData = createSettlementSchema.parse(body)

    const settlement = await settlementService.create(user.id, validatedData)

    return NextResponse.json<ApiResponse<SettlementWithRelations>>(
      {
        data: settlement,
        message: 'Settlement recorded successfully',
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
        message: 'Failed to record settlement',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
