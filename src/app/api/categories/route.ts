import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { categoryService } from '@/features/categories/services/category-service'
import { createCategorySchema } from '@/features/categories/schemas'
import { cachedJson } from '@/lib/api-response'
import type { ApiResponse, ApiError } from '@/types/api'
import type { Category } from '@/features/categories/types'

export async function GET() {
  try {
    const user = await requireCurrentUser()

    const categories = await categoryService.list(user.id)

    return cachedJson<ApiResponse<Category[]>>({ data: categories })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch categories'
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

    const validatedData = createCategorySchema.parse(body)

    const category = await categoryService.create(user.id, validatedData)

    return NextResponse.json<ApiResponse<Category>>(
      {
        data: category,
        message: 'Category created successfully',
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
        message: 'Failed to create category',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
