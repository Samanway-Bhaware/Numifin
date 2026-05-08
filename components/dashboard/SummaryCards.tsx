"use client";

import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Flame,
  Clock,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { FinancialMetrics } from "@/lib/schema";

const cards = [
  {
    key: "cashBalance",
    label: "Cash Balance",
    icon: Wallet,
    color: "text-[#3C366B]",
    format: (v: number) => formatCurrency(v),
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
    icon: TrendingUp,
    color: "text-green-600",
    format: (v: number) => formatCurrency(v),
  },
  {
    key: "totalExpenses",
    label: "Total Expenses",
    icon: TrendingDown,
    color: "text-red-500",
    format: (v: number) => formatCurrency(v),
  },
  {
    key: "burnRate",
    label: "Burn Rate",
    icon: Flame,
    color: "text-orange-500",
    format: (v: number) => `${formatCurrency(v)}/mo`,
  },
  {
    key: "runway",
    label: "Runway",
    icon: Clock,
    color: "text-blue-600",
    format: (v: number | null) => (v !== null ? `${v} months` : "N/A"),
  },
  {
    key: "unreconciledCount",
    label: "Unreconciled",
    icon: AlertCircle,
    color: "text-amber-500",
    format: (v: number) => `${v} items`,
  },
] as const;

interface SummaryCardsProps {
  metrics: FinancialMetrics;
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map((card, index) => {
        const value = metrics[card.key as keyof FinancialMetrics] as number | null;
        const formatted = card.format(value as never);
        const delayClass = `delay-${Math.min(index + 1, 6)}` as const;

        return (
          <div
            key={card.key}
            className={`rounded-xl border border-[#E1E1E1] bg-white px-5 py-4 shadow-[0_1px_3px_rgb(0_0_0/0.06)] hover:shadow-[0_4px_12px_rgb(0_0_0/0.08)] transition-[box-shadow] duration-200 animate-enter ${delayClass}`}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <card.icon className={`h-3.5 w-3.5 shrink-0 ${card.color}`} />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{card.label}</p>
            </div>
            <p className="text-xl font-semibold tabular-nums text-gray-900">{formatted}</p>
          </div>
        );
      })}
    </div>
  );
}
