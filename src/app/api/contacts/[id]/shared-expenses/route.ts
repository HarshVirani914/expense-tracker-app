import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { contactService } from '@/features/contacts/services/contact-service'
import type { ApiResponse, ApiError } from '@/types/api'
import type { ContactSharedExpense } from '@/features/contacts/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCurrentUser()
    const contactId = (await params).id
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const sharedExpenses = await contactService.getSharedExpenses(user.id, contactId, limit)

    return NextResponse.json<ApiResponse<ContactSharedExpense[]>>({
      data: sharedExpenses,
    })
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : 'Failed to fetch shared expenses'
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
