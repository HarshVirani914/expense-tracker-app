import { updateGroupSchema } from '@/features/groups/schemas'
import { groupService } from '@/features/groups/services/group-service'
import type { GroupWithMembers } from '@/features/groups/types'
import { requireCurrentUser } from '@/lib/auth'
import type { ApiError, ApiResponse } from '@/types/api'
import { NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireCurrentUser()
    const { id } = await context.params

    const group = await groupService.get(user.id, id)

    return NextResponse.json<ApiResponse<GroupWithMembers>>({
      data: group,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch group'
    const statusCode = message === 'Group not found' ? 404 : 500

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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireCurrentUser()
    const { id } = await context.params
    const body = await request.json()

    const validatedData = updateGroupSchema.parse(body)

    const group = await groupService.update(user.id, id, validatedData)

    return NextResponse.json<ApiResponse<GroupWithMembers>>({
      data: group,
      message: 'Group updated successfully',
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

      const statusCode = error.message.includes('not found') ? 404 : 400

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
        message: 'Failed to update group',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await requireCurrentUser()
    const { id } = await context.params

    await groupService.delete(user.id, id)

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      message: 'Group deleted successfully',
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
        message: 'Failed to delete group',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
