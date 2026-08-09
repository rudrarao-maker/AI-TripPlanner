import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    let event: Stripe.Event;

    // Verify webhook signature if secret is provided, otherwise just construct the event
    // For local dev without webhook secret, we might skip signature validation, but it's dangerous in prod
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      console.warn("⚠️ No STRIPE_WEBHOOK_SECRET found, parsing event without verification. DO NOT DO THIS IN PRODUCTION.");
      event = JSON.parse(body) as Stripe.Event;
    }

    const session = event.data.object as Stripe.Checkout.Session;

    switch (event.type) {
      case 'checkout.session.completed':
        if (session.mode === 'subscription' && session.client_reference_id) {
          const userId = session.client_reference_id;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          await db.update(users)
            .set({
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: 'active',
              planType: 'pro', // In a real app, infer this from session.line_items or metadata
              updatedAt: new Date(),
            })
            .where(eq(users.clerkId, userId));
          
          console.log(`✅ Subscription created for user ${userId}`);
        }
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        // In this case, client_reference_id isn't directly on the subscription object.
        // We look up the user by stripeCustomerId.
        await db.update(users)
          .set({
            subscriptionStatus: subscription.status,
            updatedAt: new Date(),
          })
          .where(eq(users.stripeCustomerId, subscription.customer as string));
        
        console.log(`🔄 Subscription ${subscription.id} status updated to ${subscription.status}`);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
