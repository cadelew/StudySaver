-- StudySaver — Supabase Schema
-- Run in Supabase SQL editor

create table if not exists users (
  id text primary key,
  name text not null,
  school text not null,
  location text not null,
  major text not null,
  monthly_budget numeric not null default 500,
  created_at timestamptz default now()
);

create table if not exists budget_categories (
  id text primary key,
  user_id text references users(id) on delete cascade,
  name text not null,
  emoji text not null default '💳',
  monthly_limit numeric not null,
  spent numeric not null default 0,
  color text not null default '#0D9488'
);

create table if not exists transactions (
  id text primary key,
  user_id text references users(id) on delete cascade,
  amount numeric not null,
  merchant text not null,
  category text not null,
  source text not null default 'manual',
  transcript text,
  confidence numeric,
  created_at timestamptz default now()
);

create table if not exists goals (
  id text primary key,
  user_id text references users(id) on delete cascade,
  name text not null,
  emoji text not null default '🎯',
  target_amount numeric not null,
  saved_amount numeric not null default 0,
  deadline date not null,
  weekly_savings_required numeric not null,
  status text not null default 'active',
  cost_breakdown jsonb
);

create table if not exists savings_opportunities (
  id text primary key,
  user_id text references users(id) on delete cascade,
  name text not null,
  category text not null,
  description text,
  estimated_savings numeric not null,
  claim_status text not null default 'not_claimed',
  source_url text,
  relevance_tag text,
  created_at timestamptz default now()
);

create table if not exists course_plans (
  id text primary key,
  user_id text references users(id) on delete cascade,
  course_name text not null,
  materials jsonb not null,
  total_bookstore_price numeric not null,
  total_recommended_price numeric not null,
  total_savings numeric not null,
  summary text not null,
  created_at timestamptz default now()
);

-- Browserbase research cache
create table if not exists material_research_cache (
  cache_key text primary key,  -- hash of (isbn or title+type)
  result jsonb not null,
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '7 days'
);

-- Maya demo seed data
insert into users (id, name, school, location, major, monthly_budget) values
  ('maya-demo', 'Maya', 'UC Berkeley', 'Berkeley, CA', 'Biology', 500)
  on conflict (id) do nothing;

insert into budget_categories (id, user_id, name, emoji, monthly_limit, spent, color) values
  ('cat-1', 'maya-demo', 'Eating Out', '🍔', 120, 34, '#F97316'),
  ('cat-2', 'maya-demo', 'Groceries', '🛒', 100, 42, '#10B981'),
  ('cat-3', 'maya-demo', 'Transportation', '🚌', 60, 18, '#3B82F6'),
  ('cat-4', 'maya-demo', 'Entertainment', '🎉', 80, 10, '#8B5CF6'),
  ('cat-5', 'maya-demo', 'School Supplies', '📚', 80, 0, '#0D9488'),
  ('cat-6', 'maya-demo', 'Subscriptions', '📱', 40, 10, '#EC4899'),
  ('cat-7', 'maya-demo', 'Miscellaneous', '✨', 20, 0, '#6B7280')
  on conflict (id) do nothing;

insert into goals (id, user_id, name, emoji, target_amount, saved_amount, deadline, weekly_savings_required, status, cost_breakdown) values
  ('goal-1', 'maya-demo', 'Oakland Concert', '🎵', 235, 40, '2026-08-15', 39.17, 'active',
   '{"ticket":150,"fees":35,"transportation":25,"food_buffer":25}')
  on conflict (id) do nothing;
