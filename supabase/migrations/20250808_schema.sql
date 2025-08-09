-- Core schema and RLS
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text,
  vendor text,
  purchased_at date,
  currency text default 'USD',
  image_path text,
  total numeric(12,2),
  public_view_token uuid,
  public_view_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references receipts(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz default now(),
  unique (receipt_id, name)
);

create table if not exists public.receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references receipts(id) on delete cascade,
  line_index int,
  description text not null,
  quantity numeric(12,3) default 1,
  unit_price numeric(12,2) default 0,
  subtotal numeric(12,2) generated always as (round((quantity * unit_price)::numeric, 2)) stored,
  created_at timestamptz default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references receipt_items(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  share_type text not null check (share_type in ('equal','portion','amount')),
  portion numeric(12,3),
  amount numeric(12,2),
  created_at timestamptz default now(),
  unique (item_id, participant_id)
);

create table if not exists public.receipt_meta (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references receipts(id) on delete cascade,
  key text not null check (key in ('tax','tip','service_fee','discount')),
  amount numeric(12,2) not null default 0,
  created_at timestamptz default now(),
  unique (receipt_id, key)
);

alter table profiles enable row level security;
alter table receipts enable row level security;
alter table participants enable row level security;
alter table receipt_items enable row level security;
alter table assignments enable row level security;
alter table receipt_meta enable row level security;

create policy "owner_full_access" on receipts
for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "owner_full_access" on participants
for all using (exists (select 1 from receipts r where r.id = receipt_id and r.owner_id = auth.uid()))
with check (exists (select 1 from receipts r where r.id = receipt_id and r.owner_id = auth.uid()));

create policy "owner_full_access" on receipt_items
for all using (exists (select 1 from receipts r where r.id = receipt_id and r.owner_id = auth.uid()))
with check (exists (select 1 from receipts r where r.id = receipt_id and r.owner_id = auth.uid()));

create policy "owner_full_access" on assignments
for all using (exists (
  select 1 from receipt_items i join receipts r on r.id = i.receipt_id
  where i.id = item_id and r.owner_id = auth.uid()
))
with check (exists (
  select 1 from receipt_items i join receipts r on r.id = i.receipt_id
  where i.id = item_id and r.owner_id = auth.uid()
));

create policy "owner_full_access" on receipt_meta
for all using (exists (select 1 from receipts r where r.id = receipt_id and r.owner_id = auth.uid()))
with check (exists (select 1 from receipts r where r.id = receipt_id and r.owner_id = auth.uid()));

create policy "public_view_select_receipts" on receipts
for select using (public_view_enabled = true);

create policy "public_view_select_participants" on participants
for select using (exists (select 1 from receipts r where r.id = receipt_id and r.public_view_enabled = true));

create policy "public_view_select_items" on receipt_items
for select using (exists (select 1 from receipts r where r.id = receipt_id and r.public_view_enabled = true));

create policy "public_view_select_assignments" on assignments
for select using (exists (
  select 1
  from receipt_items i join receipts r on r.id = i.receipt_id
  where i.id = item_id and r.public_view_enabled = true
));

create policy "public_view_select_meta" on receipt_meta
for select using (exists (select 1 from receipts r where r.id = receipt_id and r.public_view_enabled = true));


