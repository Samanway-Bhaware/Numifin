import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { DocumentsClient } from "./DocumentsClient";
import type { Document } from "@/lib/schema";

export const metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: docsRaw } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const documents: Document[] = docsRaw ?? [];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Documents"
        subtitle={`${documents.length} documents · AI-extracted data from receipts, invoices, and PDFs`}
      />
      <div className="flex-1 overflow-auto p-6">
        <DocumentsClient initialDocuments={documents} />
      </div>
    </div>
  );
}
