import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { RulesClient } from "./RulesClient";
import type { UserPrompt, Category } from "@/lib/schema";

export const metadata = { title: "Rules & Prompts" };

export default async function RulesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [promptsRes, categoriesRes] = await Promise.all([
    supabase.from("user_prompts").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("categories").select("*").eq("user_id", user!.id).order("name"),
  ]);

  const prompts: UserPrompt[] = promptsRes.data ?? [];
  const categories: Category[] = categoriesRes.data ?? [];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Rules & Prompts"
        subtitle="Define custom classification rules and manage categories"
      />
      <div className="flex-1 overflow-auto p-6">
        <RulesClient initialPrompts={prompts} initialCategories={categories} />
      </div>
    </div>
  );
}
