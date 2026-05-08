import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { AgentsClient } from "./AgentsClient";
import type { AgentActivity } from "@/lib/schema";

export const metadata = { title: "Agents" };

export default async function AgentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: activitiesRaw } = await supabase
    .from("agent_activities")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const activities: AgentActivity[] = activitiesRaw ?? [];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="AI Agents"
        subtitle="Your autonomous finance team — monitor, trigger, and review"
      />
      <div className="flex-1 overflow-auto p-6">
        <AgentsClient activities={activities} />
      </div>
    </div>
  );
}
