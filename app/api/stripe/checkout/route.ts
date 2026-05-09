import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLANS, type Plan } from "@/lib/stripe";
import { getUserSubscription } from "@/lib/subscription";

// GET /api/stripe/checkout?plan=pro|team
// Creates a Stripe Checkout Session and redirects the user to it.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const plan = request.nextUrl.searchParams.get("plan") as Plan | null;
  if (!plan || plan === "starter" || !PLANS[plan]) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const priceId = PLANS[plan].priceId;
  if (!priceId) {
    return NextResponse.json({ error: "Price not configured" }, { status: 500 });
  }

  const origin = request.nextUrl.origin;
  const sub = await getUserSubscription(user.id);

  // Reuse existing Stripe customer or create one
  let customerId = sub.stripe_customer_id ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?upgraded=${plan}`,
    cancel_url: `${origin}/dashboard/settings`,
    metadata: { user_id: user.id, plan },
    subscription_data: {
      metadata: { user_id: user.id, plan },
    },
  });

  return NextResponse.redirect(session.url!);
}
