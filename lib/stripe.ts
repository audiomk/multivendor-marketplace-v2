import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Update this to match the version the error is requesting
  apiVersion: '2025-02-24.acacia', 
  typescript: true,
})