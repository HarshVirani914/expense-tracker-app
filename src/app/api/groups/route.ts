import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { groupService } from '@/features/groups/services/group-service'
import { createGroupSchema, groupFiltersSchema } from '@/features/groups/schemas'
import type { PaginatedResponse, ApiResponse, ApiError } from '@/types/api'
import type { GroupWithMembers } from '@/features/groups/types'

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser()
    const { searchParams } = new URL(request.url)

    const filters = Object.fromEntries(searchParams.entries())
    const validatedFilters = groupFiltersSchema.parse(filters)

    const groups = await groupService.list(user.id, validatedFilters)

    return NextResponse.json<PaginatedResponse<GroupWithMembers>>(groups)
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

    const message = error instanceof Error ? error.message : 'Failed to fetch groups'
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

    const validatedData = createGroupSchema.parse(body)

    const group = await groupService.create(user.id, validatedData)

    return NextResponse.json<ApiResponse<GroupWithMembers>>(
      {
        data: group,
        message: 'Group created successfully',
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
        message: 'Failed to create group',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
