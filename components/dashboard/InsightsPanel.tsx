"use client";

import {
  AlertTriangle,
  Info,
  TrendingDown,
  Tags,
  CheckCircle2,
} from "lucide-react";
import type { Transaction, FinancialMetrics } from "@/lib/schema";
import { formatCurrency } from "@/lib/utils";
import { detectAnomalies } from "@/lib/finance";

interface Insight {
  type: "warning" | "info" | "success" | "alert";
  icon: React.ElementType;
  title: string;
  description: string;
}

function buildInsights(metrics: FinancialMetrics, transactions: Transaction[]): Insight[] {
  const insights: Insight[] = [];

  // Runway warning
  if (metrics.runway !== null && metrics.runway < 3) {
    insights.push({
      type: "alert",
      icon: AlertTriangle,
      title: "Low runway",
      description: `You have only ${metrics.runway} months of runway at the current burn rate.`,
    });
  } else if (metrics.runway !== null && metrics.runway < 6) {
    insights.push({
      type: "warning",
      icon: TrendingDown,
      title: "Runway below 6 months",
      description: `${metrics.runway} months remaining. Consider reducing expenses or raising revenue.`,
    });
  }

  // Uncategorized transactions
  const uncategorized = transactions.filter((t) => !t.category).length;
  if (uncategorized > 0) {
    insights.push({
      type: "info",
      icon: Tags,
      title: `${uncategorized} uncategorized transactions`,
      description: "Run the Bookkeeper Agent to auto-classify them with AI.",
    });
  }

  // Unreconciled items
  if (metrics.unreconciledCount > 10) {
    insights.push({
      type: "warning",
      icon: AlertTriangle,
      title: `${metrics.unreconciledCount} unreconciled items`,
      description: "Use the Reconciliation Agent to match transactions to documents.",
    });
  }

  // Anomalies
  const anomalies = detectAnomalies(transactions);
  if (anomalies.length > 0) {
    insights.push({
      type: "alert",
      icon: AlertTriangle,
      title: `${anomalies.length} anomalies detected`,
      description: anomalies[0].reason,
    });
  }

  // Healthy state
  if (
    metrics.runway !== null &&
    metrics.runway >= 6 &&
    uncategorized === 0 &&
    metrics.unreconciledCount === 0 &&
    anomalies.length === 0
  ) {
    insights.push({
      type: "success",
      icon: CheckCircle2,
      title: "Finances look healthy",
      description: "All transactions categorized, reconciled, and no anomalies detected.",
    });
  }

  // Burn rate insight
  if (metrics.burnRate > 0) {
    insights.push({
      type: "info",
      icon: Info,
      title: "Monthly burn rate",
      description: `You're spending ${formatCurrency(metrics.burnRate)} per month on average (last 6 months).`,
    });
  }

  return insights;
}

interface InsightsPanelProps {
  metrics: FinancialMetrics;
  transactions: Transaction[];
}

const insightStyles = {
  alert: "border-red-200 bg-red-50",
  warning: "border-amber-200 bg-amber-50",
  info: "border-blue-200 bg-blue-50",
  success: "border-green-200 bg-green-50",
};

const iconStyles = {
  alert: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
  success: "text-green-500",
};

export function InsightsPanel({ metrics, transactions }: InsightsPanelProps) {
  const insights = buildInsights(metrics, transactions);

  if (insights.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-center">
        <p className="text-sm text-gray-400">No insights available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {insights.map((insight, i) => (
        <div
          key={i}
          className={`flex gap-3 rounded-xl border p-3.5 ${insightStyles[insight.type]}`}
        >
          <insight.icon
            className={`h-4 w-4 mt-0.5 shrink-0 ${iconStyles[insight.type]}`}
          />
          <div>
            <p className="text-sm font-medium text-gray-900">{insight.title}</p>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              {insight.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
