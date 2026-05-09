import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserConfig } from "@/lib/user-config";
import { askCFO } from "@/lib/agents/cfo";
import type { Transaction } from "@/lib/schema";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const [config, txRes] = await Promise.all([
    getUserConfig(user.id),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(300),
  ]);

  const transactions: Transaction[] = txRes.data ?? [];

  const response = await askCFO(query, transactions, {
    apiKey: config?.apiKey ?? undefined,
    model: config?.model,
  });

  // Log CFO activity
  await supabase.from("agent_activities").insert({
    user_id: user.id,
    agent: "cfo",
    action: `CFO answered: "${query.slice(0, 60)}${query.length > 60 ? "..." : ""}"`,
    status: "done",
    metadata: { query, responseLength: response.length },
  });

  return NextResponse.json({ response });
}
