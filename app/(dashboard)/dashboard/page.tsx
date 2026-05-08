import { createClient } from "@/lib/supabase/server";
import { computeMetrics } from "@/lib/finance";
import { Header } from "@/components/layout/Header";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { AgentActivityFeed } from "@/components/dashboard/AgentActivityFeed";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { DashboardClient } from "./DashboardClient";
import type { Transaction, AgentActivity, FinancialMetrics } from "@/lib/schema";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch transactions
  const { data: txRaw } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user!.id)
    .order("date", { ascending: false })
    .limit(200);

  const transactions: Transaction[] = txRaw ?? [];

  // Fetch agent activity
  const { data: activitiesRaw } = await supabase
    .from("agent_activities")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const activities: AgentActivity[] = activitiesRaw ?? [];

  // Compute metrics deterministically
  const metrics: FinancialMetrics = computeMetrics(transactions);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        subtitle="Financial overview — powered by your AI agents"
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Summary cards */}
        <section className="mb-6">
          <SummaryCards metrics={metrics} />
        </section>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          {/* Left: Transactions + Command Bar */}
          <div className="space-y-6">
            {/* Recent transactions */}
            <div className="rounded-xl border border-[#E1E1E1] bg-white shadow-[0_1px_3px_rgb(0_0_0/0.06)]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E1E1E1]">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Recent Transactions
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {transactions.length} total transactions
                  </p>
                </div>
              </div>
              <div className="p-2">
                <DashboardClient
                  transactions={transactions.slice(0, 50)}
                  userId={user!.id}
                />
              </div>
            </div>
          </div>

          {/* Right: Insights + Activity Feed */}
          <div className="space-y-5">
            {/* Insights */}
            <div className="rounded-xl border border-[#E1E1E1] bg-white shadow-[0_1px_3px_rgb(0_0_0/0.06)]">
              <div className="px-5 py-4 border-b border-[#E1E1E1]">
                <h2 className="text-base font-semibold text-gray-900">Insights</h2>
              </div>
              <div className="p-4">
                <InsightsPanel metrics={metrics} transactions={transactions} />
              </div>
            </div>

            {/* Agent Activity Feed */}
            <div className="rounded-xl border border-[#E1E1E1] bg-white shadow-[0_1px_3px_rgb(0_0_0/0.06)]">
              <div className="px-5 py-4 border-b border-[#E1E1E1]">
                <h2 className="text-base font-semibold text-gray-900">
                  Agent Activity
                </h2>
              </div>
              <div className="p-3">
                <AgentActivityFeed activities={activities} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
