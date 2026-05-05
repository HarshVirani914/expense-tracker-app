import { clerkClient, currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

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
      throw new Error('User email not found')
    }

    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name,
      },
    })

    console.log(`Created user via fallback sync: ${email} (${clerkUser.id})`)
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
  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { clerkId },
  })

  if (user) {
    return user
  }

  // If not found, fetch from Clerk and create
  const clerk = await clerkClient()
  const clerkUser = await clerk.users.getUser(clerkId)

  const email = clerkUser.emailAddresses[0]?.emailAddress
  const name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null

  if (!email) {
    throw new Error('User email not found')
  }

  user = await prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email,
      name,
    },
  })

  console.log(`Created user via Clerk API: ${email} (${clerkId})`)
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
    throw new Error('Unauthorized: User not authenticated')
  }

  return user
}
