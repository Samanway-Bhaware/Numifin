import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { SettingsClient } from "./SettingsClient";
import { getUserSubscription } from "@/lib/subscription";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: config }, subscription] = await Promise.all([
    supabase
      .from("user_configs")
      .select("model_name, api_key_encrypted, db_url_encrypted")
      .eq("user_id", user!.id)
      .single(),
    getUserSubscription(user!.id),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="Manage your workspace configuration" />
      <div className="flex-1 overflow-auto p-6">
        <SettingsClient
          currentModel={config?.model_name ?? "gemini-3-flash-preview"}
          hasCustomKey={!!config?.api_key_encrypted}
          hasCustomDb={!!config?.db_url_encrypted}
          email={user!.email ?? ""}
          fullName={user!.user_metadata?.full_name ?? ""}
          subscription={subscription}
        />
      </div>
    </div>
  );
}
