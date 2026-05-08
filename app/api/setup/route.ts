import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";
import { DEFAULT_MODEL } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { apiKey, model, dbUrl } = await req.json();

    // apiKey is optional — null/omitted means use server Gemini key
    const apiKeyEncrypted = apiKey && typeof apiKey === "string" ? await encrypt(apiKey) : null;
    const dbUrlEncrypted = dbUrl && typeof dbUrl === "string" ? await encrypt(dbUrl) : null;

    const upsertPayload: Record<string, unknown> = {
      user_id: user.id,
      model_name: model ?? DEFAULT_MODEL,
      setup_complete: true,
      updated_at: new Date().toISOString(),
    };

    // Only overwrite encrypted fields when explicitly provided
    if (apiKeyEncrypted !== null) upsertPayload.api_key_encrypted = apiKeyEncrypted;
    if (dbUrlEncrypted !== null) upsertPayload.db_url_encrypted = dbUrlEncrypted;
    // Explicit null clears the field
    if (apiKey === null) upsertPayload.api_key_encrypted = null;
    if (dbUrl === null) upsertPayload.db_url_encrypted = null;

    const { error } = await supabase.from("user_configs").upsert(upsertPayload);

    if (error) {
      console.error("Setup error:", error.message);
      return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 });
    }

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      entity_type: "config",
      entity_id: user.id,
      action: "update",
      before: null,
      after: { model: model ?? DEFAULT_MODEL, hasCustomKey: !!apiKey },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Setup route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
