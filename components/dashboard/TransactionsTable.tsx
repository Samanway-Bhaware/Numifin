"use client";

import { useState } from "react";
import {
  Edit2,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, classifyConfidenceLabel } from "@/lib/utils";
import type { Transaction } from "@/lib/schema";

interface ExplainabilityModalProps {
  transaction: Transaction;
  onClose: () => void;
}

function ExplainabilityModal({ transaction, onClose }: ExplainabilityModalProps) {
  const conf = transaction.confidence
    ? classifyConfidenceLabel(transaction.confidence)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#E1E1E1] bg-white p-6 shadow-xl animate-slide-up">
        <h3 className="text-lg font-bold text-gray-900 mb-1">AI Explanation</h3>
        <p className="text-sm text-gray-500 mb-4">{transaction.description}</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Category</span>
            <Badge variant="default">{transaction.category ?? "Uncategorized"}</Badge>
          </div>
          {conf && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Confidence</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${conf.color}`}>
                {conf.label} ({((transaction.confidence ?? 0) * 100).toFixed(0)}%)
              </span>
            </div>
          )}
          {transaction.reasoning && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Reasoning</p>
              <div className="rounded-lg bg-[#FAFAFA] border border-[#E1E1E1] p-3">
                <p className="text-sm text-gray-700 leading-relaxed">{transaction.reasoning}</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Amount</span>
            <span
              className={`font-semibold ${
                transaction.amount >= 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {transaction.amount >= 0 ? "+" : ""}
              {formatCurrency(transaction.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Source</span>
            <Badge variant="secondary">{transaction.source}</Badge>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

interface TransactionsTableProps {
  transactions: Transaction[];
  onClassify?: (id: string) => Promise<void>;
  onReconcile?: (id: string) => Promise<void>;
  onEditCategory?: (id: string, category: string) => Promise<void>;
  compact?: boolean;
}

const PAGE_SIZE = 20;

export function TransactionsTable({
  transactions,
  onClassify,
  onReconcile,
  onEditCategory,
  compact = false,
}: TransactionsTableProps) {
  const [page, setPage] = useState(0);
  const [explaining, setExplaining] = useState<Transaction | null>(null);
  const [classifyingId, setClassifyingId] = useState<string | null>(null);
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);
  const paged = transactions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  async function handleClassify(id: string) {
    if (!onClassify) return;
    setClassifyingId(id);
    await onClassify(id);
    setClassifyingId(null);
  }

  async function handleReconcile(id: string) {
    if (!onReconcile) return;
    setReconcilingId(id);
    await onReconcile(id);
    setReconcilingId(null);
  }

  async function handleEditSave(id: string) {
    if (!onEditCategory) return;
    await onEditCategory(id, editValue);
    setEditingId(null);
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 mb-3">
          <RefreshCw className="h-7 w-7 text-gray-300" />
        </div>
        <p className="font-medium text-gray-500">No transactions yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Upload a CSV file to import your first transactions
        </p>
      </div>
    );
  }

  return (
    <>
      {explaining && (
        <ExplainabilityModal
          transaction={explaining}
          onClose={() => setExplaining(null)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E1E1E1]">
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Date
              </th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Description
              </th>
              <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Amount
              </th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Category
              </th>
              {!compact && (
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Confidence
                </th>
              )}
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Source
              </th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E1E1]/60">
            {paged.map((t) => {
              const conf = t.confidence ? classifyConfidenceLabel(t.confidence) : null;

              return (
                <tr
                  key={t.id}
                  className={`group hover:bg-gray-50 transition-colors ${
                    t.flagged ? "bg-amber-50/50" : ""
                  }`}
                >
                  <td className="py-3 px-3 text-gray-500 whitespace-nowrap text-xs">
                    {formatDate(t.date)}
                  </td>
                  <td className="py-3 px-3 max-w-[200px]">
                    <p className="text-gray-900 truncate">{t.description}</p>
                    {t.vendor && (
                      <p className="text-xs text-gray-400 truncate">{t.vendor}</p>
                    )}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-semibold whitespace-nowrap ${
                      t.amount >= 0 ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {t.amount >= 0 ? "+" : ""}
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="py-3 px-3">
                    {editingId === t.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave(t.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                          className="h-6 w-28 rounded-md border border-[#3C366B] px-1.5 text-xs focus:outline-none"
                        />
                        <button
                          onClick={() => handleEditSave(t.id)}
                          className="text-xs text-[#3C366B] font-medium hover:underline"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <Badge variant={t.category ? "default" : "outline"}>
                        {t.category ?? "Uncategorized"}
                      </Badge>
                    )}
                  </td>
                  {!compact && (
                    <td className="py-3 px-3">
                      {conf ? (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${conf.color}`}
                        >
                          {conf.label}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  )}
                  <td className="py-3 px-3">
                    <Badge variant="secondary" className="text-[10px]">
                      {t.source}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEditCategory && (
                        <button
                          onClick={() => {
                            setEditingId(t.id);
                            setEditValue(t.category ?? "");
                          }}
                          className="p-1 rounded hover:bg-[#EAE6F7] text-gray-400 hover:text-[#3C366B] transition-colors"
                          title="Edit category"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setExplaining(t)}
                        className="p-1 rounded hover:bg-[#EAE6F7] text-gray-400 hover:text-[#3C366B] transition-colors"
                        title="Explain"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                      </button>
                      {onClassify && (
                        <button
                          onClick={() => handleClassify(t.id)}
                          className="p-1 rounded hover:bg-[#EAE6F7] text-gray-400 hover:text-[#3C366B] transition-colors"
                          title="Re-classify"
                          disabled={classifyingId === t.id}
                        >
                          {classifyingId === t.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                      {onReconcile && !t.reconciled && (
                        <button
                          onClick={() => handleReconcile(t.id)}
                          className="p-1 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                          title="Mark reconciled"
                          disabled={reconcilingId === t.id}
                        >
                          {reconcilingId === t.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#E1E1E1]">
          <p className="text-xs text-gray-400">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, transactions.length)} of{" "}
            {transactions.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
