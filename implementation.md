# NumiFin — Implementation Guide

## Project Summary

NumiFin is a self-hostable, privacy-first, AI-powered accounting SaaS built as a multi-agent financial intelligence platform. It ingests transactions, receipts, and invoices; categorizes and reconciles financial data; generates insights; and explains every AI decision.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Next.js 15 App                   │
│                    (App Router)                     │
├──────────────┬──────────────────┬───────────────────┤
│  Public Pages│  Dashboard Pages │    API Routes     │
│  /           │  /dashboard      │  /api/transactions│
│  /login      │  /transactions   │  /api/documents   │
│  /signup     │  /documents      │  /api/chat        │
│              │  /agents         │  /api/rules       │
│              │  /rules          │  /api/categories  │
│              │  /reports        │  /api/setup       │
│              │  /cfo            │  /api/agents/*    │
│              │  /settings       │                   │
└──────────────┴──────────────────┴───────────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
     Supabase       OpenAI       File Storage
     (Auth, DB)     (AI Agents)  (Supabase Storage)
```

### Agent Architecture

```
User Input / Uploaded Data
         │
         ▼
  ┌──────────────────────────────┐
  │      Bookkeeper Agent        │  Classifies transactions
  │   Rules → Categories → AI   │  Priority: user rules > categories > model
  └──────────────────────────────┘
         │
  ┌──────────────────────────────┐
  │    Reconciliation Agent      │  Detects duplicates, flags mismatches
  │   Deterministic + AI match  │
  └──────────────────────────────┘
         │
  ┌──────────────────────────────┐
  │      Cash Flow Agent         │  Burn rate, runway, monthly trends
  │   100% deterministic math   │  No LLM for arithmetic
  └──────────────────────────────┘
         │
  ┌──────────────────────────────┐
  │     Document Agent           │  OCR + LLM extraction
  │   Receipt/Invoice/PDF       │  Structured JSON output
  └──────────────────────────────┘
         │
  ┌──────────────────────────────┐
  │        CFO Agent             │  Natural language Q&A
  │   Retrieval over user data  │  Grounded answers only
  └──────────────────────────────┘
```

---

## Stack Decisions

| Layer         | Technology            | Reason                                     |
|---------------|-----------------------|--------------------------------------------|
| Framework     | Next.js 15 (App Router)| RSC, API routes, file-based routing        |
| Language      | TypeScript            | Type safety across agents and schema       |
| Styling       | Tailwind CSS v4       | Zero-runtime, CSS variable theme system    |
| UI Components | Custom + Radix UI     | Accessible, unstyled primitives            |
| Charts        | Recharts              | React-native, composable chart library     |
| Auth + DB     | Supabase              | Auth, PostgreSQL, RLS, Storage             |
| AI            | OpenAI SDK            | User-provided key, OpenAI-compatible API   |
| Encryption    | Web Crypto API        | AES-256-GCM for secrets at rest           |
| CSV Parsing   | PapaParse             | Robust CSV parsing with header detection   |
| Toasts        | Sonner                | Clean notification system                  |
| Deployment    | Docker / Vercel       | Self-hosted or cloud                       |

---

## Phase-by-Phase Build

### Phase 1 — Project Foundation ✅
- Next.js 15 + TypeScript + Tailwind v4 setup
- Brand design system: `#3C366B`, `#00D9C0`, `#FAFAFA`, `#EAE6F7`, `#E1E1E1`
- Full UI component library (Button, Card, Input, Badge, Dialog, Select, Tabs, etc.)
- App layout with sidebar navigation
- Landing page with agent showcase and feature overview

**Key files:** `app/globals.css`, `components/ui/`, `components/layout/Sidebar.tsx`, `app/page.tsx`

### Phase 2 — Authentication & Setup ✅
- Supabase SSR auth (login, signup, session management)
- 3-step onboarding: API key → Model selection → Launch
- API key validation against OpenAI before saving
- AES-256-GCM encryption of secrets at rest
- Route protection via middleware + layout guards

**Key files:** `app/(auth)/`, `app/setup/`, `middleware.ts`, `lib/crypto.ts`, `lib/supabase/`

### Phase 3 — Transaction Ingestion ✅
- CSV upload with drag-and-drop
- PapaParse with flexible column mapping (supports 10+ bank formats)
- Manual transaction creation
- Full transactions table: search, filter, paginate, inline-edit
- Filter tabs: All, Uncategorized, Unreconciled, Flagged, Income, Expenses

**Key files:** `app/(dashboard)/transactions/`, `components/transactions/CSVUpload.tsx`

### Phase 4 — Bookkeeper AI Agent ✅
- Priority-based classification: user rules → custom categories → AI
- Keyword rule matching format: `"vendor → Category"`
- Batch classification endpoint (`/api/transactions/classify-all`)
- Per-transaction classification with explainability
- Confidence scores, reasoning, and source tracking

**Key files:** `lib/agents/bookkeeper.ts`, `lib/prompts.ts`, `app/api/transactions/classify-all/`

### Phase 5 — Dashboard Analytics ✅
- 6 summary metric cards: balance, revenue, expenses, burn rate, runway, unreconciled
- Deterministic financial calculations (no LLM for math)
- Insights panel: runway warnings, anomaly detection, categorization status
- Agent activity feed with real-time status

**Key files:** `components/dashboard/`, `lib/finance.ts`, `app/(dashboard)/dashboard/`

### Phase 5B — Reports ✅
- Area chart: monthly revenue vs expenses trends
- Bar chart: monthly comparison
- Pie chart + table: spending by category with percentage breakdown
- KPI cards: revenue, expenses, burn rate, runway

**Key files:** `app/(dashboard)/reports/ReportsClient.tsx`

### Phase 6 — Document Intelligence ✅
- Drag-and-drop file upload (PDF, images, CSV, text)
- Supabase Storage for file persistence
- Document Intelligence Agent: text extraction → LLM structured extraction
- Extracts: vendor, amount, date, tax, currency, line items
- Confidence score and reasoning per document
- Extracted data viewer modal

**Key files:** `app/(dashboard)/documents/`, `lib/agents/document.ts`, `app/api/documents/`

### Phase 7 — Reconciliation + Agent Orchestration ✅
- Duplicate detection using Dice similarity coefficient
- Automatic flagging of likely duplicates
- Agent cards with real-time status and run buttons
- Full agent activity log (100 most recent events)
- Rules & Prompts page with CRUD for classification rules
- Custom Categories with color picker

**Key files:** `lib/agents/reconciliation.ts`, `app/(dashboard)/agents/`, `app/(dashboard)/rules/`

### Phase 8 — CFO Chat ✅
- Chat UI with message history and typing indicator
- Suggested questions for instant exploration
- CFO Agent grounded in transaction data (not hallucinated)
- Metrics + top categories + recent transactions as context
- Activity logging for every CFO query

**Key files:** `app/(dashboard)/cfo/`, `lib/agents/cfo.ts`, `app/api/chat/`

### Phase 9 — Security Hardening ✅
- AES-256-GCM encryption for API keys and DB URLs at rest
- Row-Level Security (RLS) on all Supabase tables
- Audit log for all create/update/delete/classify/reconcile actions
- Secrets never logged or sent to third parties
- Input validation on all API routes
- Route protection in middleware

**Key files:** `lib/crypto.ts`, `lib/user-config.ts`, `supabase/schema.sql`, `middleware.ts`

### Phase 10 — Self-Hosted Mode ✅
- Multi-stage Dockerfile (Node 22 Alpine, minimal image)
- `docker-compose.yml` with health checks
- Standalone Next.js output for containerized deployment

**Key files:** `Dockerfile`, `docker-compose.yml`

---

## Dependencies

| Phase     | Package               | Purpose                         |
|-----------|-----------------------|---------------------------------|
| All       | next, react, typescript| Core framework                 |
| All       | tailwindcss v4        | Styling                         |
| All       | lucide-react          | Icons                           |
| All       | sonner                | Toast notifications             |
| Auth      | @supabase/supabase-js, @supabase/ssr | Auth + DB     |
| AI        | openai                | LLM calls                       |
| CSV       | papaparse             | CSV parsing                     |
| Charts    | recharts              | Financial charts                |
| UI        | @radix-ui/*           | Accessible primitives           |
| UI        | class-variance-authority, clsx, tailwind-merge | Variant styling |
| Security  | Built-in Web Crypto   | AES-256-GCM encryption          |

---

## Environment Variables

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (optional — users can bring their own key via setup)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Security (required in production)
ENCRYPTION_KEY=your-32-char-secret-key-here!!

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Launch Checklist

### Before deploying
- [ ] Create a Supabase project and run `supabase/schema.sql`
- [ ] Enable Supabase Auth (Email provider)
- [ ] Create `documents` storage bucket (handled in SQL)
- [ ] Set all required environment variables
- [ ] Set `ENCRYPTION_KEY` to a random 32+ character string
- [ ] Configure `NEXT_PUBLIC_APP_URL` with your production domain

### Self-hosted deployment
```bash
# Clone and configure
cp .env.example .env.local
# Fill in all env vars

# Build and run with Docker
DOCKER_BUILD=1 docker-compose up -d

# Or run locally
npm install
npm run dev
```

### Vercel deployment
```bash
# Push to GitHub, import to Vercel, set env vars in dashboard
vercel deploy
```

---

## Risks & Considerations

| Risk                          | Mitigation                                          |
|-------------------------------|-----------------------------------------------------|
| AI hallucination on financials | All financial calculations are deterministic. LLM only interprets, never computes. |
| Secret exposure               | AES-256-GCM encryption + RLS + never logging       |
| Rate limits on OpenAI         | Batch size 5, with retry logic placeholder         |
| CSV format variety            | PapaParse with 10+ column name aliases              |
| Large transaction volumes     | Pagination, limit queries, indexed DB columns       |
| OCR accuracy                  | Placeholder for Tesseract/cloud OCR integration     |
| Self-host complexity          | Docker Compose with health checks and clear docs    |

---

## Extending NumiFin

### Add a new agent
1. Create `lib/agents/your-agent.ts`
2. Add a prompt builder in `lib/prompts.ts`
3. Create `/api/agents/your-agent/route.ts`
4. Add an agent card in `app/(dashboard)/agents/AgentsClient.tsx`

### Add a new data source (e.g. Stripe, Plaid)
1. Create `/api/import/stripe/route.ts`
2. Map the source data to the `Transaction` schema
3. Set `source: "stripe"` on imported records

### Add real OCR
1. Install `tesseract.js` or integrate AWS Textract / Google Document AI
2. Replace the text extraction in `app/api/documents/route.ts`
3. The Document Agent and prompt are already ready for the extracted text
