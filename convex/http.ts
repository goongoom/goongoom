import { httpRouter } from "convex/server"
import { Webhook } from "svix"
import { internal } from "./_generated/api"
import { httpAction } from "./_generated/server"

const http = httpRouter()

http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET not configured")
      return new Response("Server configuration error", { status: 500 })
    }

    const svixId = request.headers.get("svix-id")
    const svixTimestamp = request.headers.get("svix-timestamp")
    const svixSignature = request.headers.get("svix-signature")

    if (!(svixId && svixTimestamp && svixSignature)) {
      return new Response("Missing svix headers", { status: 400 })
    }

    const body = await request.text()

    const wh = new Webhook(webhookSecret)
    let evt: {
      type: string
      data: { id: string }
    }

    try {
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as typeof evt
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return new Response("Invalid signature", { status: 400 })
    }

    const { type, data } = evt

    if (type === "user.created") {
      await ctx.runMutation(internal.users.createFromWebhook, {
        clerkId: data.id,
      })
    } else if (type === "user.deleted") {
      await ctx.runMutation(internal.users.deleteFromWebhook, {
        clerkId: data.id,
      })
    }

    return new Response("OK", { status: 200 })
  }),
})

export default http
