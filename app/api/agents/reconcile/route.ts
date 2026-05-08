import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectDuplicates } from "@/lib/agents/reconciliation";
import type { Transaction } from "@/lib/schema";

export async function POST(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: txRaw } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(500);

  const transactions: Transaction[] = txRaw ?? [];

  // Log start
  const { data: activityRow } = await supabase
    .from("agent_activities")
    .insert({
      user_id: user.id,
      agent: "reconciliation",
      action: `Scanning ${transactions.length} transactions for duplicates...`,
      status: "running",
      metadata: {},
    })
    .select()
    .single();

  const duplicateGroups = detectDuplicates(transactions);

  // Flag duplicates (all but the first in each group)
  let flaggedCount = 0;
  for (const group of duplicateGroups) {
    const toFlag = group.transactions.slice(1);
    for (const t of toFlag) {
      await supabase
        .from("transactions")
        .update({ flagged: true, updated_at: new Date().toISOString() })
        .eq("id", t.id)
        .eq("user_id", user.id);
      flaggedCount++;
    }
  }

  // Update activity
  if (activityRow) {
    await supabase
      .from("agent_activities")
      .update({
        action: `Reconciliation Agent flagged ${flaggedCount} possible duplicate transactions`,
        status: "done",
        metadata: { groups: duplicateGroups.length, flagged: flaggedCount },
      })
      .eq("id", activityRow.id);
  }

  return NextResponse.json({
    groups: duplicateGroups.length,
    flagged: flaggedCount,
    details: duplicateGroups.map((g) => ({
      reason: g.reason,
      ids: g.transactions.map((t) => t.id),
    })),
  });
}
