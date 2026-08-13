-- St Loot pre-launch foundation.
-- Payments and prize selection intentionally remain server-only and disabled.

create extension if not exists pgcrypto with schema extensions;

create type public.box_status as enum ('draft', 'preview', 'live', 'paused', 'sold_out', 'archived');
create type public.order_status as enum ('preview', 'pending', 'paid', 'fulfilled', 'refunded', 'cancelled');
create type public.inventory_status as enum ('held', 'redemption_requested', 'processing', 'shipped', 'delivered', 'cancelled');
create type public.ledger_entry_type as enum ('revenue', 'product_cost', 'fulfillment_cost', 'processing_cost', 'operating_cost', 'adjustment', 'donation');

create table public.charities (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null,
  website_url text,
  description text,
  is_placeholder boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partners (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null,
  website_url text,
  logo_url text,
  is_placeholder boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  adult_confirmed_at timestamptz,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default extensions.gen_random_uuid(),
  partner_id uuid references public.partners(id) on delete restrict,
  sku text not null unique,
  name text not null,
  description text,
  image_url text,
  fragrance_family text,
  retail_value_cents integer not null check (retail_value_cents > 0),
  unit_cost_cents integer not null default 0 check (unit_cost_cents >= 0),
  available_inventory integer not null default 0 check (available_inventory >= 0),
  is_placeholder boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.boxes (
  id uuid primary key default extensions.gen_random_uuid(),
  charity_id uuid not null references public.charities(id) on delete restrict,
  slug text not null unique,
  name text not null,
  eyebrow text,
  description text not null,
  image_url text,
  fragrance_family text,
  price_cents integer not null check (price_cents > 0),
  minimum_prize_value_cents integer not null check (minimum_prize_value_cents > 0),
  maximum_prize_value_cents integer not null check (maximum_prize_value_cents >= minimum_prize_value_cents),
  status public.box_status not null default 'draft',
  opens_available integer not null default 0 check (opens_available >= 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.box_prizes (
  box_id uuid not null references public.boxes(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  weight integer not null check (weight > 0),
  allocated_inventory integer not null default 0 check (allocated_inventory >= 0),
  awarded_inventory integer not null default 0 check (awarded_inventory >= 0 and awarded_inventory <= allocated_inventory),
  published_odds numeric(8,7) check (published_odds is null or (published_odds > 0 and published_odds <= 1)),
  created_at timestamptz not null default now(),
  primary key (box_id, product_id)
);

create table public.waitlist_signups (
  id bigint generated always as identity primary key,
  email text not null,
  source text not null default 'homepage',
  created_at timestamptz not null default now(),
  constraint valid_waitlist_email check (char_length(email) between 5 and 320 and position('@' in email) > 1)
);

create unique index waitlist_email_unique on public.waitlist_signups (lower(email));

create table public.orders (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  status public.order_status not null default 'preview',
  currency text not null default 'USD' check (currency = upper(currency) and char_length(currency) = 3),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  processing_cost_cents integer not null default 0 check (processing_cost_cents >= 0),
  operating_cost_cents integer not null default 0 check (operating_cost_cents >= 0),
  charity_proceeds_cents integer not null default 0 check (charity_proceeds_cents >= 0),
  external_payment_reference text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default extensions.gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  box_id uuid not null references public.boxes(id) on delete restrict,
  price_cents integer not null check (price_cents > 0),
  product_cost_cents integer not null default 0 check (product_cost_cents >= 0),
  fulfillment_cost_cents integer not null default 0 check (fulfillment_cost_cents >= 0),
  created_at timestamptz not null default now()
);

create table public.box_openings (
  id uuid primary key default extensions.gen_random_uuid(),
  order_item_id uuid not null unique references public.order_items(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  box_id uuid not null,
  prize_product_id uuid not null,
  fairness_commitment text not null,
  fairness_reveal text,
  opened_at timestamptz not null default now(),
  constraint awarded_prize_belongs_to_box
    foreign key (box_id, prize_product_id)
    references public.box_prizes(box_id, product_id)
    on delete restrict
);

create table public.inventory_items (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  opening_id uuid not null unique references public.box_openings(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  status public.inventory_status not null default 'held',
  shipping_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.impact_ledger (
  id bigint generated always as identity primary key,
  charity_id uuid not null references public.charities(id) on delete restrict,
  order_id uuid references public.orders(id) on delete restrict,
  entry_type public.ledger_entry_type not null,
  amount_cents integer not null check (amount_cents <> 0),
  description text not null,
  source_reference text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.donation_disbursements (
  id uuid primary key default extensions.gen_random_uuid(),
  charity_id uuid not null references public.charities(id) on delete restrict,
  amount_cents integer not null check (amount_cents > 0),
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  status text not null default 'pending' check (status in ('pending', 'sent', 'confirmed', 'failed')),
  receipt_url text,
  external_reference text unique,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'));
  return new;
end;
$$;

create or replace function public.prevent_immutable_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% records are append-only', tg_table_name;
end;
$$;

create trigger set_charities_updated_at before update on public.charities for each row execute function public.set_updated_at();
create trigger set_partners_updated_at before update on public.partners for each row execute function public.set_updated_at();
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger set_boxes_updated_at before update on public.boxes for each row execute function public.set_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger set_inventory_updated_at before update on public.inventory_items for each row execute function public.set_updated_at();
create trigger set_disbursements_updated_at before update on public.donation_disbursements for each row execute function public.set_updated_at();
create trigger protect_box_openings before update or delete on public.box_openings for each row execute function public.prevent_immutable_mutation();
create trigger protect_impact_ledger before update or delete on public.impact_ledger for each row execute function public.prevent_immutable_mutation();
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.charities enable row level security;
alter table public.partners enable row level security;
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.boxes enable row level security;
alter table public.box_prizes enable row level security;
alter table public.waitlist_signups enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.box_openings enable row level security;
alter table public.inventory_items enable row level security;
alter table public.impact_ledger enable row level security;
alter table public.donation_disbursements enable row level security;

create policy "Public reads active charities" on public.charities for select using (is_active);
create policy "Public reads active partners" on public.partners for select using (is_active);
create policy "Public reads active products" on public.products for select using (is_active);
create policy "Public reads published boxes" on public.boxes for select using (status in ('preview', 'live', 'sold_out'));
create policy "Public reads prizes for published boxes" on public.box_prizes for select using (
  exists (select 1 from public.boxes where boxes.id = box_prizes.box_id and boxes.status in ('preview', 'live', 'sold_out'))
);
create policy "Anyone can join waitlist" on public.waitlist_signups for insert with check (
  char_length(email) between 5 and 320 and char_length(source) between 1 and 120
);
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users read own order items" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Users read own openings" on public.box_openings for select using (auth.uid() = user_id);
create policy "Users read own inventory" on public.inventory_items for select using (auth.uid() = user_id);

create view public.public_impact_summary
with (security_invoker = true)
as
select
  c.id as charity_id,
  c.name as charity_name,
  coalesce(sum(case when l.entry_type = 'donation' then abs(l.amount_cents) else 0 end), 0)::bigint as donated_cents,
  coalesce(sum(case when l.entry_type <> 'donation' then l.amount_cents else 0 end), 0)::bigint as designated_balance_cents,
  max(l.occurred_at) as last_ledger_activity_at
from public.charities c
left join public.impact_ledger l on l.charity_id = c.id
where c.is_active
group by c.id, c.name;

grant usage on schema public to anon, authenticated;
grant select on public.charities, public.partners, public.products, public.boxes, public.box_prizes, public.public_impact_summary to anon, authenticated;
grant insert on public.waitlist_signups to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.orders, public.order_items, public.box_openings, public.inventory_items to authenticated;
grant usage, select on sequence public.waitlist_signups_id_seq to anon, authenticated;

insert into public.charities (id, slug, name, website_url, description, is_placeholder)
values (
  '7d8ec87a-bdae-4d7c-b4de-36fa7c054a54',
  'st-jude',
  'St. Jude Children''s Research Hospital',
  'https://www.stjude.org',
  'Intended placeholder beneficiary for the St Loot MVP. No affiliation or endorsement is implied.',
  true
);

insert into public.partners (id, slug, name, is_placeholder)
values (
  '789b1caf-61e9-444c-8f1e-12fa95e502a4',
  'launch-fragrance-partner',
  'Launch fragrance partner',
  true
);

insert into public.products (id, partner_id, sku, name, description, fragrance_family, retail_value_cents, unit_cost_cents, is_placeholder)
values
  ('103de0ba-8c74-4509-8cf5-c5a612e70f26', '789b1caf-61e9-444c-8f1e-12fa95e502a4', 'DEMO-DISC-01', 'Discovery sampler', 'Placeholder fragrance discovery set.', 'Fresh', 2500, 1200, true),
  ('b7e441d4-ad77-42c6-b179-528422079b43', '789b1caf-61e9-444c-8f1e-12fa95e502a4', 'DEMO-TRVL-01', 'Travel fragrance', 'Placeholder travel-size fragrance.', 'Fresh', 4500, 2200, true),
  ('c254ae46-e1a9-4105-abf6-38640261165c', '789b1caf-61e9-444c-8f1e-12fa95e502a4', 'DEMO-SIGN-01', 'Signature bottle', 'Placeholder full-size signature fragrance.', 'Warm', 8500, 3900, true),
  ('2e626297-0564-4590-bf9e-d3a1fd3ba00c', '789b1caf-61e9-444c-8f1e-12fa95e502a4', 'DEMO-LTD-01', 'Limited bottle', 'Placeholder small-batch fragrance.', 'Warm', 14000, 6500, true),
  ('1732bc4e-dbbc-4dd9-96d9-3dc4c07ee9f2', '789b1caf-61e9-444c-8f1e-12fa95e502a4', 'DEMO-RARE-01', 'Rare edition', 'Placeholder rare-edition fragrance.', 'Rare', 30000, 13200, true),
  ('65376754-7f0e-4144-bb21-c6d932f634de', '789b1caf-61e9-444c-8f1e-12fa95e502a4', 'DEMO-ATEL-01', 'Atelier collector bottle', 'Placeholder collector fragrance.', 'Rare', 45000, 19800, true);

insert into public.boxes (id, charity_id, slug, name, eyebrow, description, fragrance_family, price_cents, minimum_prize_value_cents, maximum_prize_value_cents, status)
values
  ('496e6f81-cae5-4687-91dd-26419cbb58bd', '7d8ec87a-bdae-4d7c-b4de-36fa7c054a54', 'discovery-drop', 'Discovery Drop', 'The first spritz', 'A guaranteed fragrance discovery from an emerging perfume house.', 'Fresh', 2500, 2500, 6000, 'preview'),
  ('7b237251-ea76-44c5-ae61-ec5ba60406ef', '7d8ec87a-bdae-4d7c-b4de-36fa7c054a54', 'signature-vault', 'Signature Vault', 'Most loved', 'Full bottles, travel sets, and limited discovery collections.', 'Warm', 5000, 5000, 14000, 'preview'),
  ('31bd093b-eb33-4b5c-803f-440687465fc0', '7d8ec87a-bdae-4d7c-b4de-36fa7c054a54', 'collectors-edit', 'Collector''s Edit', 'Small batch', 'Rare editions and premium bottles selected for fragrance collectors.', 'Rare', 10000, 10000, 30000, 'preview');

insert into public.box_prizes (box_id, product_id, weight)
values
  ('496e6f81-cae5-4687-91dd-26419cbb58bd', '103de0ba-8c74-4509-8cf5-c5a612e70f26', 75),
  ('496e6f81-cae5-4687-91dd-26419cbb58bd', 'b7e441d4-ad77-42c6-b179-528422079b43', 25),
  ('7b237251-ea76-44c5-ae61-ec5ba60406ef', 'b7e441d4-ad77-42c6-b179-528422079b43', 50),
  ('7b237251-ea76-44c5-ae61-ec5ba60406ef', 'c254ae46-e1a9-4105-abf6-38640261165c', 35),
  ('7b237251-ea76-44c5-ae61-ec5ba60406ef', '2e626297-0564-4590-bf9e-d3a1fd3ba00c', 15),
  ('31bd093b-eb33-4b5c-803f-440687465fc0', '2e626297-0564-4590-bf9e-d3a1fd3ba00c', 72),
  ('31bd093b-eb33-4b5c-803f-440687465fc0', '1732bc4e-dbbc-4dd9-96d9-3dc4c07ee9f2', 23),
  ('31bd093b-eb33-4b5c-803f-440687465fc0', '65376754-7f0e-4144-bb21-c6d932f634de', 5);
