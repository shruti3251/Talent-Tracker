-- TalentFlow: candidates table, updated_at trigger, RLS policies, and realtime setup

create extension if not exists pgcrypto;

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  current_ctc numeric(6, 2) not null,
  expected_ctc numeric(6, 2) not null,
  experience_yrs numeric(4, 1) not null,
  availability text not null default 'immediately'
    check (availability in ('immediately', '15_days', '1_month', '2_months', 'more_than_2_months')),
  notes text,
  resume_url text,
  status text not null default 'shortlisted'
    check (status in ('shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists candidates_status_idx on public.candidates (status);
create index if not exists candidates_created_at_idx on public.candidates (created_at desc);

-- Keep updated_at current on every row change
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists candidates_set_updated_at on public.candidates;
create trigger candidates_set_updated_at
  before update on public.candidates
  for each row
  execute function public.set_updated_at();

-- Row Level Security: single HR team, no login screen in this app, so the
-- publishable anon key itself is granted full CRUD. Anyone holding the
-- anon key (e.g. the deployed app URL) can read/write candidate data.
-- If that ever stops being an acceptable tradeoff, add Supabase Auth and
-- switch these policies to `to authenticated`.
alter table public.candidates enable row level security;

drop policy if exists "Anon can read candidates" on public.candidates;
create policy "Anon can read candidates"
  on public.candidates for select
  to anon
  using (true);

drop policy if exists "Anon can insert candidates" on public.candidates;
create policy "Anon can insert candidates"
  on public.candidates for insert
  to anon
  with check (true);

drop policy if exists "Anon can update candidates" on public.candidates;
create policy "Anon can update candidates"
  on public.candidates for update
  to anon
  using (true)
  with check (true);

drop policy if exists "Anon can delete candidates" on public.candidates;
create policy "Anon can delete candidates"
  on public.candidates for delete
  to anon
  using (true);

-- Realtime: send full row data on updates/deletes and add the table to the publication
alter table public.candidates replica identity full;
alter publication supabase_realtime add table public.candidates;
