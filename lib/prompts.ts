import type { Transaction, UserPrompt, Category } from "./schema";

// ============================================================
// Prompt assembly for AI agents
// Priority: user rules > custom categories > model inference
// ============================================================

export function buildBookkeeperPrompt(
  transaction: Transaction,
  userPrompts: UserPrompt[],
  categories: Category[]
): string {
  const activePrompts = userPrompts.filter((p) => p.is_active);
  const categoryNames = categories.map((c) => c.name);

  const customRulesSection =
    activePrompts.length > 0
      ? `## Custom Classification Rules (HIGHEST PRIORITY — apply these first)
${activePrompts.map((p, i) => `${i + 1}. ${p.prompt_text}`).join("\n")}`
      : "";

  const categoriesSection =
    categoryNames.length > 0
      ? `## Available Categories
Use one of these categories if it fits: ${categoryNames.join(", ")}.
If none fit, create an appropriate category name.`
      : `## Categories
Infer the most appropriate category from the transaction details.`;

  return `You are a professional bookkeeper AI. Your job is to classify a financial transaction.

${customRulesSection}

${categoriesSection}

## Transaction to Classify
- Date: ${transaction.date}
- Description: ${transaction.description}
- Amount: ${transaction.amount < 0 ? "-" : "+"}$${Math.abs(transaction.amount).toFixed(2)} (${transaction.amount < 0 ? "expense" : "income"})
- Source: ${transaction.source}
${transaction.vendor ? `- Vendor: ${transaction.vendor}` : ""}

## Required Output Format (JSON only, no markdown)
{
  "category": "<category name>",
  "confidence": <0.0 to 1.0>,
  "reasoning": "<concise explanation of why this category was chosen>",
  "source": "<user_rule|custom_category|historical|model|fallback>"
}

Apply custom rules first. Be concise in reasoning (1-2 sentences). Do not hallucinate facts.`;
}

export function buildReconciliationPrompt(
  transactions: Pick<Transaction, "id" | "date" | "amount" | "description">[],
  reference: { date: string; amount: number; description: string }
): string {
  return `You are a reconciliation agent. Find the transaction that best matches the reference item.

## Reference Item
- Date: ${reference.date}
- Amount: $${Math.abs(reference.amount).toFixed(2)}
- Description: ${reference.description}

## Candidate Transactions
${transactions.map((t, i) => `${i + 1}. [${t.id}] ${t.date} | $${Math.abs(t.amount).toFixed(2)} | ${t.description}`).join("\n")}

## Required Output Format (JSON only)
{
  "matched_id": "<transaction id or null if no match>",
  "confidence": <0.0 to 1.0>,
  "reasoning": "<brief explanation>"
}`;
}

export function buildCFOPrompt(
  question: string,
  context: {
    metrics: Record<string, unknown>;
    recentTransactions: Pick<Transaction, "date" | "description" | "amount" | "category">[];
    topCategories: Array<{ category: string; total: number }>;
  }
): string {
  return `You are a CFO-level financial advisor AI. Answer the user's question based on their financial data.

## Financial Summary
${JSON.stringify(context.metrics, null, 2)}

## Top Spending Categories
${context.topCategories.map((c) => `- ${c.category}: $${c.total.toFixed(2)}`).join("\n")}

## Recent Transactions (last 10)
${context.recentTransactions
  .slice(0, 10)
  .map((t) => `${t.date} | ${t.description} | $${t.amount.toFixed(2)} | ${t.category ?? "Uncategorized"}`)
  .join("\n")}

## User Question
${question}

## Instructions
- Answer directly and concisely.
- Base your answer on the data above only.
- Do not hallucinate financial facts.
- If you cannot determine an answer from the data, say so.
- Format numbers as currency (e.g., $1,234.56).
- Provide actionable insights when possible.`;
}

export function buildDocumentExtractionPrompt(rawText: string, fileType: string): string {
  return `You are a document intelligence agent. Extract structured financial data from this ${fileType}.

## Document Content
${rawText.slice(0, 4000)}

## Required Output Format (JSON only, no markdown)
{
  "vendor": "<vendor or company name, or null>",
  "amount": <total amount as number, or null>,
  "date": "<YYYY-MM-DD format, or null>",
  "tax": <tax amount as number, or null>,
  "currency": "<ISO code like USD, or null>",
  "category": "<inferred category, or null>",
  "line_items": [
    { "description": "<item>", "amount": <number>, "quantity": <number or null> }
  ],
  "confidence": <0.0 to 1.0>,
  "reasoning": "<brief explanation of extraction quality>"
}

Be precise. If a field is unclear, use null. Do not invent values.`;
}
