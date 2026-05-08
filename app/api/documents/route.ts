import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserConfig } from "@/lib/user-config";
import { randomUUID } from "crypto";

// ── Types ──────────────────────────────────────────────────────────────────

interface ExtractedTransaction {
  date: string;
  description: string;
  amount: number;
  vendor?: string | null;
  category?: string | null;
}

interface ExtractionResult {
  document_type: string;
  transactions: ExtractedTransaction[];
  currency?: string;
  confidence: number;
  reasoning: string;
}

// ── Gemini vision extraction (PDF + images) ────────────────────────────────

async function extractWithGeminiVision(
  buffer: ArrayBuffer,
  mimeType: string,
  apiKey: string | null
): Promise<ExtractionResult> {
  const key = apiKey ?? process.env.GEMINI_API_KEY;
  if (!key) throw new Error("No Gemini API key configured. Add GEMINI_API_KEY to your environment or set one in Settings.");

  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: key });

  const base64 = Buffer.from(buffer).toString("base64");
  const currentYear = new Date().getFullYear();

  const prompt = `Extract ALL financial transactions from this document. Respond with valid JSON only — no markdown, no explanation outside the JSON.

If this is a bank statement or account history: extract every single transaction row.
If this is a receipt or invoice: extract the single transaction.

Required JSON format:
{
  "document_type": "bank_statement" | "receipt" | "invoice" | "other",
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "transaction description as shown",
      "amount": -49.99,
      "vendor": "merchant/vendor name or null",
      "category": "inferred category or null"
    }
  ],
  "currency": "USD",
  "confidence": 0.95,
  "reasoning": "brief note about extraction quality"
}

Rules:
- Debits / expenses / withdrawals: NEGATIVE amounts
- Credits / income / deposits: POSITIVE amounts
- Dates must be YYYY-MM-DD. If year is missing assume ${currentYear}
- Do NOT invent transactions. Only include what is visible in the document.
- description should be the raw payee/narration text from the document`;

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64 } },
        { text: prompt },
      ],
    },
    config: { responseMimeType: "application/json", temperature: 0.1 },
  });

  const content = result.text ?? "";
  if (!content) throw new Error("Gemini returned empty content");

  return JSON.parse(content) as ExtractionResult;
}

// ── Text/CSV extraction via standard LLM call ──────────────────────────────

async function extractFromText(
  text: string,
  apiKey: string | null,
  model: string
): Promise<ExtractionResult> {
  const { callLLM } = await import("@/lib/ai");
  const currentYear = new Date().getFullYear();

  const prompt = `Extract ALL financial transactions from the following document text. Respond with valid JSON only — no markdown.

Document text:
${text.slice(0, 8000)}

Required JSON format:
{
  "document_type": "bank_statement" | "receipt" | "invoice" | "other",
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "transaction description",
      "amount": -49.99,
      "vendor": "vendor name or null",
      "category": "inferred category or null"
    }
  ],
  "currency": "USD",
  "confidence": 0.95,
  "reasoning": "brief note"
}

Rules:
- Debits / expenses: NEGATIVE amounts. Credits / income: POSITIVE amounts.
- Dates in YYYY-MM-DD format. Assume year ${currentYear} if not present.
- Do not invent data. Only extract what is in the text.`;

  const raw = await callLLM(prompt, { apiKey, model, maxTokens: 4096, temperature: 0.1 });
  return JSON.parse(raw) as ExtractionResult;
}

// ── GET — list documents ───────────────────────────────────────────────────

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ documents: data ?? [] });
}

// ── POST — upload + process document ──────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const fileType = detectFileType(file.name, file.type);
  const docId = randomUUID();
  const isBinary = fileType === "pdf" || fileType === "image";

  // Insert pending record immediately
  await supabase.from("documents").insert({
    id: docId,
    user_id: user.id,
    file_name: file.name,
    file_url: "",
    file_type: fileType,
    status: "processing",
    extracted_data: null,
    category: null,
    confidence: null,
    reasoning: null,
  });

  try {
    // Read buffer once — used for both storage upload and vision extraction
    const fileBuffer = await file.arrayBuffer();
    const filePath = `${user.id}/${docId}/${file.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, fileBuffer, { contentType: file.type });
    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(uploadData.path);
    const fileUrl = urlData.publicUrl;

    // Extract transactions
    const config = await getUserConfig(user.id);
    let result: ExtractionResult;

    if (isBinary) {
      // PDF / image → Gemini vision (reads actual content)
      result = await extractWithGeminiVision(fileBuffer, file.type || "application/pdf", config.apiKey);
    } else {
      // Text / CSV → decode and run through LLM
      const text = new TextDecoder().decode(fileBuffer);
      result = await extractFromText(text, config.apiKey, config.model);
    }

    // Normalise and filter valid transactions
    const validTxs = (result.transactions ?? []).filter(
      (t) => t.date && typeof t.amount === "number" && t.description
    );

    // Bulk-insert all transactions
    const insertedIds: string[] = [];
    if (validTxs.length > 0) {
      const rows = validTxs.map((t) => ({
        id: randomUUID(),
        user_id: user.id,
        date: normalizeDate(t.date),
        description: t.description,
        amount: t.amount,
        category: t.category ?? null,
        confidence: result.confidence,
        reasoning: result.reasoning,
        source: "document",
        vendor: t.vendor ?? null,
        reconciled: false,
        flagged: false,
        tags: [],
        created_at: new Date().toISOString(),
      }));

      const { data: inserted } = await supabase.from("transactions").insert(rows).select("id");
      inserted?.forEach((r) => insertedIds.push(r.id));
    }

    // Update document record — include transaction_ids so delete can clean them up
    await supabase.from("documents").update({
      file_url: fileUrl,
      extracted_data: { ...result, transaction_ids: insertedIds },
      category: result.document_type ?? null,
      confidence: result.confidence,
      reasoning: result.reasoning,
      status: "done",
    }).eq("id", docId);

    // Log agent activity
    await supabase.from("agent_activities").insert({
      user_id: user.id,
      agent: "document",
      action: `Document Agent processed "${file.name}" → ${insertedIds.length} transaction${insertedIds.length === 1 ? "" : "s"} created`,
      status: "done",
      metadata: { docId, transactionCount: insertedIds.length, documentType: result.document_type },
    });

    const { data: doc } = await supabase.from("documents").select("*").eq("id", docId).single();
    return NextResponse.json({ document: doc, transactionsCreated: insertedIds.length }, { status: 201 });

  } catch (err: unknown) {
    await supabase.from("documents").update({ status: "failed" }).eq("id", docId);
    const message = err instanceof Error ? err.message : "Processing failed";
    console.error("Document processing error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function normalizeDate(raw: string): string {
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function detectFileType(filename: string, mimeType: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf" || mimeType === "application/pdf") return "pdf";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext) || mimeType.startsWith("image/")) return "image";
  if (ext === "csv") return "csv";
  if (["doc", "docx"].includes(ext)) return "invoice";
  return "other";
}
