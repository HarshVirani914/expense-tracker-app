import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { categoryService } from '@/features/categories/services/category-service'
import type { ApiResponse, ApiError } from '@/types/api'
import type { CategorySpending } from '@/features/categories/types'

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser()
    const { searchParams } = new URL(request.url)
    
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!)
      : undefined
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined

    const categorySpending = await categoryService.getCategorySpending(
      user.id,
      startDate,
      endDate
    )

    return NextResponse.json<ApiResponse<CategorySpending[]>>({
      data: categorySpending,
    })
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : 'Failed to fetch category spending'
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
