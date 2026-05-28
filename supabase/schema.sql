create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  headline text,
  target_roles text[] not null default '{}',
  regions text[] not null default '{}',
  salary_expectation text,
  seniority text,
  career_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  source_type text not null default 'built' check (source_type in ('built', 'uploaded', 'tailored')),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  company text,
  location text,
  salary text,
  source text,
  url text,
  description text,
  match_score int check (match_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  cv_id uuid references public.cvs(id) on delete set null,
  status text not null default 'discovered' check (
    status in ('discovered', 'saved', 'drafted', 'ready', 'applied', 'interview', 'rejected', 'offer')
  ),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.application_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  draft_type text not null check (draft_type in ('cv', 'cover_letter', 'answer')),
  content jsonb not null default '{}'::jsonb,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'trial' check (plan in ('trial', 'pro', 'premium')),
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'cancelled')),
  stripe_customer_id text,
  stripe_subscription_id text,
  tailored_cv_credits int not null default 3 check (tailored_cv_credits >= 0),
  job_scan_interval_days int not null default 1 check (job_scan_interval_days > 0),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credit_type text not null check (credit_type in ('tailored_cv')),
  amount int not null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.cvs enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.application_drafts enable row level security;
alter table public.billing_profiles enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Users can manage own profile" on public.profiles;
drop policy if exists "Users can manage own cvs" on public.cvs;
drop policy if exists "Users can manage own jobs" on public.jobs;
drop policy if exists "Users can manage own applications" on public.applications;
drop policy if exists "Users can manage own drafts" on public.application_drafts;
drop policy if exists "Users can manage own billing profile" on public.billing_profiles;
drop policy if exists "Users can manage own credits" on public.credit_ledger;
drop policy if exists "Users can read own audit logs" on public.audit_logs;
drop policy if exists "Users can create own audit logs" on public.audit_logs;

create policy "Users can manage own profile" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own cvs" on public.cvs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own jobs" on public.jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own applications" on public.applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own drafts" on public.application_drafts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own billing profile" on public.billing_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own credits" on public.credit_ledger
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read own audit logs" on public.audit_logs
  for select using (auth.uid() = user_id);

create policy "Users can create own audit logs" on public.audit_logs
  for insert with check (auth.uid() = user_id);
