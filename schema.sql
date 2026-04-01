-- Owen & Scarlet HQ — Supabase schema
-- Run this in your Supabase project SQL editor

create table if not exists rooms (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  host       text not null,
  members    text[] not null default '{}',
  game       text,
  state      jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Enable realtime for the rooms table
alter publication supabase_realtime add table rooms;

-- RLS: anyone can read/write rooms (no auth required for kids app)
alter table rooms enable row level security;

create policy "allow all" on rooms for all using (true) with check (true);

-- Optional: auto-delete stale rooms older than 24 hours
-- (set up a pg_cron job or Supabase edge function for this)
