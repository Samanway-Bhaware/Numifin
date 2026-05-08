import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { ReportsClient } from "./ReportsClient";
import { computeMetrics, groupByMonth, groupByCategory } from "@/lib/finance";
import type { Transaction } from "@/lib/schema";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: txRaw } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user!.id)
    .order("date", { ascending: true });

  const transactions: Transaction[] = txRaw ?? [];
  const metrics = computeMetrics(transactions);
  const monthly = groupByMonth(transactions);
  const byCategory = groupByCategory(transactions);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Reports"
        subtitle="Financial analysis and trends"
      />
      <div className="flex-1 overflow-auto p-6">
        <ReportsClient
          metrics={metrics}
          monthly={monthly}
          byCategory={byCategory}
          transactions={transactions}
        />
      </div>
    </div>
  );
}
