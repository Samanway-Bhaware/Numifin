import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserConfig } from "@/lib/user-config";
import { classifySingle } from "@/lib/agents/bookkeeper";
import type { Transaction, UserPrompt, Category } from "@/lib/schema";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Fetch transaction
  const { data: transaction } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single<Transaction>();

  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fetch user config and prompts/categories
  const [config, promptsRes, categoriesRes] = await Promise.all([
    getUserConfig(user.id),
    supabase.from("user_prompts").select("*").eq("user_id", user.id).eq("is_active", true),
    supabase.from("categories").select("*").eq("user_id", user.id),
  ]);

  const userPrompts: UserPrompt[] = promptsRes.data ?? [];
  const categories: Category[] = categoriesRes.data ?? [];

  // Run bookkeeper agent
  const result = await classifySingle(transaction, userPrompts, categories, {
    apiKey: config?.apiKey ?? undefined,
    model: config?.model,
  });

  // Save result
  const { data: updated, error } = await supabase
    .from("transactions")
    .update({
      category: result.category,
      confidence: result.confidence,
      reasoning: result.reasoning,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log agent activity
  await supabase.from("agent_activities").insert({
    user_id: user.id,
    agent: "bookkeeper",
    action: `Classified "${transaction.description}" → ${result.category} (${(result.confidence * 100).toFixed(0)}% confidence)`,
    status: "done",
    metadata: { transactionId: id, result },
  });

  return NextResponse.json({ transaction: updated, result });
}
