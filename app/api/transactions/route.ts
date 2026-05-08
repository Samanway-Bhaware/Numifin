import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Papa from "papaparse";
import { randomUUID } from "crypto";
import type { Transaction } from "@/lib/schema";

// GET /api/transactions — list all transactions
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? 200);
  const offset = Number(url.searchParams.get("offset") ?? 0);

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ transactions: data ?? [] });
}

// POST /api/transactions — create manual or import CSV
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") ?? "";

  // CSV upload
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
    });

    if (result.errors.length > 0) {
      return NextResponse.json(
        { error: `CSV parse error: ${result.errors[0].message}` },
        { status: 400 }
      );
    }

    const rows = result.data;
    const transactions: Omit<Transaction, "updated_at">[] = rows.map((row) => {
      // Try common CSV column naming conventions
      const date =
        row.date ?? row.transaction_date ?? row.value_date ?? new Date().toISOString().slice(0, 10);
      const description =
        row.description ?? row.memo ?? row.narration ?? row.details ?? "Unknown";
      const amountRaw =
        row.amount ?? row.debit ?? row.credit ?? row.value ?? "0";
      const amount = parseFloat(amountRaw.replace(/[^0-9.\-]/g, "")) || 0;

      return {
        id: randomUUID(),
        user_id: user.id,
        date: normalizeDate(date),
        description: description.trim(),
        amount,
        category: null,
        confidence: null,
        reasoning: null,
        source: "csv" as const,
        reconciled: false,
        flagged: false,
        vendor: row.vendor ?? row.merchant ?? null,
        tags: [],
        created_at: new Date().toISOString(),
      };
    });

    const { data: inserted, error } = await supabase
      .from("transactions")
      .insert(transactions)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Log agent activity
    await supabase.from("agent_activities").insert({
      user_id: user.id,
      agent: "bookkeeper",
      action: `Imported ${transactions.length} transactions from CSV file "${file.name}"`,
      status: "done",
      metadata: { count: transactions.length, file: file.name },
    });

    return NextResponse.json({ transactions: inserted, count: inserted?.length ?? 0 });
  }

  // Manual single transaction
  const body = await req.json();
  const { date, description, amount, category, source = "manual", vendor } = body;

  if (!date || !description || amount === undefined) {
    return NextResponse.json(
      { error: "date, description, and amount are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      id: randomUUID(),
      user_id: user.id,
      date,
      description,
      amount: Number(amount),
      category: category ?? null,
      source,
      vendor: vendor ?? null,
      reconciled: false,
      flagged: false,
      tags: [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ transaction: data }, { status: 201 });
}

function normalizeDate(raw: string): string {
  // Attempt to parse common date formats and return YYYY-MM-DD
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}
