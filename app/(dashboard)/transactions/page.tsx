import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { TransactionsPageClient } from "./TransactionsPageClient";
import type { Transaction, Category } from "@/lib/schema";

export const metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [txRes, catRes] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user!.id)
      .order("date", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user!.id)
      .order("name"),
  ]);

  const transactions: Transaction[] = txRes.data ?? [];
  const categories: Category[] = catRes.data ?? [];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Transactions"
        subtitle={`${transactions.length} total · ${transactions.filter((t) => !t.category).length} uncategorized`}
      />
      <div className="flex-1 overflow-auto p-6">
        <TransactionsPageClient
          initialTransactions={transactions}
          categories={categories}
          userId={user!.id}
        />
      </div>
    </div>
  );
}
