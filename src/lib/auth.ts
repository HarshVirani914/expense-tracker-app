import { clerkClient, currentUser } from '@clerk/nextjs/server'
import { cache } from 'react'
import { prisma } from './prisma'
import { logger } from './logger'

const isPrismaUniqueViolation = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: string }).code === 'P2002'

/**
 * Gets the current authenticated user from database
 * Creates the user if they don't exist (fallback sync)
 *
 * @returns User from database or null if not authenticated
 */
// cache() deduplicates calls within the same RSC render tree so Clerk
// session + DB lookup only fires once even if multiple server components
// call getCurrentUser() on the same request.
export const getCurrentUser = cache(async () => {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  })

  if (user) {
    return user
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress
  const name =
    `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null

  if (!email) {
    logger.error('User email not found', undefined, { clerkId: clerkUser.id })
    throw new Error('User email not found')
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
  })

  if (existingByEmail) {
    user = await prisma.user.update({
      where: { id: existingByEmail.id },
      data: { clerkId: clerkUser.id, name },
    })
    logger.info('User reconciled: clerkId updated for existing email', {
      clerkId: clerkUser.id,
      email,
    })
    return user
  }

  try {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name,
      },
    })
    logger.info('User created via fallback sync', {
      clerkId: clerkUser.id,
      email,
    })
    return user
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      user = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
      })
      if (user) {
        return user
      }
      user = await prisma.user.findUnique({ where: { email } })
      if (user) {
        return user
      }
    }
    throw error
  }
})

/**
 * Gets or creates a user by Clerk ID
 * Useful for background jobs or when you have a Clerk user ID
 * 
 * @param clerkId - Clerk user ID
 * @returns User from database
 */
export const getOrCreateUserByClerkId = async (clerkId: string) => {
  const log = logger.child({ clerkId })

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { clerkId },
  })

  if (user) {
    return user
  }

  // If not found, fetch from Clerk and create
  log.debug('User not found in database, fetching from Clerk')
  
  const clerk = await clerkClient()
  const clerkUser = await clerk.users.getUser(clerkId)

  const email = clerkUser.emailAddresses[0]?.emailAddress
  const name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null

  if (!email) {
    log.error('User email not found in Clerk')
    throw new Error('User email not found')
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
  })

  if (existingByEmail) {
    user = await prisma.user.update({
      where: { id: existingByEmail.id },
      data: { clerkId: clerkUser.id, name },
    })
    log.info('User reconciled by email (getOrCreateUserByClerkId)', { email })
    return user
  }

  try {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name,
      },
    })
    log.info('User created via Clerk API', { email })
    return user
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      user = await prisma.user.findUnique({ where: { clerkId } })
      if (user) {
        return user
      }
      user = await prisma.user.findUnique({ where: { email } })
      if (user) {
        return user
      }
    }
    throw error
  }
}

/**
 * Requires authentication and returns the current user
 * Throws error if not authenticated
 * 
 * @returns User from database
 * @throws Error if not authenticated
 */
export const requireCurrentUser = async () => {
  const user = await getCurrentUser()

  if (!user) {
    logger.warn('Unauthorized access attempt')
    throw new Error('Unauthorized: User not authenticated')
  }

  return user
}
