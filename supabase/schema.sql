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

-- Site settings (single row)
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  home_video_url text,
  home_video_path text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

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
alter table public.site_settings enable row level security;

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

drop policy if exists "public read site_settings" on public.site_settings;
create policy "public read site_settings" on public.site_settings
for select to anon using (true);

drop policy if exists "admin full site_settings" on public.site_settings;
create policy "admin full site_settings" on public.site_settings
for all to authenticated using (true) with check (true);

-- Storage bucket for homepage videos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'home-videos',
  'home-videos',
  true,
  52428800,
  array['video/mp4', 'video/webm', 'video/ogg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read home videos" on storage.objects;
create policy "public read home videos" on storage.objects
for select to anon using (bucket_id = 'home-videos');

drop policy if exists "admin upload home videos" on storage.objects;
create policy "admin upload home videos" on storage.objects
for insert to authenticated with check (bucket_id = 'home-videos');

drop policy if exists "admin update home videos" on storage.objects;
create policy "admin update home videos" on storage.objects
for update to authenticated using (bucket_id = 'home-videos') with check (bucket_id = 'home-videos');

drop policy if exists "admin delete home videos" on storage.objects;
create policy "admin delete home videos" on storage.objects
for delete to authenticated using (bucket_id = 'home-videos');

