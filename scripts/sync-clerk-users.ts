/**
 * One-time script to sync existing Clerk users to database
 * Run this if you already have users in Clerk before setting up webhooks
 * 
 * Usage: tsx scripts/sync-clerk-users.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Verify required environment variables
if (!process.env.CLERK_SECRET_KEY) {
  console.error('❌ Error: CLERK_SECRET_KEY not found in .env.local')
  console.error('Please add your Clerk secret key to .env.local')
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in .env.local')
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
  console.log('Starting Clerk user sync...\n')

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

      console.log(`Fetched ${allUsers.length} users from Clerk...`)
    }

    console.log(`\nTotal users found in Clerk: ${allUsers.length}`)
    console.log('Syncing to database...\n')

    let created = 0
    let updated = 0
    let skipped = 0

    for (const clerkUser of allUsers) {
      const email = clerkUser.emailAddresses[0]?.emailAddress
      const name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null

      if (!email) {
        console.log(`⚠ Skipping user ${clerkUser.id} - no email address`)
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
          console.log(`✓ Updated: ${email} (${clerkUser.id})`)
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
          console.log(`✓ Created: ${email} (${clerkUser.id})`)
          created++
        }
      } catch (error: unknown) {
        console.error(`✗ Error syncing user ${clerkUser.id}:`, error instanceof Error ? error.message : String(error))
        skipped++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('Sync Complete!')
    console.log('='.repeat(50))
    console.log(`Created: ${created}`)
    console.log(`Updated: ${updated}`)
    console.log(`Skipped: ${skipped}`)
    console.log(`Total processed: ${allUsers.length}`)
    console.log('='.repeat(50))
  } catch (error) {
    console.error('Error during sync:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the sync
syncClerkUsers()
  .then(() => {
    console.log('\n✓ Sync completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n✗ Sync failed:', error)
    process.exit(1)
  })
