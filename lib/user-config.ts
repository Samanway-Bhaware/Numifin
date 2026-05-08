import { createClient } from "./supabase/server";
import { decrypt } from "./crypto";
import { DEFAULT_MODEL } from "./ai";

export interface ResolvedConfig {
  // null means: no custom key — use server GEMINI_API_KEY
  apiKey: string | null;
  model: string;
  dbUrl: string | null;
}

export async function getUserConfig(userId: string): Promise<ResolvedConfig> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("user_configs")
    .select("api_key_encrypted, db_url_encrypted, model_name")
    .eq("user_id", userId)
    .single();

  if (!data) {
    return { apiKey: null, model: DEFAULT_MODEL, dbUrl: null };
  }

  const apiKey = data.api_key_encrypted ? await decrypt(data.api_key_encrypted) : null;
  const dbUrl = data.db_url_encrypted ? await decrypt(data.db_url_encrypted) : null;

  return {
    apiKey,
    model: data.model_name ?? DEFAULT_MODEL,
    dbUrl,
  };
}
