"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { CommandBar } from "@/components/dashboard/CommandBar";
import type { Transaction } from "@/lib/schema";

interface DashboardClientProps {
  transactions: Transaction[];
  userId: string;
}

export function DashboardClient({ transactions: initial, userId }: DashboardClientProps) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>(initial);
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/transactions?limit=50`);
      if (res.ok) {
        const { transactions: fresh } = await res.json();
        setTransactions(fresh ?? []);
        router.refresh();
      }
    } finally {
      setRefreshing(false);
    }
  }

  async function handleClassify(id: string) {
    const res = await fetch(`/api/transactions/${id}/classify`, {
      method: "POST",
    });
    if (res.ok) {
      const { transaction } = await res.json();
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...transaction } : t))
      );
      toast.success("Transaction classified");
    } else {
      toast.error("Classification failed");
    }
  }

  async function handleReconcile(id: string) {
    const res = await fetch(`/api/transactions/${id}/reconcile`, {
      method: "POST",
    });
    if (res.ok) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, reconciled: true } : t))
      );
      toast.success("Marked as reconciled");
    } else {
      toast.error("Failed to reconcile");
    }
  }

  async function handleEditCategory(id: string, category: string) {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });
    if (res.ok) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, category } : t))
      );
      toast.success("Category updated");
    } else {
      toast.error("Failed to update");
    }
  }

  async function handleCFOQuery(query: string): Promise<string> {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (res.ok) {
      const { response } = await res.json();
      return response;
    }
    return "Sorry, I couldn't answer that right now.";
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end px-3 pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          loading={refreshing}
          className="text-xs text-gray-400 hover:text-gray-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>
      <TransactionsTable
        transactions={transactions}
        onClassify={handleClassify}
        onReconcile={handleReconcile}
        onEditCategory={handleEditCategory}
        compact
      />
      <div className="px-3 pb-3">
        <CommandBar onSubmit={handleCFOQuery} />
      </div>
    </div>
  );
}
