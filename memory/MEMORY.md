# NumiFin Project Memory

## Project
- Path: `/Users/samanway/Desktop/NumiFin/numifin`
- Stack: Next.js 15.3.2 (App Router, Turbopack), TypeScript, Tailwind v4, Supabase SSR, OpenAI SDK
- All phases 1-10 fully implemented and TypeScript-clean

## Key Architecture Decisions
- No `src/` directory — app lives at root `app/`
- Tailwind v4 config is CSS-only (`@theme {}` in globals.css, no tailwind.config.ts)
- PostCSS uses `@tailwindcss/postcss` plugin (not the old `tailwindcss` plugin)
- Supabase SSR: `@supabase/ssr` — `cookies()` is async in Next.js 15
- AES-256-GCM encryption for API keys via Web Crypto (`lib/crypto.ts`)
- All financial math is deterministic — LLM never does arithmetic

## DB Setup
- Run `supabase/schema.sql` in Supabase SQL editor before first use
- Tables: `user_configs`, `transactions`, `documents`, `user_prompts`, `categories`, `agent_activities`, `audit_logs`
- All tables have RLS enabled with `auth.uid() = user_id` policies

## File Structure
- `lib/agents/` — bookkeeper, reconciliation, cfo, document agent logic
- `lib/prompts.ts` — all LLM prompt builders
- `lib/finance.ts` — deterministic finance calculations
- `lib/crypto.ts` — AES-256-GCM encryption
- `lib/user-config.ts` — decrypt and return user's API key + model
- `app/(auth)/` — login, signup (public)
- `app/(dashboard)/` — protected pages with sidebar layout
- `app/setup/` — 3-step onboarding (not in dashboard group)
- `components/ui/` — custom Radix-based component library
- `components/dashboard/` — SummaryCards, TransactionsTable, InsightsPanel, AgentActivityFeed, CommandBar
- `components/transactions/CSVUpload.tsx` — drag-and-drop CSV importer
- `supabase/schema.sql` — full DB schema

## Env Vars Required
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`, `OPENAI_MODEL` (defaults: gpt-4o-mini)
- `ENCRYPTION_KEY` (32+ chars, required in production)
- `NEXT_PUBLIC_APP_URL`

## Brand Colors
- Primary: #3C366B, Accent: #00D9C0, BG: #FAFAFA, Surface2: #EAE6F7, Border: #E1E1E1

## Known Gotchas
- Old `.next/` build cache from before source files existed — delete it if stale TS errors appear
- `CookieOptions` must be imported from `@supabase/ssr` for typed setAll callbacks
- Regex character class `[→->]` causes TS errors — use alternation `(?:→|->|=>)` instead
- Docker build requires `DOCKER_BUILD=1` env var to enable `output: "standalone"` in next.config.ts
