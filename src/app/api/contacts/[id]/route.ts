import { NextResponse } from 'next/server'
import { requireCurrentUser } from '@/lib/auth'
import { contactService } from '@/features/contacts/services/contact-service'
import { updateContactSchema } from '@/features/contacts/schemas'
import type { ApiResponse, ApiError } from '@/types/api'
import type { ContactWithRelations } from '@/features/contacts/types'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireCurrentUser()
    const { id } = await context.params

    const contact = await contactService.get(user.id, id)

    return NextResponse.json<ApiResponse<ContactWithRelations>>({
      data: contact,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch contact'
    const statusCode = message === 'Contact not found' ? 404 : 500

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

    const validatedData = updateContactSchema.parse(body)

    const contact = await contactService.update(user.id, id, validatedData)

    return NextResponse.json<ApiResponse<ContactWithRelations>>({
      data: contact,
      message: 'Contact updated successfully',
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

      const statusCode = error.message === 'Contact not found' ? 404 : 400

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
        message: 'Failed to update contact',
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

    await contactService.delete(user.id, id)

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      message: 'Contact deleted successfully',
    })
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = error.message === 'Contact not found' ? 404 : 400

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
        message: 'Failed to delete contact',
        statusCode: 500,
      },
      { status: 500 }
    )
  }
}
