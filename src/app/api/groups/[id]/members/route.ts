import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { groupService } from '@/features/groups/services/group-service'
import { addMemberSchema } from '@/features/groups/schemas'
import type { ApiResponse, ApiError } from '@/types/api'
import type { GroupWithMembers } from '@/features/groups/types'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireCurrentUser()
    const { id: groupId } = await context.params
    const body = await request.json()

    const validatedData = addMemberSchema.parse(body)

    const group = await groupService.addMember(user.id, groupId, validatedData)

    return NextResponse.json<ApiResponse<GroupWithMembers>>(
      {
        data: group,
        message: 'Member added successfully',
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
          error: 'AddMemberError',
          message: error.message,
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiError>(
      {
        error: 'ServerError',
        message: 'Failed to add member',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await requireCurrentUser()
    const { id: groupId } = await context.params
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json<ApiError>(
        {
          error: 'ValidationError',
          message: 'Member ID is required',
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    const group = await groupService.removeMember(user.id, groupId, memberId)

    return NextResponse.json<ApiResponse<GroupWithMembers>>({
      data: group,
      message: 'Member removed successfully',
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json<ApiError>(
        {
          error: 'RemoveMemberError',
          message: error.message,
          statusCode: 400,
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiError>(
      {
        error: 'ServerError',
        message: 'Failed to remove member',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
