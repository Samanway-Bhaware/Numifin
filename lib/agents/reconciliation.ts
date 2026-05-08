import { callLLM } from "../ai";
import { buildReconciliationPrompt } from "../prompts";
import type { Transaction } from "../schema";

// ============================================================
// Reconciliation Agent
// Detects duplicates and matches transactions to documents
// ============================================================

export interface ReconciliationMatch {
  transactionId: string;
  matchedId: string | null;
  confidence: number;
  reasoning: string;
}

export interface DuplicateGroup {
  transactions: Transaction[];
  reason: string;
}

export function detectDuplicates(transactions: Transaction[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const checked = new Set<string>();

  for (let i = 0; i < transactions.length; i++) {
    if (checked.has(transactions[i].id)) continue;

    const t = transactions[i];
    const dupes: Transaction[] = [];

    for (let j = i + 1; j < transactions.length; j++) {
      const other = transactions[j];
      if (checked.has(other.id)) continue;

      // Same amount, same date (within 2 days), similar description
      const dateDiff = Math.abs(
        new Date(t.date).getTime() - new Date(other.date).getTime()
      );
      const daysDiff = dateDiff / (1000 * 60 * 60 * 24);

      if (
        Math.abs(t.amount - other.amount) < 0.01 &&
        daysDiff <= 2 &&
        similarity(t.description, other.description) > 0.7
      ) {
        dupes.push(other);
        checked.add(other.id);
      }
    }

    if (dupes.length > 0) {
      checked.add(t.id);
      groups.push({
        transactions: [t, ...dupes],
        reason: `${dupes.length + 1} transactions with same amount ($${Math.abs(t.amount).toFixed(2)}) within 2 days`,
      });
    }
  }

  return groups;
}

export async function matchReference(
  reference: { date: string; amount: number; description: string },
  candidates: Transaction[],
  options: { apiKey?: string; model?: string } = {}
): Promise<ReconciliationMatch | null> {
  if (candidates.length === 0) return null;

  const prompt = buildReconciliationPrompt(
    candidates.map((t) => ({
      id: t.id,
      date: t.date,
      amount: t.amount,
      description: t.description,
    })),
    reference
  );

  try {
    const raw = await callLLM(prompt, { ...options, maxTokens: 200 });
    const parsed = JSON.parse(raw);

    return {
      transactionId: candidates[0].id,
      matchedId: parsed.matched_id ?? null,
      confidence: parsed.confidence ?? 0,
      reasoning: parsed.reasoning ?? "",
    };
  } catch {
    return null;
  }
}

// Simple string similarity (Dice coefficient)
function similarity(a: string, b: string): number {
  const aBigrams = getBigrams(a.toLowerCase());
  const bBigrams = getBigrams(b.toLowerCase());
  const intersection = new Set([...aBigrams].filter((x) => bBigrams.has(x)));
  return (2 * intersection.size) / (aBigrams.size + bBigrams.size);
}

function getBigrams(str: string): Set<string> {
  const bigrams = new Set<string>();
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.add(str.slice(i, i + 2));
  }
  return bigrams;
}
