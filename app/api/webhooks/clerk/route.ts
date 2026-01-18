import { Webhook } from 'svix'
import { headers } from 'next/headers'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/src/db'
import { users } from '@/src/db/schema'
import { eq } from 'drizzle-orm'
import { serverEnv } from '@/lib/env'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = serverEnv.CLERK_WEBHOOK_SECRET

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error: Invalid signature', { status: 400 })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id } = evt.data
    
    try {
      await db.insert(users).values({
        clerkId: id,
      }).onConflictDoNothing()
      
      console.log(`Created user record for clerkId: ${id}`)
    } catch (error) {
      console.error('Error creating user:', error)
      return new Response('Error: Failed to create user', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id } = evt.data
    
    try {
      await db.update(users)
        .set({
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, id))
      
      console.log(`Updated user record for clerkId: ${id}`)
    } catch (error) {
      console.error('Error updating user:', error)
      return new Response('Error: Failed to update user', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data
    
    if (id) {
      try {
        await db.delete(users).where(eq(users.clerkId, id))
        console.log(`Deleted user record for clerkId: ${id}`)
      } catch {
      }
    }
  }

  return new Response('Webhook processed', { status: 200 })
}
