import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { contactService } from '@/features/contacts/services/contact-service'
import type { ApiResponse, ApiError } from '@/types/api'
import type { ContactDeletionCheck } from '@/features/contacts/types'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await requireCurrentUser()
    const contactId = (await context.params).id

    const deletionCheck = await contactService.checkDeletion(user.id, contactId)

    return NextResponse.json<ApiResponse<ContactDeletionCheck>>({
      data: deletionCheck,
    })
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : 'Failed to check contact deletion'
    return NextResponse.json<ApiError>(
      {
        error: 'CheckError',
        message,
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
