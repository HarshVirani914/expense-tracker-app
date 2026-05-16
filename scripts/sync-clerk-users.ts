/**
 * One-time script to sync existing Clerk users to database
 * Run this if you already have users in Clerk before setting up webhooks
 * 
 * Usage: tsx scripts/sync-clerk-users.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { logger } from '@/lib/logger'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Verify required environment variables
if (!process.env.CLERK_SECRET_KEY) {
  logger.error('❌ Error: CLERK_SECRET_KEY not found in .env.local')
  logger.error('Please add your Clerk secret key to .env.local')
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  logger.error('❌ Error: DATABASE_URL not found in .env.local')
  process.exit(1)
}

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { createClerkClient, User } from '@clerk/nextjs/server'

// Create Clerk client for backend/script usage
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const syncClerkUsers = async () => {
  logger.info('Starting Clerk user sync...\n')

  try {
    // Fetch all users from Clerk
    let allUsers: User[] = []
    let hasMore = true
    let offset = 0
    const limit = 100

    while (hasMore) {
      const response = await clerk.users.getUserList({
        limit,
        offset,
      })

      allUsers = allUsers.concat(response.data)
      hasMore = response.data.length === limit
      offset += limit

      logger.info(`Fetched ${allUsers.length} users from Clerk...`)
    }

    logger.info(`\nTotal users found in Clerk: ${allUsers.length}`)
    logger.info('Syncing to database...\n')

    let created = 0
    let updated = 0
    let skipped = 0

    for (const clerkUser of allUsers) {
      const email = clerkUser.emailAddresses[0]?.emailAddress
      const name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null

      if (!email) {
        logger.info(`⚠ Skipping user ${clerkUser.id} - no email address`)
        skipped++
        continue
      }

      try {
        // Try to find existing user
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: clerkUser.id },
        })

        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { clerkId: clerkUser.id },
            data: {
              email,
              name,
            },
          })
          logger.info(`✓ Updated: ${email} (${clerkUser.id})`)
          updated++
        } else {
          // Create new user
          await prisma.user.create({
            data: {
              clerkId: clerkUser.id,
              email,
              name,
            },
          })
          logger.info(`✓ Created: ${email} (${clerkUser.id})`)
          created++
        }
      } catch (error: unknown) {
        logger.error(`✗ Error syncing user ${clerkUser.id}:`, error instanceof Error ? error : new Error(String(error)))
        skipped++
      }
    }

    logger.info('\n' + '='.repeat(50))
    logger.info('Sync Complete!')
    logger.info('='.repeat(50))
    logger.info(`Created: ${created}`)
    logger.info(`Updated: ${updated}`)
    logger.info(`Skipped: ${skipped}`)
    logger.info(`Total processed: ${allUsers.length}`)
    logger.info('='.repeat(50))
  } catch (error) {
    logger.error('Error during sync:', error instanceof Error ? error : new Error(String(error)))
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the sync
syncClerkUsers()
  .then(() => {
    logger.info('\n✓ Sync completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    logger.error('\n✗ Sync failed:', error)
    process.exit(1)
  })
