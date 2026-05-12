import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { contactService } from '@/features/contacts/services/contact-service'
import type { ApiResponse, ApiError } from '@/types/api'
import type { ContactStats } from '@/features/contacts/types'

export async function GET() {
  try {
    const user = await requireCurrentUser()

    const stats = await contactService.getStats(user.id)

    return NextResponse.json<ApiResponse<ContactStats>>({
      data: stats,
    })
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : 'Failed to fetch contact stats'
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
