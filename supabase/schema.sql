-- Devices
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null check (type in ('PC', 'PS5')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Reservations
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text,
  customer_discord text,
  device_id uuid not null references public.devices(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

-- Blocked slots for maintenance
create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  reason text not null,
  check (end_time > start_time)
);

create index if not exists idx_reservations_device_start on public.reservations(device_id, start_time);
create index if not exists idx_reservations_device_end on public.reservations(device_id, end_time);
create index if not exists idx_blocked_slots_device_start on public.blocked_slots(device_id, start_time);
create index if not exists idx_blocked_slots_device_end on public.blocked_slots(device_id, end_time);

insert into public.devices (name, type)
values
  ('PC-1', 'PC'),
  ('PC-2', 'PC'),
  ('PC-3', 'PC'),
  ('PC-4', 'PC'),
  ('PC-5', 'PC'),
  ('PC-6', 'PC'),
  ('PC-7', 'PC'),
  ('PC-8', 'PC'),
  ('PC-9', 'PC'),
  ('PC-10', 'PC'),
  ('PS5-1', 'PS5'),
  ('PS5-2', 'PS5'),
  ('PS5-3', 'PS5'),
  ('PS5-4', 'PS5')
on conflict (name) do nothing;

alter table public.devices enable row level security;
alter table public.reservations enable row level security;
alter table public.blocked_slots enable row level security;

-- Public read access (for live availability)
drop policy if exists "public read devices" on public.devices;
create policy "public read devices" on public.devices
for select to anon using (true);

drop policy if exists "public read reservations" on public.reservations;
create policy "public read reservations" on public.reservations
for select to anon using (true);

drop policy if exists "public read blocked_slots" on public.blocked_slots;
create policy "public read blocked_slots" on public.blocked_slots
for select to anon using (true);

-- Public can create bookings without login
drop policy if exists "public insert reservations" on public.reservations;
create policy "public insert reservations" on public.reservations
for insert to anon with check (true);

-- Admin-only write access
drop policy if exists "admin full devices" on public.devices;
create policy "admin full devices" on public.devices
for all to authenticated using (true) with check (true);

drop policy if exists "admin full reservations" on public.reservations;
create policy "admin full reservations" on public.reservations
for all to authenticated using (true) with check (true);

drop policy if exists "admin full blocked_slots" on public.blocked_slots;
create policy "admin full blocked_slots" on public.blocked_slots
for all to authenticated using (true) with check (true);

