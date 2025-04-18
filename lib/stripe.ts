import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing in environment variables");
}

export const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil'
});