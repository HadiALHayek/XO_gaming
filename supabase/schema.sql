-- Devices
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null check (type in ('PC', 'PS4')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.devices
drop constraint if exists devices_type_check;

alter table public.devices
add constraint devices_type_check check (type in ('PC', 'PS4', 'PS5'));

update public.devices
set type = 'PS4'
where type = 'PS5';

update public.devices
set name = regexp_replace(name, '^PS5-', 'PS4-')
where name like 'PS5-%';

alter table public.devices
drop constraint if exists devices_type_check;

alter table public.devices
add constraint devices_type_check check (type in ('PC', 'PS4'));

-- Reservations
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text,
  customer_discord text,
  device_id uuid not null references public.devices(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_daily_recurring boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

alter table public.reservations
add column if not exists is_daily_recurring boolean not null default false;

-- Matches
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  match_date timestamptz not null,
  details text,
  created_at timestamptz not null default now()
);

-- Seats reserved for matches
create table if not exists public.match_reservations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  seat_number integer not null check (seat_number between 1 and 20),
  customer_name text not null,
  customer_phone text not null,
  created_at timestamptz not null default now(),
  unique (match_id, seat_number)
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

create table if not exists public.home_logo_images (
  id uuid primary key default gen_random_uuid(),
  image_path text not null unique,
  image_url text not null,
  created_at timestamptz not null default now()
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

create index if not exists idx_reservations_device_start on public.reservations(device_id, start_time);
create index if not exists idx_reservations_device_end on public.reservations(device_id, end_time);
create index if not exists idx_blocked_slots_device_start on public.blocked_slots(device_id, start_time);
create index if not exists idx_blocked_slots_device_end on public.blocked_slots(device_id, end_time);
create index if not exists idx_matches_date on public.matches(match_date);
create index if not exists idx_match_reservations_match on public.match_reservations(match_id);
create index if not exists idx_home_logo_images_created_at on public.home_logo_images(created_at desc);

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
  ('PS4-1', 'PS4'),
  ('PS4-2', 'PS4'),
  ('PS4-3', 'PS4'),
  ('PS4-4', 'PS4')
on conflict (name) do nothing;

alter table public.devices enable row level security;
alter table public.reservations enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.site_settings enable row level security;
alter table public.matches enable row level security;
alter table public.match_reservations enable row level security;
alter table public.home_logo_images enable row level security;

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

drop policy if exists "public read matches" on public.matches;
create policy "public read matches" on public.matches
for select to anon using (true);

drop policy if exists "public read match_reservations" on public.match_reservations;
create policy "public read match_reservations" on public.match_reservations
for select to anon using (true);

drop policy if exists "public read home_logo_images" on public.home_logo_images;
create policy "public read home_logo_images" on public.home_logo_images
for select to anon using (true);

-- Public can create bookings without login
drop policy if exists "public insert reservations" on public.reservations;
create policy "public insert reservations" on public.reservations
for insert to anon with check (true);

drop policy if exists "public insert match_reservations" on public.match_reservations;
create policy "public insert match_reservations" on public.match_reservations
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

drop policy if exists "admin full matches" on public.matches;
create policy "admin full matches" on public.matches
for all to authenticated using (true) with check (true);

drop policy if exists "admin full match_reservations" on public.match_reservations;
create policy "admin full match_reservations" on public.match_reservations
for all to authenticated using (true) with check (true);

drop policy if exists "admin full home_logo_images" on public.home_logo_images;
create policy "admin full home_logo_images" on public.home_logo_images
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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'game-logos',
  'game-logos',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
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

drop policy if exists "public read game logos" on storage.objects;
create policy "public read game logos" on storage.objects
for select to anon using (bucket_id = 'game-logos');

drop policy if exists "admin upload game logos" on storage.objects;
create policy "admin upload game logos" on storage.objects
for insert to authenticated with check (bucket_id = 'game-logos');

drop policy if exists "admin update game logos" on storage.objects;
create policy "admin update game logos" on storage.objects
for update to authenticated using (bucket_id = 'game-logos') with check (bucket_id = 'game-logos');

drop policy if exists "admin delete game logos" on storage.objects;
create policy "admin delete game logos" on storage.objects
for delete to authenticated using (bucket_id = 'game-logos');

