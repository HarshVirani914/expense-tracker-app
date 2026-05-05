import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import dotenv from 'dotenv';

dotenv.config();

export async function POST(req: NextRequest) {
  // Step 1: ALWAYS verify the webhook signature - NEVER skip this
  let evt
  try {
    evt = await verifyWebhook(req) // uses CLERK_WEBHOOK_SECRET env var
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Verification failed', { status: 400 })
  }

  try {
    // Step 2: Handle user.created event
    if (evt.type === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data
      const email = email_addresses?.[0]?.email_address
      const name = `${first_name ?? ''} ${last_name ?? ''}`.trim() || null

      if (!email) {
        console.error('No email found for user:', id)
        return new Response('No email found', { status: 400 })
      }

      // Create user in database
      await prisma.user.create({
        data: {
          clerkId: id,
          email,
          name,
        },
      })

      console.log(`✓ User created in database: ${email} (${id})`)
    }

    // Step 3: Handle user.updated event
    if (evt.type === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data
      const email = email_addresses?.[0]?.email_address
      const name = `${first_name ?? ''} ${last_name ?? ''}`.trim() || null

      // Update user in database
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email,
          name,
        },
      })

      console.log(`✓ User updated in database: ${email} (${id})`)
    }

    // Step 4: Handle user.deleted event
    if (evt.type === 'user.deleted') {
      const { id } = evt.data

      // Delete user and all related data (cascade)
      await prisma.user.delete({
        where: { clerkId: id },
      })

      console.log(`✓ User deleted from database: ${id}`)
    }

    // Always return 200 to acknowledge receipt
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Error processing webhook', { status: 500 })
  }
}
