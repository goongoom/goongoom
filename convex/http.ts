import { httpRouter } from 'convex/server'
import { Webhook } from 'svix'
import { internal } from './_generated/api'
import { httpAction } from './_generated/server'

const http = httpRouter()

http.route({
  path: '/clerk',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET not configured')
      return new Response('Server configuration error', { status: 500 })
    }

    const svixId = request.headers.get('svix-id')
    const svixTimestamp = request.headers.get('svix-timestamp')
    const svixSignature = request.headers.get('svix-signature')

    if (!(svixId && svixTimestamp && svixSignature)) {
      return new Response('Missing svix headers', { status: 400 })
    }

    const body = await request.text()

    const wh = new Webhook(webhookSecret)
    let evt: {
      type: string
      data: {
        id: string
        username?: string | null
        first_name?: string | null
        last_name?: string | null
        image_url?: string | null
      }
    }

    try {
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as typeof evt
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Invalid signature', { status: 400 })
    }

    const { type, data } = evt

    if (type === 'user.created' || type === 'user.updated') {
      const displayName = [data.first_name, data.last_name].filter(Boolean).join(' ') || undefined
      await ctx.runMutation(internal.users.upsertFromWebhook, {
        clerkId: data.id,
        username: data.username ?? undefined,
        displayName,
        avatarUrl: data.image_url ?? undefined,
      })
    } else if (type === 'user.deleted') {
      await ctx.runMutation(internal.users.deleteFromWebhook, {
        clerkId: data.id,
      })
    }

    return new Response('OK', { status: 200 })
  }),
})

export default http
