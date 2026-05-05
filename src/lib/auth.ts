import { clerkClient, currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'
import { logger } from './logger'

/**
 * Gets the current authenticated user from database
 * Creates the user if they don't exist (fallback sync)
 * 
 * @returns User from database or null if not authenticated
 */
export const getCurrentUser = async () => {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  })

  // If user doesn't exist, create them (fallback in case webhook failed)
  if (!user) {
    const email = clerkUser.emailAddresses[0]?.emailAddress
    const name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null

    if (!email) {
      logger.error('User email not found', undefined, { clerkId: clerkUser.id })
      throw new Error('User email not found')
    }

    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name,
      },
    })

    logger.info('User created via fallback sync', { 
      clerkId: clerkUser.id, 
      email 
    })
  }

  return user
}

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

  user = await prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email,
      name,
    },
  })

  log.info('User created via Clerk API', { email })
  return user
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
