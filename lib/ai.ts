import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import type { ClassificationResult } from "./schema";

// ============================================================
// AI provider detection — inferred from model name
// ============================================================

export type AIProvider = "gemini" | "openai";

function inferProvider(model: string): AIProvider {
  if (model.startsWith("gemini") || model.startsWith("models/gemini")) return "gemini";
  return "openai";
}

export const DEFAULT_MODEL = "gemini-3-flash-preview";
export const DEFAULT_PROVIDER: AIProvider = "gemini";

// ============================================================
// Shared call options
// ============================================================

export interface AICallOptions {
  apiKey?: string | null;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// ============================================================
// callLLM — routes to Gemini or OpenAI based on model name
// ============================================================

export async function callLLM(
  prompt: string,
  options: AICallOptions = {}
): Promise<string> {
  const model = options.model ?? DEFAULT_MODEL;
  const provider = inferProvider(model);

  if (provider === "gemini") {
    const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY ?? "";
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: options.temperature ?? 0.1,
        maxOutputTokens: options.maxTokens ?? 500,
      },
    });
    return result.text ?? "{}";
  }

  // OpenAI
  const client = new OpenAI({
    apiKey: options.apiKey ?? process.env.OPENAI_API_KEY,
  });
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: options.maxTokens ?? 500,
    temperature: options.temperature ?? 0.1,
    response_format: { type: "json_object" },
  });
  return response.choices[0]?.message?.content ?? "{}";
}

// ============================================================
// classifyTransaction
// ============================================================

export async function classifyTransaction(
  prompt: string,
  options: AICallOptions = {}
): Promise<ClassificationResult> {
  try {
    const raw = await callLLM(prompt, { ...options, maxTokens: 300 });
    const parsed = JSON.parse(raw);
    return {
      category: parsed.category ?? "Uncategorized",
      confidence: Math.max(0, Math.min(1, parsed.confidence ?? 0.5)),
      reasoning: parsed.reasoning ?? "No reasoning provided",
      source: parsed.source ?? "model",
    };
  } catch {
    return {
      category: "Uncategorized",
      confidence: 0.1,
      reasoning: "Classification failed — marked as uncategorized",
      source: "fallback",
    };
  }
}

// ============================================================
// extractDocument
// ============================================================

export async function extractDocument(
  prompt: string,
  options: AICallOptions = {}
): Promise<Record<string, unknown>> {
  try {
    const raw = await callLLM(prompt, { ...options });
    return JSON.parse(raw);
  } catch {
    return { error: "Extraction failed" };
  }
}

// ============================================================
// chatWithCFO — no JSON constraint
// ============================================================

export async function chatWithCFO(
  prompt: string,
  options: AICallOptions = {}
): Promise<string> {
  const model = options.model ?? DEFAULT_MODEL;
  const provider = inferProvider(model);

  if (provider === "gemini") {
    const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY ?? "";
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 600,
      },
    });
    return result.text ?? "I couldn't generate a response.";
  }

  // OpenAI
  const client = new OpenAI({
    apiKey: options.apiKey ?? process.env.OPENAI_API_KEY,
  });
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 600,
    temperature: 0.3,
  });
  return response.choices[0]?.message?.content ?? "I couldn't generate a response.";
}
