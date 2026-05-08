import { chatWithCFO } from "../ai";
import { buildCFOPrompt } from "../prompts";
import { computeMetrics, groupByCategory } from "../finance";
import type { Transaction } from "../schema";

// ============================================================
// CFO Agent — natural language financial Q&A
// ============================================================

export async function askCFO(
  question: string,
  transactions: Transaction[],
  options: { apiKey?: string; model?: string } = {}
): Promise<string> {
  const metrics = computeMetrics(transactions);
  const topCategories = groupByCategory(transactions).slice(0, 10);

  const prompt = buildCFOPrompt(question, {
    metrics: {
      cashBalance: metrics.cashBalance,
      totalRevenue: metrics.totalRevenue,
      totalExpenses: metrics.totalExpenses,
      netCashFlow: metrics.netCashFlow,
      burnRate: metrics.burnRate,
      runway: metrics.runway,
      unreconciledCount: metrics.unreconciledCount,
      categorizedPercent: `${(metrics.categorizedPercent * 100).toFixed(1)}%`,
    },
    recentTransactions: transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map((t) => ({
        date: t.date,
        description: t.description,
        amount: t.amount,
        category: t.category,
      })),
    topCategories,
  });

  return chatWithCFO(prompt, options);
}
