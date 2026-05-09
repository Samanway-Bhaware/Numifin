// ============================================================
// NumiFin Database Schema Types
// ============================================================

export type TransactionSource = "csv" | "manual" | "bank" | "stripe" | "document";

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  description: string;
  amount: number; // positive = income, negative = expense
  category: string | null;
  confidence: number | null; // 0–1
  reasoning: string | null;
  source: TransactionSource;
  reconciled: boolean;
  flagged: boolean;
  vendor: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_type: "receipt" | "invoice" | "statement" | "pdf" | "image" | "other";
  extracted_data: ExtractedDocumentData | null;
  category: string | null;
  confidence: number | null;
  reasoning: string | null;
  status: "pending" | "processing" | "done" | "failed";
  created_at: string;
}

export interface ExtractedDocumentData {
  vendor?: string;
  amount?: number;
  date?: string;
  tax?: number;
  currency?: string;
  line_items?: Array<{ description: string; amount: number; quantity?: number }>;
  raw_text?: string;
  [key: string]: unknown;
}

export interface UserPrompt {
  id: string;
  user_id: string;
  name: string;
  prompt_text: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  created_at: string;
}

export interface UserConfig {
  user_id: string;
  api_key_encrypted: string;
  db_url_encrypted: string | null;
  model_name: string;
  setup_complete: boolean;
  updated_at: string;
}

export interface AgentActivity {
  id: string;
  user_id: string;
  agent: "bookkeeper" | "reconciliation" | "cashflow" | "cfo" | "document";
  action: string;
  status: "running" | "done" | "failed";
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: "starter" | "pro" | "team";
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  entity_type: "transaction" | "document" | "category" | "prompt" | "config";
  entity_id: string;
  action: "create" | "update" | "delete" | "classify" | "reconcile";
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  created_at: string;
}

// ============================================================
// DTO / API Types
// ============================================================

export interface ClassificationResult {
  category: string;
  confidence: number;
  reasoning: string;
  source: "user_rule" | "custom_category" | "historical" | "model" | "fallback";
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netCashFlow: number;
  burnRate: number; // monthly average expense
  runway: number | null; // months remaining (null if no balance)
  cashBalance: number;
  unreconciledCount: number;
  categorizedPercent: number;
}

export interface MonthlyData {
  month: string; // "YYYY-MM"
  revenue: number;
  expenses: number;
  net: number;
}
