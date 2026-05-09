import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia" as Stripe.LatestApiVersion,
});

export const PLANS = {
  starter: {
    name: "Starter",
    price: 0,
    priceId: null,
    features: ["500 transactions/month", "AI categorization"],
  },
  pro: {
    name: "Pro",
    price: 49,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: ["5,000 transactions/month", "All AI agents", "Reconciliation", "CFO chat"],
  },
  team: {
    name: "Team",
    price: 149,
    priceId: process.env.STRIPE_TEAM_PRICE_ID!,
    features: ["Unlimited transactions", "All Pro features", "Multi-user", "Integrations", "Priority support"],
  },
} as const;

export type Plan = keyof typeof PLANS;
