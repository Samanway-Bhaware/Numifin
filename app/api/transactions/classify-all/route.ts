import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserConfig } from "@/lib/user-config";
import { classifyTransactions } from "@/lib/agents/bookkeeper";
import type { Transaction, UserPrompt, Category } from "@/lib/schema";

// POST /api/transactions/classify-all — runs bookkeeper agent on all unclassified
export async function POST(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch unclassified transactions
  const { data: txRaw } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .is("category", null);

  const transactions: Transaction[] = txRaw ?? [];
  if (transactions.length === 0) {
    return NextResponse.json({ message: "No unclassified transactions", count: 0 });
  }

  const [config, promptsRes, categoriesRes] = await Promise.all([
    getUserConfig(user.id),
    supabase.from("user_prompts").select("*").eq("user_id", user.id).eq("is_active", true),
    supabase.from("categories").select("*").eq("user_id", user.id),
  ]);

  const userPrompts: UserPrompt[] = promptsRes.data ?? [];
  const categories: Category[] = categoriesRes.data ?? [];

  // Log start
  const { data: activityRow } = await supabase
    .from("agent_activities")
    .insert({
      user_id: user.id,
      agent: "bookkeeper",
      action: `Classifying ${transactions.length} transactions...`,
      status: "running",
      metadata: { count: transactions.length },
    })
    .select()
    .single();

  // Run agent
  const results = await classifyTransactions(transactions, userPrompts, categories, {
    apiKey: config?.apiKey,
    model: config?.model,
  });

  // Batch update
  const updates = Array.from(results.entries()).map(([id, result]) => ({
    id,
    category: result.category,
    confidence: result.confidence,
    reasoning: result.reasoning,
    updated_at: new Date().toISOString(),
  }));

  for (const upd of updates) {
    await supabase
      .from("transactions")
      .update({
        category: upd.category,
        confidence: upd.confidence,
        reasoning: upd.reasoning,
        updated_at: upd.updated_at,
      })
      .eq("id", upd.id)
      .eq("user_id", user.id);
  }

  // Update activity log
  if (activityRow) {
    await supabase
      .from("agent_activities")
      .update({
        action: `Bookkeeper Agent classified ${updates.length} transactions`,
        status: "done",
        metadata: { count: updates.length },
      })
      .eq("id", activityRow.id);
  }

  return NextResponse.json({ classified: updates.length, results: Object.fromEntries(results) });
}
