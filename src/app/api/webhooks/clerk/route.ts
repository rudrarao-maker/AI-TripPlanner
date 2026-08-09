import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { Resend } from 'resend'
import { db } from '@/db'
import { users } from '@/db/schema'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!SIGNING_SECRET) {
    return new Response('Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env', {
      status: 500,
    })
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  try {
    const wh = new Webhook(SIGNING_SECRET)
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    const email = email_addresses[0]?.email_address
    const fullName = `${first_name || ''} ${last_name || ''}`.trim() || 'Traveler'

    // Insert user into local DB
    if (email) {
      try {
        await db.insert(users).values({
          clerkId: id,
          email,
          name: fullName,
          avatar: image_url,
        }).onConflictDoNothing({ target: users.email })
      } catch (dbError) {
        console.error('Failed to sync user to database:', dbError)
        return new Response('Error: Database sync failed, retrying later', { status: 500 })
      }
    }

    if (email && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder') {
      try {
        await resend.emails.send({
          from: 'TripCraft AI <welcome@yourdomain.com>',
          to: [email],
          subject: 'Welcome to TripCraft AI!',
          html: `<p>Hi ${first_name || 'Traveler'},</p><p>Welcome to TripCraft AI! Start planning your dream trip today.</p>`,
        })
      } catch (error) {
        console.error('Failed to send welcome email:', error)
      }
    }
  }

  return new Response('Webhook received', { status: 200 })
}
