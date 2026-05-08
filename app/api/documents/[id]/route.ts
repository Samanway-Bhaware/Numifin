import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { deleteTransactions } = await req.json().catch(() => ({ deleteTransactions: false }));

  // Fetch document (must belong to this user)
  const { data: doc, error: fetchErr } = await supabase
    .from("documents")
    .select("id, file_url, extracted_data")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Optionally delete linked transactions
  let deletedTransactions = 0;
  if (deleteTransactions) {
    const transactionIds = (doc.extracted_data?.transaction_ids as string[] | undefined) ?? [];
    if (transactionIds.length > 0) {
      const { count } = await supabase
        .from("transactions")
        .delete({ count: "exact" })
        .in("id", transactionIds)
        .eq("user_id", user.id);
      deletedTransactions = count ?? 0;
    }
  }

  // Remove file from storage
  if (doc.file_url) {
    const match = doc.file_url.match(/\/documents\/(.+)$/);
    if (match?.[1]) {
      await supabase.storage.from("documents").remove([match[1]]);
    }
  }

  // Delete DB record
  const { error: delErr } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({ success: true, deletedTransactions });
}
