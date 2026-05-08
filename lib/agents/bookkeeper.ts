import { classifyTransaction } from "../ai";
import { buildBookkeeperPrompt } from "../prompts";
import type { Transaction, UserPrompt, Category, ClassificationResult } from "../schema";

// ============================================================
// Bookkeeper Agent
// Classifies transactions with priority: user rules > categories > model
// ============================================================

export async function classifyTransactions(
  transactions: Transaction[],
  userPrompts: UserPrompt[],
  categories: Category[],
  options: { apiKey?: string; model?: string } = {}
): Promise<Map<string, ClassificationResult>> {
  const results = new Map<string, ClassificationResult>();

  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (transaction) => {
        // First: check if user rules already match deterministically
        const ruleMatch = checkUserRules(transaction, userPrompts, categories);
        if (ruleMatch) {
          results.set(transaction.id, ruleMatch);
          return;
        }

        // Fall back to AI classification
        const prompt = buildBookkeeperPrompt(transaction, userPrompts, categories);
        const result = await classifyTransaction(prompt, options);
        results.set(transaction.id, result);
      })
    );
  }

  return results;
}

function checkUserRules(
  transaction: Transaction,
  userPrompts: UserPrompt[],
  categories: Category[]
): ClassificationResult | null {
  const desc = transaction.description.toLowerCase();
  const vendor = (transaction.vendor ?? "").toLowerCase();

  for (const prompt of userPrompts.filter((p) => p.is_active)) {
    // Simple keyword matching from prompt text
    // Format: "keyword → Category"
    const match = prompt.prompt_text.match(/(.+?)\s*(?:→|->|=>)\s*(.+)/);
    if (match) {
      const keyword = match[1].trim().toLowerCase();
      const category = match[2].trim();
      if (desc.includes(keyword) || vendor.includes(keyword)) {
        // Verify category exists if we have custom categories
        const categoryExists =
          categories.length === 0 ||
          categories.some((c) => c.name.toLowerCase() === category.toLowerCase());

        if (categoryExists || categories.length === 0) {
          return {
            category,
            confidence: 1.0,
            reasoning: `Matched user rule: "${prompt.prompt_text}"`,
            source: "user_rule",
          };
        }
      }
    }
  }

  return null;
}

export async function classifySingle(
  transaction: Transaction,
  userPrompts: UserPrompt[],
  categories: Category[],
  options: { apiKey?: string; model?: string } = {}
): Promise<ClassificationResult> {
  // Check rules first
  const ruleMatch = checkUserRules(transaction, userPrompts, categories);
  if (ruleMatch) return ruleMatch;

  const prompt = buildBookkeeperPrompt(transaction, userPrompts, categories);
  return classifyTransaction(prompt, options);
}
