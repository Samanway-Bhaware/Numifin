import type { Transaction, FinancialMetrics, MonthlyData } from "./schema";

// ============================================================
// Deterministic financial calculations — no LLM involvement
// ============================================================

export function computeMetrics(
  transactions: Transaction[],
  cashBalance?: number
): FinancialMetrics {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const recent = transactions.filter(
    (t) => new Date(t.date) >= sixMonthsAgo
  );

  const totalRevenue = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netCashFlow = totalRevenue - totalExpenses;

  // Monthly burn rate: average monthly expense over last 6 months
  const recentExpenses = recent
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const burnRate = recentExpenses / 6;

  const balance = cashBalance ?? netCashFlow;
  const runway = burnRate > 0 ? Math.floor(balance / burnRate) : null;

  const unreconciledCount = transactions.filter((t) => !t.reconciled).length;

  const categorizedCount = transactions.filter((t) => t.category !== null).length;
  const categorizedPercent =
    transactions.length > 0 ? categorizedCount / transactions.length : 0;

  return {
    totalRevenue,
    totalExpenses,
    netCashFlow,
    burnRate,
    runway,
    cashBalance: balance,
    unreconciledCount,
    categorizedPercent,
  };
}

export function groupByMonth(transactions: Transaction[]): MonthlyData[] {
  const map = new Map<string, { revenue: number; expenses: number }>();

  for (const t of transactions) {
    const key = t.date.slice(0, 7); // "YYYY-MM"
    const existing = map.get(key) ?? { revenue: 0, expenses: 0 };
    if (t.amount > 0) {
      existing.revenue += t.amount;
    } else {
      existing.expenses += Math.abs(t.amount);
    }
    map.set(key, existing);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expenses: data.expenses,
      net: data.revenue - data.expenses,
    }));
}

export function groupByCategory(
  transactions: Transaction[]
): Array<{ category: string; total: number; count: number }> {
  const map = new Map<string, { total: number; count: number }>();

  for (const t of transactions.filter((t) => t.amount < 0)) {
    const cat = t.category ?? "Uncategorized";
    const existing = map.get(cat) ?? { total: 0, count: 0 };
    existing.total += Math.abs(t.amount);
    existing.count += 1;
    map.set(cat, existing);
  }

  return Array.from(map.entries())
    .sort(([, a], [, b]) => b.total - a.total)
    .map(([category, data]) => ({ category, ...data }));
}

export function detectAnomalies(
  transactions: Transaction[]
): Array<{ transaction: Transaction; reason: string }> {
  const anomalies: Array<{ transaction: Transaction; reason: string }> = [];

  // Detect large transactions (> 2x average)
  const amounts = transactions
    .filter((t) => t.amount < 0)
    .map((t) => Math.abs(t.amount));
  const avg = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;

  for (const t of transactions) {
    if (t.amount < 0 && Math.abs(t.amount) > avg * 3 && avg > 0) {
      anomalies.push({
        transaction: t,
        reason: `Unusually large expense: ${(Math.abs(t.amount) / avg).toFixed(1)}x the average`,
      });
    }
  }

  // Detect possible duplicates
  const seen = new Map<string, Transaction>();
  for (const t of transactions) {
    const key = `${t.date}:${t.amount}:${t.description.slice(0, 20)}`;
    if (seen.has(key)) {
      anomalies.push({
        transaction: t,
        reason: `Possible duplicate of transaction on ${t.date} for the same amount`,
      });
    } else {
      seen.set(key, t);
    }
  }

  return anomalies;
}
