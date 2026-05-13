-- bavaria-summer-2026 schema
-- Run this in the Supabase SQL editor after creating a fresh project.

create extension if not exists pgcrypto;

create table public.cabins (
  id text primary key,
  name_no text not null,
  capacity_max int not null default 2,
  description_no text,
  position int not null default 0
);

create table public.itinerary_stops (
  id uuid primary key default gen_random_uuid(),
  stop_date date not null unique,
  location_no text not null,
  type text not null check (type in ('harbor','anchorage','sail','handover')),
  notes_no text,
  position int not null default 0
);

-- start_date and end_date are BOTH inclusive (the first and last night slept aboard).
-- A one-night stay has start_date = end_date.
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  cabin_id text not null references public.cabins(id) on delete restrict,
  start_date date not null,
  end_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  constraint bookings_date_order check (end_date >= start_date)
);

create index bookings_cabin_dates_idx on public.bookings (cabin_id, start_date, end_date);

alter table public.cabins enable row level security;
alter table public.itinerary_stops enable row level security;
alter table public.bookings enable row level security;

-- Public reads. All writes go through server actions using the service-role key.
create policy "public read cabins" on public.cabins for select using (true);
create policy "public read itinerary" on public.itinerary_stops for select using (true);
create policy "public read bookings" on public.bookings for select using (true);
