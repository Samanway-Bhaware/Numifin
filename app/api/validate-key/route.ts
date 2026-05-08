import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, model, provider } = await req.json();

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ valid: false, error: "No API key provided" }, { status: 400 });
    }

    const isGemini = provider === "gemini" || (model && (model as string).startsWith("gemini"));

    if (isGemini) {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      // Minimal call to verify key works
      await ai.models.generateContent({
        model: model ?? "gemini-3-flash-preview",
        contents: "ping",
        config: { maxOutputTokens: 1 },
      });
    } else {
      // Validate OpenAI key
      const client = new OpenAI({ apiKey });
      await client.models.retrieve(model ?? "gpt-4o-mini");
    }

    return NextResponse.json({ valid: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid API key";
    return NextResponse.json({ valid: false, error: message }, { status: 200 });
  }
}
