"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Search, Bot, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CSVUpload } from "@/components/transactions/CSVUpload";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import type { Transaction, Category } from "@/lib/schema";

interface TransactionsPageClientProps {
  initialTransactions: Transaction[];
  categories: Category[];
  userId: string;
}

type FilterType = "all" | "uncategorized" | "unreconciled" | "flagged" | "income" | "expense";

export function TransactionsPageClient({
  initialTransactions,
  categories,
}: TransactionsPageClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [classifyingAll, setClassifyingAll] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const filtered = useMemo(() => {
    let result = transactions;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.vendor?.toLowerCase().includes(q)
      );
    }

    switch (filter) {
      case "uncategorized":
        result = result.filter((t) => !t.category);
        break;
      case "unreconciled":
        result = result.filter((t) => !t.reconciled);
        break;
      case "flagged":
        result = result.filter((t) => t.flagged);
        break;
      case "income":
        result = result.filter((t) => t.amount > 0);
        break;
      case "expense":
        result = result.filter((t) => t.amount < 0);
        break;
    }

    return result;
  }, [transactions, search, filter]);

  async function handleClassifyAll() {
    setClassifyingAll(true);
    try {
      const res = await fetch("/api/transactions/classify-all", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const { classified } = await res.json();
      toast.success(`Classified ${classified} transactions`);
      // Refresh
      const fresh = await fetch("/api/transactions").then((r) => r.json());
      setTransactions(fresh.transactions ?? []);
    } catch {
      toast.error("Classification failed");
    } finally {
      setClassifyingAll(false);
    }
  }

  async function handleReconcileAll() {
    const res = await fetch("/api/agents/reconcile", { method: "POST" });
    if (res.ok) {
      const { flagged } = await res.json();
      toast.success(
        flagged > 0
          ? `Flagged ${flagged} possible duplicates`
          : "No duplicates found — all clear!"
      );
      const fresh = await fetch("/api/transactions").then((r) => r.json());
      setTransactions(fresh.transactions ?? []);
    } else {
      toast.error("Reconciliation failed");
    }
  }

  async function handleClassify(id: string) {
    const res = await fetch(`/api/transactions/${id}/classify`, { method: "POST" });
    if (res.ok) {
      const { transaction } = await res.json();
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...transaction } : t)));
    } else {
      toast.error("Classification failed");
    }
  }

  async function handleReconcile(id: string) {
    const res = await fetch(`/api/transactions/${id}/reconcile`, { method: "POST" });
    if (res.ok) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, reconciled: true } : t))
      );
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
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Transaction deleted");
    }
  }

  function onUploaded(count: number) {
    fetch("/api/transactions")
      .then((r) => r.json())
      .then(({ transactions: fresh }) => {
        setTransactions(fresh ?? []);
      });
    setShowUpload(false);
    if (count > 0) {
      toast("Run Bookkeeper Agent to classify the new transactions", {
        action: {
          label: "Classify now",
          onClick: handleClassifyAll,
        },
      });
    }
  }

  const filterOptions: { key: FilterType; label: string; count?: number }[] = [
    { key: "all", label: "All", count: transactions.length },
    { key: "uncategorized", label: "Uncategorized", count: transactions.filter((t) => !t.category).length },
    { key: "unreconciled", label: "Unreconciled", count: transactions.filter((t) => !t.reconciled).length },
    { key: "flagged", label: "Flagged", count: transactions.filter((t) => t.flagged).length },
    { key: "income", label: "Income" },
    { key: "expense", label: "Expenses" },
  ];

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="default"
            size="sm"
            onClick={handleClassifyAll}
            loading={classifyingAll}
          >
            <Bot className="h-4 w-4" />
            Classify all
          </Button>
          <Button variant="outline" size="sm" onClick={handleReconcileAll}>
            <RefreshCw className="h-4 w-4" />
            Reconcile
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowUpload(!showUpload)}>
            <Plus className="h-4 w-4" />
            Import CSV
          </Button>
        </div>
        <div className="relative w-60">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none z-10" />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* CSV Upload panel */}
      {showUpload && (
        <div className="animate-slide-up">
          <CSVUpload onUploaded={onUploaded} />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all ${
              filter === opt.key
                ? "bg-[#3C366B] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0 text-[10px] font-bold ${
                  filter === opt.key ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#E1E1E1] bg-white shadow-[0_1px_3px_rgb(0_0_0/0.06)]">
        <div className="p-3">
          <TransactionsTable
            transactions={filtered}
            onClassify={handleClassify}
            onReconcile={handleReconcile}
            onEditCategory={handleEditCategory}
          />
        </div>
      </div>

      {/* Category legend */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-xs text-gray-500">{cat.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
