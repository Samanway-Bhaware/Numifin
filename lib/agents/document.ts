import { extractDocument } from "../ai";
import { buildDocumentExtractionPrompt } from "../prompts";
import type { ExtractedDocumentData } from "../schema";

// ============================================================
// Document Intelligence Agent
// Extracts structured data from receipts, invoices, PDFs
// ============================================================

export async function processDocument(
  text: string,
  fileType: string,
  options: { apiKey?: string; model?: string } = {}
): Promise<ExtractedDocumentData & { confidence: number; reasoning: string }> {
  const prompt = buildDocumentExtractionPrompt(text, fileType);
  const result = await extractDocument(prompt, options);

  return {
    vendor: (result.vendor as string) ?? undefined,
    amount: typeof result.amount === "number" ? result.amount : undefined,
    date: (result.date as string) ?? undefined,
    tax: typeof result.tax === "number" ? result.tax : undefined,
    currency: (result.currency as string) ?? undefined,
    category: (result.category as string) ?? undefined,
    line_items: Array.isArray(result.line_items)
      ? (result.line_items as ExtractedDocumentData["line_items"])
      : [],
    raw_text: text.slice(0, 1000),
    confidence: typeof result.confidence === "number" ? result.confidence : 0.5,
    reasoning: (result.reasoning as string) ?? "Extraction completed",
  };
}

// Simple text extraction from plain text files
// In production, integrate with Tesseract.js or a cloud OCR service
export function extractTextFromFile(content: string): string {
  return content.trim();
}
