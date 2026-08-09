const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use a valid version or remove to use default
});

async function setup() {
  try {
    console.log("Creating Pro Product...");
    const proProduct = await stripe.products.create({
      name: 'Pro Traveler',
      description: 'The ultimate tool for frequent travelers.',
    });

    console.log("Creating Pro Price...");
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 1200, // $12.00
      currency: 'usd',
      recurring: { interval: 'month' },
    });

    console.log("Creating Premium Product...");
    const premiumProduct = await stripe.products.create({
      name: 'Wanderlust Plus',
      description: 'Best value for yearly adventurers.',
    });

    console.log("Creating Premium Price...");
    const premiumPrice = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 9900, // $99.00
      currency: 'usd',
      recurring: { interval: 'year' },
    });

    console.log("\n--- SUCCESS ---");
    console.log(`PRO_PRICE_ID=${proPrice.id}`);
    console.log(`PREMIUM_PRICE_ID=${premiumPrice.id}`);
  } catch (error) {
    console.error("Error setting up Stripe:", error.message);
  }
}

setup();
