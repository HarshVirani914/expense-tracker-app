import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { categoryService } from '@/features/categories/services/category-service'
import { updateCategorySchema } from '@/features/categories/schemas'
import type { ApiResponse, ApiError } from '@/types/api'
import type { Category } from '@/features/categories/types'

type Params = Promise<{ id: string }>

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const user = await requireCurrentUser()
    const { id } = await params

    const category = await categoryService.get(user.id, id)

    return NextResponse.json<ApiResponse<Category>>({
      data: category,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch category'
    const statusCode = message === 'Category not found' ? 404 : 500

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

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    const user = await requireCurrentUser()
    const { id } = await params
    const body = await request.json()

    const validatedData = updateCategorySchema.parse(body)

    const category = await categoryService.update(user.id, id, validatedData)

    return NextResponse.json<ApiResponse<Category>>({
      data: category,
      message: 'Category updated successfully',
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

      const statusCode =
        error.message === 'Category not found or cannot be modified' ? 404 : 400

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
        message: 'Failed to update category',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const user = await requireCurrentUser()
    const { id } = await params

    await categoryService.delete(user.id, id)

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      message: 'Category deleted successfully',
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
        message: 'Failed to delete category',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
