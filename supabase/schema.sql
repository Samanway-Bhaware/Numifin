-- ============================================================
-- NumiFin — Supabase Database Schema
-- Run this in your Supabase SQL editor to initialize the schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── user_configs ─────────────────────────────────────────────
create table if not exists user_configs (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  api_key_encrypted text not null,
  db_url_encrypted  text,
  model_name   text not null default 'gpt-4o-mini',
  setup_complete boolean not null default false,
  updated_at   timestamptz not null default now()
);

alter table user_configs enable row level security;
create policy "Users can manage own config" on user_configs
  for all using (auth.uid() = user_id);

-- ─── transactions ─────────────────────────────────────────────
create table if not exists transactions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  date         date not null,
  description  text not null,
  amount       numeric(15, 2) not null,
  category     text,
  confidence   numeric(4, 3) check (confidence >= 0 and confidence <= 1),
  reasoning    text,
  source       text not null default 'manual' check (source in ('csv','manual','bank','stripe','document')),
  reconciled   boolean not null default false,
  flagged      boolean not null default false,
  vendor       text,
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists transactions_user_date on transactions (user_id, date desc);
create index if not exists transactions_user_category on transactions (user_id, category);

alter table transactions enable row level security;
create policy "Users can manage own transactions" on transactions
  for all using (auth.uid() = user_id);

-- ─── documents ────────────────────────────────────────────────
create table if not exists documents (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  file_name      text not null,
  file_url       text not null default '',
  file_type      text not null default 'other' check (file_type in ('receipt','invoice','statement','pdf','image','other')),
  extracted_data jsonb,
  category       text,
  confidence     numeric(4, 3),
  reasoning      text,
  status         text not null default 'pending' check (status in ('pending','processing','done','failed')),
  created_at     timestamptz not null default now()
);

alter table documents enable row level security;
create policy "Users can manage own documents" on documents
  for all using (auth.uid() = user_id);

-- ─── user_prompts ─────────────────────────────────────────────
create table if not exists user_prompts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  prompt_text  text not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table user_prompts enable row level security;
create policy "Users can manage own prompts" on user_prompts
  for all using (auth.uid() = user_id);

-- ─── categories ───────────────────────────────────────────────
create table if not exists categories (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text not null default '#6b7280',
  description text,
  created_at  timestamptz not null default now(),
  unique (user_id, name)
);

alter table categories enable row level security;
create policy "Users can manage own categories" on categories
  for all using (auth.uid() = user_id);

-- ─── agent_activities ─────────────────────────────────────────
create table if not exists agent_activities (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  agent      text not null check (agent in ('bookkeeper','reconciliation','cashflow','cfo','document')),
  action     text not null,
  status     text not null default 'done' check (status in ('running','done','failed')),
  metadata   jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists agent_activities_user_created on agent_activities (user_id, created_at desc);

alter table agent_activities enable row level security;
create policy "Users can view own activities" on agent_activities
  for all using (auth.uid() = user_id);

-- ─── audit_logs ───────────────────────────────────────────────
create table if not exists audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id   text not null,
  action      text not null,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists audit_logs_user_created on audit_logs (user_id, created_at desc);

alter table audit_logs enable row level security;
create policy "Users can view own audit logs" on audit_logs
  for all using (auth.uid() = user_id);

-- ─── Storage bucket for documents ─────────────────────────────
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

create policy "Users can upload own documents" on storage.objects
  for insert with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Documents are publicly readable" on storage.objects
  for select using (bucket_id = 'documents');

create policy "Users can delete own documents" on storage.objects
  for delete using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
