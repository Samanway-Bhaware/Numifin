import { createClient } from "@/lib/supabase/server";
import type { Plan } from "@/lib/stripe";

export interface Subscription {
  plan: Plan;
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
}

export async function getUserSubscription(userId: string): Promise<Subscription> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status, stripe_customer_id, stripe_subscription_id, current_period_end")
    .eq("user_id", userId)
    .single();

  if (!data) {
    return {
      plan: "starter",
      status: "active",
      stripe_customer_id: null,
      stripe_subscription_id: null,
      current_period_end: null,
    };
  }

  return data as Subscription;
}

export function isPlanActive(sub: Subscription): boolean {
  return sub.status === "active" || sub.status === "trialing";
}
