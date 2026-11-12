-- Kundu Electronics production schema foundation.
-- Currency unit: all monetary columns are whole Bangladeshi Taka (BDT), stored as BIGINT.
-- This migration has NOT been applied to a Supabase project. Review and test in staging first.
-- Public product data intentionally contains no purchase cost, supplier or margin fields.

begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create type public.admin_role as enum ('admin', 'staff');
create type public.catalogue_status as enum ('draft', 'review', 'published', 'archived');
create type public.stock_tracking_mode as enum ('unknown', 'tracked', 'untracked');
create type public.public_availability_status as enum (
  'unknown', 'in_stock', 'low_stock', 'out_of_stock',
  'availability_on_request', 'backorder', 'discontinued', 'build_to_order'
);
create type public.order_status as enum (
  'pending_stock_confirmation', 'awaiting_payment', 'confirmed', 'cancelled'
);
create type public.stock_status as enum (
  'pending_confirmation', 'reserved', 'confirmed_untracked', 'unavailable'
);
create type public.fulfilment_status as enum (
  'unfulfilled', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'
);
create type public.payment_method as enum ('bkash', 'nagad');
create type public.payment_status as enum (
  'not_submitted', 'pending_verification', 'verified', 'rejected', 'refunded'
);
create type public.payment_submission_status as enum (
  'pending_verification', 'verified', 'rejected'
);
create type public.reservation_status as enum ('active', 'released', 'consumed', 'expired');
create type public.inventory_movement_type as enum (
  'receipt', 'adjustment_increase', 'adjustment_decrease',
  'reservation', 'reservation_release', 'fulfilment'
);
create type public.payment_event_type as enum ('submitted', 'verified', 'rejected');

-- Staff profiles are provisioned out-of-band by the project owner.
-- Authenticated users receive no INSERT/UPDATE/DELETE grant on this table.
create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.admin_role not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create or replace function public.has_store_role(p_roles public.admin_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.user_id = (select auth.uid())
      and ap.role = any (p_roles)
  );
$$;

revoke all on function public.has_store_role(public.admin_role[]) from public;
grant execute on function public.has_store_role(public.admin_role[]) to anon, authenticated;

create or replace function public.is_store_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_store_role(array['admin', 'staff']::public.admin_role[]);
$$;

create or replace function public.is_store_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_store_role(array['admin']::public.admin_role[]);
$$;

revoke all on function public.is_store_staff() from public;
revoke all on function public.is_store_admin() from public;
grant execute on function public.is_store_staff() to anon, authenticated;
grant execute on function public.is_store_admin() to anon, authenticated;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) between 1 and 120),
  description text,
  status public.catalogue_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_id is null or parent_id <> id)
);

create index categories_parent_sort_idx on public.categories(parent_id, sort_order, name);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete restrict,
  sku text,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) between 1 and 180),
  brand text,
  short_description text,
  description text,
  price_bdt bigint check (price_bdt is null or price_bdt between 1 and 1000000000),
  status public.catalogue_status not null default 'draft',
  public_availability public.public_availability_status not null default 'unknown',
  orderable boolean not null default false,
  sort_order integer not null default 0,
  search_document tsvector generated always as (
    setweight(to_tsvector('simple'::regconfig, coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(sku, '')), 'B') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(brand, '')), 'C') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(short_description, '')), 'D')
  ) stored,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'published' or (price_bdt is not null and category_id is not null)),
  check (not orderable or public_availability in ('in_stock', 'low_stock', 'backorder', 'build_to_order'))
);

create index products_category_status_price_idx on public.products(category_id, status, price_bdt);
create index products_search_document_idx on public.products using gin(search_document);
create unique index products_sku_unique_idx on public.products(sku) where sku is not null;

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text,
  name text not null check (length(btrim(name)) between 1 and 120),
  option_values jsonb not null default '{}'::jsonb check (jsonb_typeof(option_values) = 'object'),
  price_override_bdt bigint check (price_override_bdt is null or price_override_bdt between 1 and 1000000000),
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, name)
);

create unique index product_variants_sku_unique_idx on public.product_variants(sku) where sku is not null;
create index product_variants_product_active_idx on public.product_variants(product_id, is_active, sort_order);


-- Serialize variant-set changes with checkout's product-row locks. Checkout can then
-- safely require a selected option whenever active variants exist and lock its price.
create or replace function private.lock_parent_product_for_variant_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product_id uuid;
begin
  if tg_op = 'DELETE' then
    v_product_id := old.product_id;
  else
    v_product_id := new.product_id;
  end if;
  perform 1 from public.products p where p.id = v_product_id for update;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function private.lock_parent_product_for_variant_change() from public, anon, authenticated;
create trigger product_variants_lock_parent
before insert or update or delete on public.product_variants
for each row execute function private.lock_parent_product_for_variant_change();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null unique,
  alt_text text not null check (length(btrim(alt_text)) between 1 and 300),
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index product_images_one_primary_idx on public.product_images(product_id) where is_primary;
create index product_images_product_sort_idx on public.product_images(product_id, sort_order);


create table public.product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null check (length(btrim(label)) between 1 and 100),
  value text not null check (length(btrim(value)) between 1 and 500),
  unit text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index product_specifications_product_sort_idx on public.product_specifications(product_id, sort_order);

-- Inventory is deliberately private. Unknown quantities are NULL, not zero or in-stock.
create table public.product_inventory (
  product_id uuid primary key references public.products(id) on delete cascade,
  tracking_mode public.stock_tracking_mode not null default 'unknown',
  quantity_on_hand bigint,
  quantity_reserved bigint not null default 0 check (quantity_reserved >= 0),
  low_stock_threshold bigint check (low_stock_threshold is null or low_stock_threshold >= 0),
  updated_at timestamptz not null default now(),
  check (
    (tracking_mode = 'tracked' and quantity_on_hand is not null and quantity_on_hand >= 0 and quantity_reserved <= quantity_on_hand)
    or
    (tracking_mode in ('unknown', 'untracked') and quantity_on_hand is null and quantity_reserved = 0)
  )
);

create table public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (length(btrim(full_name)) between 1 and 160),
  phone text not null check (length(btrim(phone)) between 7 and 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_name text not null check (length(btrim(recipient_name)) between 1 and 160),
  phone text not null check (length(btrim(phone)) between 7 and 32),
  address_line_1 text not null check (length(btrim(address_line_1)) between 1 and 220),
  address_line_2 text,
  area text,
  city text not null check (length(btrim(city)) between 1 and 120),
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index customer_addresses_one_default_idx on public.customer_addresses(user_id) where is_default;
create index customer_addresses_user_idx on public.customer_addresses(user_id, created_at desc);

create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) between 1 and 120),
  coverage_description text,
  delivery_charge_bdt bigint check (delivery_charge_bdt is null or delivery_charge_bdt between 0 and 1000000),
  is_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not is_enabled or delivery_charge_bdt is not null)
);

create table public.payment_method_settings (
  method public.payment_method primary key,
  is_enabled boolean not null default false,
  receiving_number text,
  customer_instructions text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  check (
    not is_enabled
    or (nullif(btrim(receiving_number), '') is not null and nullif(btrim(customer_instructions), '') is not null)
  )
);

insert into public.payment_method_settings(method, is_enabled) values
  ('bkash', false), ('nagad', false)
on conflict (method) do nothing;

create table public.store_settings (
  singleton boolean primary key default true check (singleton),
  checkout_enabled boolean not null default false,
  reservation_ttl_minutes integer check (reservation_ttl_minutes is null or reservation_ttl_minutes > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.store_settings(singleton, checkout_enabled, reservation_ttl_minutes)
values (true, false, null)
on conflict (singleton) do nothing;

create sequence public.order_number_sequence;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  idempotency_key uuid not null unique,
  request_fingerprint text not null check (request_fingerprint ~ '^[0-9a-f]{64}$'),
  order_access_token_hash text not null unique check (order_access_token_hash ~ '^[0-9a-f]{64}$'),
  customer_user_id uuid references auth.users(id) on delete set null,
  customer_name text not null check (length(btrim(customer_name)) between 1 and 160),
  customer_phone text not null check (length(btrim(customer_phone)) between 7 and 32),
  customer_email text,
  delivery_zone_id uuid not null references public.delivery_zones(id) on delete restrict,
  delivery_zone_name_snapshot text not null,
  delivery_address_line_1 text not null,
  delivery_address_line_2 text,
  delivery_area text,
  delivery_city text not null,
  delivery_postal_code text,
  customer_note text,
  order_status public.order_status not null default 'pending_stock_confirmation',
  stock_status public.stock_status not null default 'pending_confirmation',
  fulfilment_status public.fulfilment_status not null default 'unfulfilled',
  payment_status public.payment_status not null default 'not_submitted',
  subtotal_bdt bigint not null check (subtotal_bdt >= 0),
  delivery_charge_bdt bigint not null check (delivery_charge_bdt >= 0),
  total_bdt bigint not null check (total_bdt >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total_bdt = subtotal_bdt + delivery_charge_bdt),
  check (order_status <> 'awaiting_payment' or stock_status in ('reserved', 'confirmed_untracked'))
);

create index orders_created_idx on public.orders(created_at desc);
create index orders_status_idx on public.orders(order_status, created_at desc);
create index orders_payment_status_idx on public.orders(payment_status, created_at desc);
create index orders_customer_idx on public.orders(customer_user_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  sku_snapshot text,
  product_name_snapshot text not null,
  variant_name_snapshot text,
  unit_price_bdt bigint not null check (unit_price_bdt > 0),
  quantity integer not null check (quantity between 1 and 99),
  line_total_bdt bigint not null check (line_total_bdt > 0),
  created_at timestamptz not null default now(),
  check (line_total_bdt = unit_price_bdt * quantity)
);

create index order_items_order_idx on public.order_items(order_id);
create index order_items_product_idx on public.order_items(product_id);

create table public.stock_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  order_item_id uuid not null unique references public.order_items(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity bigint not null check (quantity > 0),
  status public.reservation_status not null default 'active',
  expires_at timestamptz,
  released_at timestamptz,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  check ((status = 'active' and released_at is null and consumed_at is null) or status <> 'active')
);

create index stock_reservations_active_expiry_idx on public.stock_reservations(status, expires_at) where status = 'active';
create index stock_reservations_order_idx on public.stock_reservations(order_id, status);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  order_id uuid references public.orders(id) on delete restrict,
  movement_type public.inventory_movement_type not null,
  quantity_on_hand_delta bigint not null default 0,
  quantity_reserved_delta bigint not null default 0,
  reason text not null check (length(btrim(reason)) between 3 and 500),
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (quantity_on_hand_delta <> 0 or quantity_reserved_delta <> 0)
);

create index inventory_movements_product_created_idx on public.inventory_movements(product_id, created_at desc);
create index inventory_movements_order_idx on public.inventory_movements(order_id) where order_id is not null;

create table public.payment_submissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  idempotency_key uuid not null unique,
  method public.payment_method not null,
  sender_phone text not null check (length(btrim(sender_phone)) between 7 and 32),
  transaction_reference text not null check (length(btrim(transaction_reference)) between 4 and 100),
  normalized_reference text generated always as (
    lower(regexp_replace(btrim(transaction_reference), '\\s+', '', 'g'))
  ) stored,
  amount_bdt bigint not null check (amount_bdt > 0),
  status public.payment_submission_status not null default 'pending_verification',
  rejection_reason text,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  submitted_at timestamptz not null default now(),
  check (
    (status = 'verified' and verified_by is not null and verified_at is not null and rejection_reason is null)
    or (status = 'rejected' and verified_by is not null and verified_at is not null and nullif(btrim(rejection_reason), '') is not null)
    or (status = 'pending_verification' and verified_by is null and verified_at is null and rejection_reason is null)
  )
);

create unique index payment_submissions_reference_unique_idx on public.payment_submissions(method, normalized_reference);
create index payment_submissions_order_idx on public.payment_submissions(order_id, submitted_at desc);
create index payment_submissions_status_idx on public.payment_submissions(status, submitted_at desc);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_submission_id uuid not null references public.payment_submissions(id) on delete restrict,
  event_type public.payment_event_type not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  note text check (note is null or length(note) <= 500),
  created_at timestamptz not null default now()
);

create index payment_events_submission_idx on public.payment_events(payment_submission_id, created_at);

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  event_type text not null check (length(btrim(event_type)) between 1 and 80),
  from_status text,
  to_status text,
  actor_user_id uuid references auth.users(id) on delete set null,
  note text check (note is null or length(note) <= 500),
  created_at timestamptz not null default now()
);

create index order_events_order_idx on public.order_events(order_id, created_at);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (length(btrim(action)) between 1 and 100),
  resource_type text not null check (length(btrim(resource_type)) between 1 and 80),
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index audit_events_created_idx on public.audit_events(created_at desc);
create index audit_events_resource_idx on public.audit_events(resource_type, resource_id, created_at desc);

-- Primary-image selection is atomic and serialized per product.
create or replace function public.set_primary_product_image(p_product_id uuid, p_image_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_store_staff() then
    raise exception using errcode = '42501', message = 'Staff permission required';
  end if;
  perform 1 from public.products p where p.id = p_product_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Product not found';
  end if;
  perform 1 from public.product_images i where i.id = p_image_id and i.product_id = p_product_id for share;
  if not found then
    raise exception using errcode = 'P0002', message = 'Product image not found';
  end if;
  update public.product_images set is_primary = false where product_id = p_product_id and is_primary;
  update public.product_images set is_primary = true where id = p_image_id and product_id = p_product_id;
  insert into public.audit_events(actor_user_id, action, resource_type, resource_id, metadata)
  values ((select auth.uid()), 'product_image_primary_changed', 'product', p_product_id,
    jsonb_build_object('image_id', p_image_id));
end;
$$;
revoke all on function public.set_primary_product_image(uuid, uuid) from public, anon;
grant execute on function public.set_primary_product_image(uuid, uuid) to authenticated;


-- Rate-limit identifiers must be HMACs created by trusted server code, never raw IP addresses.
create table public.rate_limit_windows (
  scope text not null check (length(btrim(scope)) between 1 and 80),
  identifier_hash text not null check (identifier_hash ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key(scope, identifier_hash)
);

-- Publication guards and private audit triggers. These rules live in PostgreSQL so they
-- remain effective even when an authenticated staff user bypasses the Next.js forms.
create or replace function private.enforce_product_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_category_status public.catalogue_status;
  v_parent_id uuid;
  v_parent_status public.catalogue_status;
begin
  if new.status = 'published' then
    if new.category_id is null or new.price_bdt is null or new.price_bdt <= 0 then
      raise exception using errcode = '23514', message = 'A published product requires a category and confirmed positive selling price';
    end if;
    select c.status, c.parent_id into v_category_status, v_parent_id
      from public.categories c where c.id = new.category_id;
    if not found or v_category_status <> 'published' then
      raise exception using errcode = '23514', message = 'A published product must belong to a published category';
    end if;
    if v_parent_id is not null then
      select p.status into v_parent_status from public.categories p where p.id = v_parent_id;
      if not found or v_parent_status <> 'published' then
        raise exception using errcode = '23514', message = 'A published product category must have published ancestors';
      end if;
    end if;
    if tg_op = 'INSERT' or old.status <> 'published' or new.published_at is null then
      new.published_at := now();
    end if;
  else
    new.published_at := null;
  end if;
  return new;
end;
$$;
revoke all on function private.enforce_product_publication() from public, anon, authenticated;
create trigger products_enforce_publication before insert or update of status, category_id, price_bdt
on public.products for each row execute function private.enforce_product_publication();

create or replace function private.enforce_category_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent_status public.catalogue_status;
begin
  if new.status = 'published' and new.parent_id is not null then
    select p.status into v_parent_status from public.categories p where p.id = new.parent_id;
    if not found or v_parent_status <> 'published' then
      raise exception using errcode = '23514', message = 'A published category must have a published parent category';
    end if;
    if exists (
      with recursive ancestors(id, parent_id) as (
        select c.id, c.parent_id from public.categories c where c.id = new.parent_id
        union
        select p.id, p.parent_id from public.categories p join ancestors a on p.id = a.parent_id
      ) select 1 from ancestors where id = new.id
    ) then
      raise exception using errcode = '23514', message = 'Category hierarchy cannot contain a cycle';
    end if;
  end if;
  if tg_op = 'UPDATE' and old.status = 'published' and new.status <> 'published' then
    if exists (select 1 from public.categories child where child.parent_id = old.id and child.status = 'published')
       or exists (select 1 from public.products product where product.category_id = old.id and product.status = 'published') then
      raise exception using errcode = '23514', message = 'Unpublish child categories and products before unpublishing this category';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.enforce_category_publication() from public, anon, authenticated;
create trigger categories_enforce_publication before insert or update of status, parent_id
on public.categories for each row execute function private.enforce_category_publication();

create or replace function private.audit_catalogue_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row jsonb;
  v_id uuid;
  v_parent_id uuid;
  v_metadata jsonb;
  v_action text := lower(tg_op);
begin
  if tg_op = 'DELETE' then v_row := to_jsonb(old); else v_row := to_jsonb(new); end if;
  v_id := (v_row->>'id')::uuid;
  if tg_table_name = 'products' then
    v_metadata := jsonb_build_object('name', v_row->>'name', 'sku', v_row->>'sku',
      'price_bdt', v_row->>'price_bdt', 'status', v_row->>'status',
      'category_id', v_row->>'category_id', 'orderable', v_row->>'orderable');
  elsif tg_table_name = 'categories' then
    v_metadata := jsonb_build_object('name', v_row->>'name', 'slug', v_row->>'slug',
      'status', v_row->>'status', 'parent_id', v_row->>'parent_id');
  else
    v_parent_id := nullif(v_row->>'product_id', '')::uuid;
    v_metadata := jsonb_build_object('product_id', v_parent_id);
  end if;
  insert into public.audit_events(actor_user_id, action, resource_type, resource_id, metadata)
  values ((select auth.uid()), 'catalogue_' || v_action, tg_table_name, v_id, v_metadata);
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;
revoke all on function private.audit_catalogue_change() from public, anon, authenticated;
create trigger products_audit after insert or update or delete on public.products
for each row execute function private.audit_catalogue_change();
create trigger categories_audit after insert or update or delete on public.categories
for each row execute function private.audit_catalogue_change();
create trigger product_variants_audit after insert or update or delete on public.product_variants
for each row execute function private.audit_catalogue_change();
create trigger product_images_audit after insert or update or delete on public.product_images
for each row execute function private.audit_catalogue_change();
create trigger product_specifications_audit after insert or update or delete on public.product_specifications
for each row execute function private.audit_catalogue_change();

create or replace function private.audit_store_configuration()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row jsonb;
  v_id uuid;
  v_metadata jsonb;
begin
  if tg_op = 'DELETE' then v_row := to_jsonb(old); else v_row := to_jsonb(new); end if;
  v_id := nullif(v_row->>'id', '')::uuid;
  if tg_table_name = 'payment_method_settings' then
    v_metadata := jsonb_build_object('method', v_row->>'method', 'is_enabled', v_row->>'is_enabled');
  elsif tg_table_name = 'delivery_zones' then
    v_metadata := jsonb_build_object('code', v_row->>'code', 'name', v_row->>'name',
      'delivery_charge_bdt', v_row->>'delivery_charge_bdt', 'is_enabled', v_row->>'is_enabled');
  else
    v_metadata := jsonb_build_object('checkout_enabled', v_row->>'checkout_enabled');
  end if;
  insert into public.audit_events(actor_user_id, action, resource_type, resource_id, metadata)
  values ((select auth.uid()), 'settings_' || lower(tg_op), tg_table_name, v_id, v_metadata);
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;
revoke all on function private.audit_store_configuration() from public, anon, authenticated;
create trigger payment_settings_audit after insert or update or delete on public.payment_method_settings
for each row execute function private.audit_store_configuration();
create trigger delivery_zones_audit after insert or update or delete on public.delivery_zones
for each row execute function private.audit_store_configuration();
create trigger store_settings_audit after insert or update or delete on public.store_settings
for each row execute function private.audit_store_configuration();

-- Common timestamp trigger.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();
create trigger product_variants_set_updated_at before update on public.product_variants
for each row execute function public.set_updated_at();
create trigger inventory_set_updated_at before update on public.product_inventory
for each row execute function public.set_updated_at();
create trigger customer_profiles_set_updated_at before update on public.customer_profiles
for each row execute function public.set_updated_at();
create trigger customer_addresses_set_updated_at before update on public.customer_addresses
for each row execute function public.set_updated_at();
create trigger delivery_zones_set_updated_at before update on public.delivery_zones
for each row execute function public.set_updated_at();
create trigger payment_settings_set_updated_at before update on public.payment_method_settings
for each row execute function public.set_updated_at();
create trigger store_settings_set_updated_at before update on public.store_settings
for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

-- Every product starts with explicitly unknown stock until staff enter a real stock state.
create or replace function public.ensure_product_inventory_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.product_inventory(product_id, tracking_mode, quantity_on_hand, quantity_reserved)
  values (new.id, 'unknown', null, 0)
  on conflict (product_id) do nothing;
  return new;
end;
$$;

revoke all on function public.ensure_product_inventory_row() from public, anon, authenticated;
create trigger products_create_inventory_row after insert on public.products
for each row execute function public.ensure_product_inventory_row();

create or replace function public.sync_public_availability_from_inventory()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_available bigint;
begin
  if new.tracking_mode = 'tracked' then
    v_available := new.quantity_on_hand - new.quantity_reserved;
    update public.products
       set public_availability = case
         when v_available <= 0 then 'out_of_stock'::public.public_availability_status
         when new.low_stock_threshold is not null and v_available <= new.low_stock_threshold then 'low_stock'::public.public_availability_status
         else 'in_stock'::public.public_availability_status
       end
     where id = new.product_id;
  elsif new.tracking_mode = 'untracked' then
    update public.products set public_availability = 'availability_on_request' where id = new.product_id;
  else
    update public.products set public_availability = 'unknown' where id = new.product_id;
  end if;
  return new;
end;
$$;

revoke all on function public.sync_public_availability_from_inventory() from public, anon, authenticated;
create trigger inventory_sync_public_availability after insert or update of tracking_mode, quantity_on_hand, quantity_reserved, low_stock_threshold
on public.product_inventory for each row execute function public.sync_public_availability_from_inventory();

-- Public catalogue views expose only storefront-safe fields and obey the caller's RLS.
create view public.catalog_categories with (security_invoker = true) as
select c.id, c.parent_id, c.slug, c.name, c.description, c.sort_order
from public.categories c
where c.status = 'published';

create view public.catalog_products with (security_invoker = true) as
select
  p.id, p.category_id, p.sku, p.slug, p.name, p.brand,
  p.short_description, p.description, p.price_bdt,
  p.public_availability, p.orderable, p.sort_order, p.published_at
from public.products p
join public.categories c on c.id = p.category_id and c.status = 'published'
where p.status = 'published';

create view public.catalog_product_variants with (security_invoker = true) as
select v.id, v.product_id, v.sku, v.name, v.option_values, v.price_override_bdt, v.sort_order
from public.product_variants v
join public.products p on p.id = v.product_id and p.status = 'published'
where v.is_active;

create view public.catalog_product_images with (security_invoker = true) as
select i.id, i.product_id, i.storage_path, i.alt_text, i.sort_order, i.is_primary
from public.product_images i
join public.products p on p.id = i.product_id and p.status = 'published';

create view public.catalog_product_specifications with (security_invoker = true) as
select s.id, s.product_id, s.label, s.value, s.unit, s.sort_order
from public.product_specifications s
join public.products p on p.id = s.product_id and p.status = 'published';

-- A single-character prefix search (e.g. "b") is handled separately so it can find
-- Breadboard without relying on a one-character full-text token. Longer searches use ILIKE.
create or replace function public.search_catalog_products(
  p_query text default '',
  p_category_slug text default null,
  p_min_price_bdt bigint default null,
  p_max_price_bdt bigint default null,
  p_sort text default 'relevance',
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  id uuid,
  slug text,
  name text,
  sku text,
  brand text,
  short_description text,
  price_bdt bigint,
  public_availability public.public_availability_status,
  category_slug text,
  primary_image_path text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_query text := lower(btrim(coalesce(p_query, '')));
  v_sanitized_query text;
  v_prefix_query text;
begin
  if p_min_price_bdt is not null and p_min_price_bdt < 0 then
    raise exception using errcode = '22023', message = 'Minimum price must not be negative';
  end if;
  if p_max_price_bdt is not null and p_max_price_bdt < 0 then
    raise exception using errcode = '22023', message = 'Maximum price must not be negative';
  end if;
  if p_min_price_bdt is not null and p_max_price_bdt is not null and p_min_price_bdt > p_max_price_bdt then
    raise exception using errcode = '22023', message = 'Minimum price cannot exceed maximum price';
  end if;
  if length(v_query) > 120 then
    raise exception using errcode = '22023', message = 'Search query is too long';
  end if;
  if p_sort is null or p_sort not in ('relevance', 'price_asc', 'price_desc', 'name_asc', 'newest') then
    raise exception using errcode = '22023', message = 'Unsupported sort order';
  end if;
  if p_limit is null or p_limit < 1 or p_limit > 100 or p_offset is null or p_offset < 0 or p_offset > 10000 then
    raise exception using errcode = '22023', message = 'Invalid pagination values';
  end if;

  v_sanitized_query := regexp_replace(v_query, '[^[:alnum:]_]+', ' ', 'g');
  select string_agg(token || ':*', ' & ') into v_prefix_query
    from regexp_split_to_table(v_sanitized_query, '\s+') as token
   where token <> '';

  return query
  select
    p.id, p.slug, p.name, p.sku, p.brand, p.short_description, p.price_bdt,
    p.public_availability, c.slug,
    (select i.storage_path from public.product_images i
      where i.product_id = p.id order by i.is_primary desc, i.sort_order asc limit 1)
  from public.products p
  join public.categories c on c.id = p.category_id and c.status = 'published'
  where p.status = 'published'
    and (p_category_slug is null or c.slug = p_category_slug)
    and (p_min_price_bdt is null or p.price_bdt >= p_min_price_bdt)
    and (p_max_price_bdt is null or p.price_bdt <= p_max_price_bdt)
    and (
      v_query = ''
      or (v_prefix_query is not null and p.search_document @@ to_tsquery('simple'::regconfig, v_prefix_query))
      or strpos(lower(p.name), v_query) > 0
      or strpos(lower(coalesce(p.sku, '')), v_query) > 0
      or strpos(lower(coalesce(p.brand, '')), v_query) > 0
    )
  order by
    case when p_sort = 'relevance' and v_query <> '' and lower(p.name) = v_query then 0 else 1 end,
    case when p_sort = 'price_asc' then p.price_bdt end asc nulls last,
    case when p_sort = 'price_desc' then p.price_bdt end desc nulls last,
    case when p_sort = 'name_asc' then lower(p.name) end asc nulls last,
    case when p_sort = 'newest' then p.published_at end desc nulls last,
    p.sort_order asc,
    p.name asc
  limit p_limit offset p_offset;
end;
$$;

revoke all on function public.search_catalog_products(text, text, bigint, bigint, text, integer, integer) from public;
grant execute on function public.search_catalog_products(text, text, bigint, bigint, text, integer, integer) to anon, authenticated;

-- Atomic checkout: only trusted server code (service_role) may call this function.
-- The browser sends product IDs/variant IDs/quantities only. Prices, stock and delivery fee are loaded here.
create or replace function public.create_checkout_order(
  p_idempotency_key uuid,
  p_request_fingerprint text,
  p_order_access_token_hash text,
  p_customer_details jsonb,
  p_items jsonb,
  p_delivery_zone_id uuid,
  p_customer_user_id uuid default null
)
returns table (
  order_id uuid,
  order_number text,
  order_status public.order_status,
  stock_status public.stock_status,
  subtotal_bdt bigint,
  delivery_charge_bdt bigint,
  total_bdt bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.orders%rowtype;
  v_order_id uuid := gen_random_uuid();
  v_order_number text;
  v_customer_name text;
  v_customer_phone text;
  v_customer_email text;
  v_address_line_1 text;
  v_address_line_2 text;
  v_area text;
  v_city text;
  v_postal_code text;
  v_zone_name text;
  v_delivery_charge bigint;
  v_subtotal bigint := 0;
  v_total bigint;
  v_requires_stock_confirmation boolean := false;
  v_group record;
  v_item jsonb;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_inventory public.product_inventory%rowtype;
  v_variant_id uuid;
  v_quantity integer;
  v_unit_price bigint;
  v_line_total bigint;
  v_ttl_minutes integer;
  v_new_order_status public.order_status;
  v_new_stock_status public.stock_status;
  v_order_item_id uuid;
begin
  if p_idempotency_key is null
     or p_request_fingerprint is null or p_request_fingerprint !~ '^[0-9a-f]{64}$'
     or p_order_access_token_hash is null or p_order_access_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'Invalid checkout idempotency metadata';
  end if;
  if p_customer_details is null or p_items is null
     or jsonb_typeof(p_customer_details) <> 'object' or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 40 then
    raise exception using errcode = '22023', message = 'Invalid checkout payload';
  end if;

  -- Serialize retries using the same client-generated idempotency key.
  perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key::text, 0));
  select * into v_existing from public.orders o where o.idempotency_key = p_idempotency_key;
  if found then
    if v_existing.request_fingerprint <> p_request_fingerprint
       or v_existing.order_access_token_hash <> p_order_access_token_hash then
      raise exception using errcode = '22023', message = 'Idempotency key was already used for a different checkout';
    end if;
    return query select v_existing.id, v_existing.order_number, v_existing.order_status,
      v_existing.stock_status, v_existing.subtotal_bdt, v_existing.delivery_charge_bdt, v_existing.total_bdt;
    return;
  end if;

  select nullif(btrim(p_customer_details->>'name'), ''),
         nullif(btrim(p_customer_details->>'phone'), ''),
         nullif(btrim(p_customer_details->>'email'), ''),
         nullif(btrim(p_customer_details->>'addressLine1'), ''),
         nullif(btrim(p_customer_details->>'addressLine2'), ''),
         nullif(btrim(p_customer_details->>'area'), ''),
         nullif(btrim(p_customer_details->>'city'), ''),
         nullif(btrim(p_customer_details->>'postalCode'), '')
    into v_customer_name, v_customer_phone, v_customer_email, v_address_line_1,
         v_address_line_2, v_area, v_city, v_postal_code;

  if v_customer_name is null or length(v_customer_name) > 160
     or v_customer_phone is null or length(v_customer_phone) > 32
     or v_customer_phone !~ '^[+0-9() .-]{7,32}$'
     or v_address_line_1 is null or length(v_address_line_1) > 220
     or v_city is null or length(v_city) > 120
     or (v_customer_email is not null and (length(v_customer_email) > 254 or v_customer_email !~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$')) then
    raise exception using errcode = '22023', message = 'Customer or delivery details are incomplete or invalid';
  end if;

  if coalesce((select s.checkout_enabled from public.store_settings s where s.singleton), false) is not true
     or not exists (select 1 from public.payment_method_settings pms where pms.is_enabled
       and nullif(btrim(pms.receiving_number), '') is not null
       and nullif(btrim(pms.customer_instructions), '') is not null) then
    raise exception using errcode = '55000', message = 'Checkout and at least one manual payment method must be configured';
  end if;

  select z.name, z.delivery_charge_bdt
    into v_zone_name, v_delivery_charge
    from public.delivery_zones z
   where z.id = p_delivery_zone_id and z.is_enabled and z.delivery_charge_bdt is not null;
  if not found then
    raise exception using errcode = '22023', message = 'Delivery area is not available or has no configured charge';
  end if;

  -- Lock products/inventory in stable product-id order to reduce deadlock risk.
  for v_group in
    select (entry.value->>'productId')::uuid as product_id,
           sum((entry.value->>'quantity')::integer)::bigint as total_quantity
      from jsonb_array_elements(p_items) as entry(value)
     group by (entry.value->>'productId')::uuid
     order by (entry.value->>'productId')::uuid
  loop
    select p.* into v_product
      from public.products p
      join public.categories c on c.id = p.category_id and c.status = 'published'
     where p.id = v_group.product_id and p.status = 'published' and p.orderable
     for update of p;
    if not found then
      raise exception using errcode = 'P0001', message = 'One or more products are not currently orderable';
    end if;

    select i.* into v_inventory
      from public.product_inventory i
     where i.product_id = v_group.product_id
     for update;
    if not found then
      raise exception using errcode = 'P0001', message = 'Product inventory state has not been configured';
    end if;

    if v_inventory.tracking_mode = 'tracked' then
      if v_inventory.quantity_on_hand - v_inventory.quantity_reserved < v_group.total_quantity then
        raise exception using errcode = 'P0001', message = 'Insufficient available stock for one or more products';
      end if;
    else
      v_requires_stock_confirmation := true;
    end if;
  end loop;

  -- Resolve current prices and immutable customer/order item snapshots inside this transaction.
  for v_item in
    select entry.value
      from jsonb_array_elements(p_items) as entry(value)
     order by (entry.value->>'productId')::uuid, coalesce(entry.value->>'variantId', '')
  loop
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity < 1 or v_quantity > 99 then
      raise exception using errcode = '22023', message = 'Product quantity must be between 1 and 99';
    end if;

    select p.* into v_product
      from public.products p
     where p.id = (v_item->>'productId')::uuid and p.status = 'published' and p.orderable;
    if not found then
      raise exception using errcode = 'P0001', message = 'One or more products are no longer available';
    end if;

    v_variant_id := nullif(v_item->>'variantId', '')::uuid;
    v_unit_price := v_product.price_bdt;
    if v_variant_id is not null then
      select v.* into v_variant
        from public.product_variants v
       where v.id = v_variant_id and v.product_id = v_product.id and v.is_active
       for share;
      if not found then
        raise exception using errcode = 'P0001', message = 'A selected product option is unavailable';
      end if;
      v_unit_price := coalesce(v_variant.price_override_bdt, v_product.price_bdt);
    else
      if exists (select 1 from public.product_variants v where v.product_id = v_product.id and v.is_active) then
        raise exception using errcode = '22023', message = 'A product option must be selected';
      end if;
      v_variant := null;
    end if;

    if v_unit_price is null or v_unit_price <= 0 then
      raise exception using errcode = 'P0001', message = 'A product does not have a confirmed selling price';
    end if;

    v_line_total := v_unit_price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;
    if v_subtotal > 1000000000 then
      raise exception using errcode = '22003', message = 'Cart total exceeds the allowed limit';
    end if;
  end loop;

  v_total := v_subtotal + v_delivery_charge;
  select s.reservation_ttl_minutes into v_ttl_minutes
    from public.store_settings s where s.singleton;

  v_new_stock_status := case when v_requires_stock_confirmation
    then 'pending_confirmation'::public.stock_status
    else 'reserved'::public.stock_status end;
  v_new_order_status := case when v_requires_stock_confirmation
    then 'pending_stock_confirmation'::public.order_status
    else 'awaiting_payment'::public.order_status end;

  v_order_number := 'KE-' || to_char(now() at time zone 'Asia/Dhaka', 'YYYYMMDD') || '-' ||
    lpad(nextval('public.order_number_sequence')::text, 8, '0');

  insert into public.orders (
    id, order_number, idempotency_key, request_fingerprint, order_access_token_hash, customer_user_id,
    customer_name, customer_phone, customer_email, delivery_zone_id,
    delivery_zone_name_snapshot, delivery_address_line_1, delivery_address_line_2,
    delivery_area, delivery_city, delivery_postal_code, customer_note,
    order_status, stock_status, subtotal_bdt, delivery_charge_bdt, total_bdt
  ) values (
    v_order_id, v_order_number, p_idempotency_key, p_request_fingerprint, p_order_access_token_hash, p_customer_user_id,
    v_customer_name, v_customer_phone, v_customer_email, p_delivery_zone_id,
    v_zone_name, v_address_line_1, v_address_line_2, v_area, v_city, v_postal_code,
    nullif(btrim(p_customer_details->>'note'), ''),
    v_new_order_status, v_new_stock_status, v_subtotal, v_delivery_charge, v_total
  );

  for v_item in
    select entry.value
      from jsonb_array_elements(p_items) as entry(value)
     order by (entry.value->>'productId')::uuid, coalesce(entry.value->>'variantId', '')
  loop
    v_quantity := (v_item->>'quantity')::integer;
    select p.* into v_product from public.products p where p.id = (v_item->>'productId')::uuid;
    v_variant_id := nullif(v_item->>'variantId', '')::uuid;
    v_unit_price := v_product.price_bdt;
    if v_variant_id is not null then
      select v.* into v_variant from public.product_variants v
       where v.id = v_variant_id and v.product_id = v_product.id and v.is_active
       for share;
      v_unit_price := coalesce(v_variant.price_override_bdt, v_product.price_bdt);
    else
      v_variant := null;
    end if;

    insert into public.order_items (
      order_id, product_id, variant_id, sku_snapshot, product_name_snapshot,
      variant_name_snapshot, unit_price_bdt, quantity, line_total_bdt
    ) values (
      v_order_id, v_product.id, v_variant_id, v_product.sku, v_product.name,
      case when v_variant_id is null then null else v_variant.name end,
      v_unit_price, v_quantity, v_unit_price * v_quantity
    ) returning id into v_order_item_id;

    if (select i.tracking_mode from public.product_inventory i where i.product_id = v_product.id) = 'tracked' then
      insert into public.stock_reservations(order_id, order_item_id, product_id, quantity, expires_at)
      values (
        v_order_id, v_order_item_id, v_product.id, v_quantity,
        case when v_ttl_minutes is null then null else now() + make_interval(mins => v_ttl_minutes) end
      );
    end if;
  end loop;

  -- Reserve tracked stock only. Untracked/unknown stock requires manual confirmation before payment.
  for v_group in
    select i.product_id, sum(oi.quantity)::bigint as total_quantity
      from public.order_items oi
      join public.product_inventory i on i.product_id = oi.product_id and i.tracking_mode = 'tracked'
     where oi.order_id = v_order_id
     group by i.product_id
     order by i.product_id
  loop
    update public.product_inventory
       set quantity_reserved = quantity_reserved + v_group.total_quantity
     where product_id = v_group.product_id;
    insert into public.inventory_movements(
      product_id, order_id, movement_type, quantity_reserved_delta, reason, actor_user_id
    ) values (
      v_group.product_id, v_order_id, 'reservation', v_group.total_quantity,
      'Checkout stock reservation', p_customer_user_id
    );
  end loop;

  insert into public.order_events(order_id, event_type, to_status, actor_user_id)
  values (v_order_id, 'order_created', v_new_order_status::text, p_customer_user_id);

  return query select v_order_id, v_order_number, v_new_order_status,
    v_new_stock_status, v_subtotal, v_delivery_charge, v_total;
end;
$$;

revoke all on function public.create_checkout_order(uuid, text, text, jsonb, jsonb, uuid, uuid) from public, anon, authenticated;
grant execute on function public.create_checkout_order(uuid, text, text, jsonb, jsonb, uuid, uuid) to service_role;

-- Customer-submitted payment references are always pending until an admin verifies them.
create or replace function public.submit_manual_payment(
  p_order_id uuid,
  p_order_access_token_hash text,
  p_idempotency_key uuid,
  p_method public.payment_method,
  p_sender_phone text,
  p_transaction_reference text,
  p_amount_bdt bigint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_existing public.payment_submissions%rowtype;
  v_submission_id uuid;
begin
  if p_idempotency_key is null then
    raise exception using errcode = '22023', message = 'Payment idempotency key is required';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key::text, 1));
  select * into v_order from public.orders o where o.id = p_order_id for update;
  if not found or p_order_access_token_hash is null
     or p_order_access_token_hash !~ '^[0-9a-f]{64}$'
     or v_order.order_access_token_hash <> p_order_access_token_hash then
    raise exception using errcode = 'P0002', message = 'Order not found';
  end if;

  select * into v_existing from public.payment_submissions ps
   where ps.idempotency_key = p_idempotency_key;
  if found then
    if v_existing.order_id <> p_order_id or v_existing.method <> p_method
       or v_existing.sender_phone <> btrim(coalesce(p_sender_phone, ''))
       or v_existing.normalized_reference <> lower(regexp_replace(btrim(coalesce(p_transaction_reference, '')), '\s+', '', 'g'))
       or v_existing.amount_bdt <> p_amount_bdt then
      raise exception using errcode = '22023', message = 'Payment idempotency key was already used for another submission';
    end if;
    return v_existing.id;
  end if;

  if v_order.order_status <> 'awaiting_payment' or v_order.stock_status not in ('reserved', 'confirmed_untracked') then
    raise exception using errcode = '55000', message = 'Order is not ready for payment submission';
  end if;
  if v_order.payment_status in ('pending_verification', 'verified', 'refunded') then
    raise exception using errcode = '55000', message = 'A payment submission is already active for this order';
  end if;
  if p_amount_bdt <> v_order.total_bdt then
    raise exception using errcode = '22023', message = 'Submitted amount does not match the order total';
  end if;
  if p_sender_phone is null or p_sender_phone !~ '^[+0-9() .-]{7,32}$'
     or p_transaction_reference is null or length(btrim(p_transaction_reference)) not between 4 and 100 then
    raise exception using errcode = '22023', message = 'Payment sender or transaction reference is invalid';
  end if;
  if not exists (
    select 1 from public.payment_method_settings s
     where s.method = p_method and s.is_enabled
       and nullif(btrim(s.receiving_number), '') is not null
       and nullif(btrim(s.customer_instructions), '') is not null
  ) then
    raise exception using errcode = '55000', message = 'This payment method is not configured';
  end if;

  insert into public.payment_submissions(
    order_id, idempotency_key, method, sender_phone, transaction_reference, amount_bdt
  ) values (
    p_order_id, p_idempotency_key, p_method, btrim(p_sender_phone), btrim(p_transaction_reference), p_amount_bdt
  ) returning id into v_submission_id;

  update public.orders set payment_status = 'pending_verification' where id = p_order_id;
  insert into public.payment_events(payment_submission_id, event_type)
  values (v_submission_id, 'submitted');
  insert into public.order_events(order_id, event_type, to_status)
  values (p_order_id, 'payment_submitted', 'pending_verification');

  return v_submission_id;
end;
$$;

revoke all on function public.submit_manual_payment(uuid, text, uuid, public.payment_method, text, text, bigint) from public, anon, authenticated;
grant execute on function public.submit_manual_payment(uuid, text, uuid, public.payment_method, text, text, bigint) to service_role;

-- Guest order status is retrieved through the server using a per-order bearer token.
-- The function returns snapshots/status only; it never returns the token hash, address or sender phone.
create or replace function public.get_guest_order_summary(
  p_order_id uuid,
  p_order_access_token_hash text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  if p_order_access_token_hash is null or p_order_access_token_hash !~ '^[0-9a-f]{64}$' then
    return null;
  end if;

  select * into v_order
    from public.orders o
   where o.id = p_order_id and o.order_access_token_hash = p_order_access_token_hash;
  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'orderId', v_order.id,
    'orderNumber', v_order.order_number,
    'customerName', v_order.customer_name,
    'deliveryZone', v_order.delivery_zone_name_snapshot,
    'deliveryCity', v_order.delivery_city,
    'orderStatus', v_order.order_status,
    'stockStatus', v_order.stock_status,
    'paymentStatus', v_order.payment_status,
    'fulfilmentStatus', v_order.fulfilment_status,
    'subtotalBdt', v_order.subtotal_bdt,
    'deliveryChargeBdt', v_order.delivery_charge_bdt,
    'totalBdt', v_order.total_bdt,
    'createdAt', v_order.created_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'sku', oi.sku_snapshot,
        'name', oi.product_name_snapshot,
        'variant', oi.variant_name_snapshot,
        'unitPriceBdt', oi.unit_price_bdt,
        'quantity', oi.quantity,
        'lineTotalBdt', oi.line_total_bdt
      ) order by oi.created_at, oi.id)
      from public.order_items oi where oi.order_id = v_order.id
    ), '[]'::jsonb),
    'payment', (
      select jsonb_build_object('method', ps.method, 'status', ps.status,
        'submittedAt', ps.submitted_at, 'rejectionReason', ps.rejection_reason)
        from public.payment_submissions ps
       where ps.order_id = v_order.id
       order by ps.submitted_at desc limit 1
    )
  );
end;
$$;

revoke all on function public.get_guest_order_summary(uuid, text) from public, anon, authenticated;
grant execute on function public.get_guest_order_summary(uuid, text) to service_role;

-- Only an administrator can verify or reject a manual payment.
create or replace function public.verify_manual_payment(
  p_submission_id uuid,
  p_result public.payment_event_type,
  p_rejection_reason text default null,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_submission public.payment_submissions%rowtype;
  v_order public.orders%rowtype;
  v_next_status public.payment_submission_status;
begin
  if not public.is_store_admin() then
    raise exception using errcode = '42501', message = 'Administrator permission required';
  end if;
  if p_result is null or p_result not in ('verified', 'rejected') then
    raise exception using errcode = '22023', message = 'Invalid payment verification result';
  end if;
  if p_result = 'rejected' and nullif(btrim(p_rejection_reason), '') is null then
    raise exception using errcode = '22023', message = 'A rejection reason is required';
  end if;
  if p_note is not null and length(p_note) > 500 then
    raise exception using errcode = '22023', message = 'Verification note is too long';
  end if;

  -- Lock order before submission, matching the checkout/cancellation lock order.
  select o.* into v_order
    from public.orders o
    join public.payment_submissions ps on ps.order_id = o.id
   where ps.id = p_submission_id
   for update of o;
  if not found or v_order.order_status <> 'awaiting_payment'
     or v_order.stock_status not in ('reserved', 'confirmed_untracked') then
    raise exception using errcode = '55000', message = 'Order is no longer eligible for payment verification';
  end if;

  select * into v_submission from public.payment_submissions ps
   where ps.id = p_submission_id for update;
  if not found or v_submission.status <> 'pending_verification' then
    raise exception using errcode = '55000', message = 'Payment is missing or is no longer pending verification';
  end if;

  v_next_status := case when p_result = 'verified'
    then 'verified'::public.payment_submission_status
    else 'rejected'::public.payment_submission_status end;

  update public.payment_submissions
     set status = v_next_status,
         verified_by = (select auth.uid()),
         verified_at = now(),
         rejection_reason = case when p_result = 'rejected' then left(btrim(p_rejection_reason), 500) else null end
   where id = p_submission_id;

  update public.orders
     set payment_status = case when p_result = 'verified'
       then 'verified'::public.payment_status else 'rejected'::public.payment_status end,
         order_status = case when p_result = 'verified'
           then 'confirmed'::public.order_status else order_status end
   where id = v_submission.order_id;

  insert into public.payment_events(payment_submission_id, event_type, actor_user_id, note)
  values (p_submission_id, p_result, (select auth.uid()), left(coalesce(p_note, p_rejection_reason), 500));
  insert into public.order_events(order_id, event_type, from_status, to_status, actor_user_id, note)
  values (v_submission.order_id, 'payment_' || p_result::text,
    v_submission.status::text, v_next_status::text, (select auth.uid()), left(coalesce(p_note, p_rejection_reason), 500));
  insert into public.audit_events(actor_user_id, action, resource_type, resource_id, metadata)
  values ((select auth.uid()), 'payment_' || p_result::text, 'payment_submission', p_submission_id,
    jsonb_build_object('order_id', v_submission.order_id, 'amount_bdt', v_submission.amount_bdt, 'method', v_submission.method));
end;
$$;

revoke all on function public.verify_manual_payment(uuid, public.payment_event_type, text, text) from public, anon;
grant execute on function public.verify_manual_payment(uuid, public.payment_event_type, text, text) to authenticated;

-- Admin/staff manually confirms availability for items whose stock is not tracked.
create or replace function public.confirm_order_stock(
  p_order_id uuid,
  p_available boolean,
  p_note text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_reservation record;
begin
  if not public.is_store_staff() then
    raise exception using errcode = '42501', message = 'Staff permission required';
  end if;
  if p_note is null or length(btrim(p_note)) < 3 or length(p_note) > 500 then
    raise exception using errcode = '22023', message = 'A stock confirmation note is required';
  end if;

  select * into v_order from public.orders o where o.id = p_order_id for update;
  if not found or v_order.stock_status <> 'pending_confirmation'
     or v_order.order_status <> 'pending_stock_confirmation' then
    raise exception using errcode = '55000', message = 'Order is not awaiting stock confirmation';
  end if;

  if p_available then
    update public.orders
       set stock_status = 'confirmed_untracked', order_status = 'awaiting_payment'
     where id = p_order_id;
    insert into public.order_events(order_id, event_type, from_status, to_status, actor_user_id, note)
    values (p_order_id, 'stock_confirmed_manually', v_order.order_status::text,
      'awaiting_payment', (select auth.uid()), left(p_note, 500));
  else
    for v_reservation in
      select r.id, r.product_id, r.quantity
        from public.stock_reservations r
       where r.order_id = p_order_id and r.status = 'active'
       order by r.product_id
       for update
    loop
      update public.product_inventory
         set quantity_reserved = quantity_reserved - v_reservation.quantity
       where product_id = v_reservation.product_id;
      update public.stock_reservations
         set status = 'released', released_at = now()
       where id = v_reservation.id;
      insert into public.inventory_movements(
        product_id, order_id, movement_type, quantity_reserved_delta, reason, actor_user_id
      ) values (
        v_reservation.product_id, p_order_id, 'reservation_release', -v_reservation.quantity,
        'Stock unavailable; order cancelled', (select auth.uid())
      );
    end loop;
    update public.orders
       set stock_status = 'unavailable', order_status = 'cancelled', fulfilment_status = 'cancelled'
     where id = p_order_id;
    insert into public.order_events(order_id, event_type, from_status, to_status, actor_user_id, note)
    values (p_order_id, 'stock_unavailable_order_cancelled', v_order.order_status::text,
      'cancelled', (select auth.uid()), left(p_note, 500));
  end if;

  insert into public.audit_events(actor_user_id, action, resource_type, resource_id, metadata)
  values ((select auth.uid()), 'stock_confirmation', 'order', p_order_id,
    jsonb_build_object('available', p_available));
end;
$$;

revoke all on function public.confirm_order_stock(uuid, boolean, text) from public, anon;
grant execute on function public.confirm_order_stock(uuid, boolean, text) to authenticated;

create or replace function public.adjust_inventory(
  p_product_id uuid,
  p_quantity_delta bigint,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inventory public.product_inventory%rowtype;
  v_new_quantity bigint;
  v_movement public.inventory_movement_type;
begin
  if not public.is_store_staff() then
    raise exception using errcode = '42501', message = 'Staff permission required';
  end if;
  if p_quantity_delta = 0 or p_quantity_delta is null
     or p_reason is null or length(btrim(p_reason)) not between 3 and 500 then
    raise exception using errcode = '22023', message = 'A non-zero adjustment and reason are required';
  end if;

  select * into v_inventory from public.product_inventory i
   where i.product_id = p_product_id for update;
  if not found or v_inventory.tracking_mode <> 'tracked' then
    raise exception using errcode = '55000', message = 'Inventory quantity is not being tracked for this product';
  end if;

  v_new_quantity := v_inventory.quantity_on_hand + p_quantity_delta;
  if v_new_quantity < v_inventory.quantity_reserved then
    raise exception using errcode = '23514', message = 'Adjustment cannot reduce stock below active reservations';
  end if;
  v_movement := case when p_quantity_delta > 0
    then 'adjustment_increase'::public.inventory_movement_type
    else 'adjustment_decrease'::public.inventory_movement_type end;

  update public.product_inventory set quantity_on_hand = v_new_quantity where product_id = p_product_id;
  insert into public.inventory_movements(
    product_id, movement_type, quantity_on_hand_delta, reason, actor_user_id
  ) values (p_product_id, v_movement, p_quantity_delta, left(btrim(p_reason), 500), (select auth.uid()));
  insert into public.audit_events(actor_user_id, action, resource_type, resource_id, metadata)
  values ((select auth.uid()), 'inventory_adjustment', 'product', p_product_id,
    jsonb_build_object('quantity_delta', p_quantity_delta));
end;
$$;

revoke all on function public.adjust_inventory(uuid, bigint, text) from public, anon;
grant execute on function public.adjust_inventory(uuid, bigint, text) to authenticated;

create or replace function public.cancel_order_and_release_reservations(
  p_order_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_reservation record;
begin
  if not public.is_store_staff() then
    raise exception using errcode = '42501', message = 'Staff permission required';
  end if;
  if p_reason is null or length(btrim(p_reason)) not between 3 and 500 then
    raise exception using errcode = '22023', message = 'Cancellation reason is required';
  end if;
  select * into v_order from public.orders o where o.id = p_order_id for update;
  if not found or v_order.order_status in ('cancelled', 'confirmed')
     or v_order.payment_status in ('pending_verification', 'verified', 'refunded') then
    raise exception using errcode = '55000', message = 'Order cannot be cancelled while payment is pending, verified or refunded';
  end if;

  for v_reservation in
    select r.id, r.product_id, r.quantity from public.stock_reservations r
     where r.order_id = p_order_id and r.status = 'active'
     order by r.product_id for update
  loop
    update public.product_inventory
       set quantity_reserved = quantity_reserved - v_reservation.quantity
     where product_id = v_reservation.product_id;
    update public.stock_reservations set status = 'released', released_at = now()
     where id = v_reservation.id;
    insert into public.inventory_movements(
      product_id, order_id, movement_type, quantity_reserved_delta, reason, actor_user_id
    ) values (
      v_reservation.product_id, p_order_id, 'reservation_release', -v_reservation.quantity,
      left(btrim(p_reason), 500), (select auth.uid())
    );
  end loop;

  update public.orders set order_status = 'cancelled', fulfilment_status = 'cancelled'
   where id = p_order_id;
  insert into public.order_events(order_id, event_type, from_status, to_status, actor_user_id, note)
  values (p_order_id, 'order_cancelled', v_order.order_status::text, 'cancelled', (select auth.uid()), left(p_reason, 500));
  insert into public.audit_events(actor_user_id, action, resource_type, resource_id)
  values ((select auth.uid()), 'order_cancelled', 'order', p_order_id);
end;
$$;

revoke all on function public.cancel_order_and_release_reservations(uuid, text) from public, anon;
grant execute on function public.cancel_order_and_release_reservations(uuid, text) to authenticated;

-- Fulfilment consumes active tracked-stock reservations and records a permanent movement.
create or replace function public.mark_order_fulfilled(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_reservation record;
begin
  if not public.is_store_staff() then
    raise exception using errcode = '42501', message = 'Staff permission required';
  end if;
  select * into v_order from public.orders o where o.id = p_order_id for update;
  if not found or v_order.payment_status <> 'verified' or v_order.order_status <> 'confirmed' then
    raise exception using errcode = '55000', message = 'Only paid, confirmed orders can be fulfilled';
  end if;

  for v_reservation in
    select r.id, r.product_id, r.quantity from public.stock_reservations r
     where r.order_id = p_order_id and r.status = 'active'
     order by r.product_id for update
  loop
    update public.product_inventory
       set quantity_on_hand = quantity_on_hand - v_reservation.quantity,
           quantity_reserved = quantity_reserved - v_reservation.quantity
     where product_id = v_reservation.product_id;
    update public.stock_reservations set status = 'consumed', consumed_at = now()
     where id = v_reservation.id;
    insert into public.inventory_movements(
      product_id, order_id, movement_type, quantity_on_hand_delta,
      quantity_reserved_delta, reason, actor_user_id
    ) values (
      v_reservation.product_id, p_order_id, 'fulfilment', -v_reservation.quantity,
      -v_reservation.quantity, 'Order fulfilment', (select auth.uid())
    );
  end loop;

  update public.orders set fulfilment_status = 'processing' where id = p_order_id;
  insert into public.order_events(order_id, event_type, from_status, to_status, actor_user_id)
  values (p_order_id, 'fulfilment_started', v_order.fulfilment_status::text, 'processing', (select auth.uid()));
  insert into public.audit_events(actor_user_id, action, resource_type, resource_id)
  values ((select auth.uid()), 'fulfilment_started', 'order', p_order_id);
end;
$$;

revoke all on function public.mark_order_fulfilled(uuid) from public, anon;
grant execute on function public.mark_order_fulfilled(uuid) to authenticated;

-- Expiry is opt-in. A NULL reservation_ttl_minutes means no automatic expiry; staff release manually.
create or replace function public.expire_stock_reservations()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reservation record;
  v_released integer := 0;
begin
  for v_reservation in
    select r.id, r.order_id, r.product_id, r.quantity
      from public.stock_reservations r
     where r.status = 'active' and r.expires_at is not null and r.expires_at <= now()
       and exists (select 1 from public.orders o where o.id = r.order_id
         and o.payment_status in ('not_submitted', 'rejected'))
     order by r.product_id, r.id
     for update skip locked
  loop
    update public.product_inventory
       set quantity_reserved = quantity_reserved - v_reservation.quantity
     where product_id = v_reservation.product_id;
    update public.stock_reservations set status = 'expired', released_at = now()
     where id = v_reservation.id;
    insert into public.inventory_movements(
      product_id, order_id, movement_type, quantity_reserved_delta, reason
    ) values (
      v_reservation.product_id, v_reservation.order_id, 'reservation_release',
      -v_reservation.quantity, 'Configured reservation expiry'
    );
    update public.orders
       set order_status = 'cancelled', stock_status = 'unavailable', fulfilment_status = 'cancelled'
     where id = v_reservation.order_id and order_status in ('pending_stock_confirmation', 'awaiting_payment');
    v_released := v_released + 1;
  end loop;
  return v_released;
end;
$$;

revoke all on function public.expire_stock_reservations() from public, anon, authenticated;
grant execute on function public.expire_stock_reservations() to service_role;

-- Atomic fixed-window rate limiter. The server passes a keyed HMAC digest, not a raw IP.
create or replace function public.consume_rate_limit(
  p_scope text,
  p_identifier_hash text,
  p_window_seconds integer,
  p_max_requests integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_count integer;
begin
  if p_scope is null or length(btrim(p_scope)) not between 1 and 80
     or p_identifier_hash !~ '^[0-9a-f]{64}$'
     or p_window_seconds not between 1 and 86400
     or p_max_requests not between 1 and 10000 then
    raise exception using errcode = '22023', message = 'Invalid rate-limit parameters';
  end if;

  insert into public.rate_limit_windows(scope, identifier_hash, window_started_at, request_count)
  values (p_scope, p_identifier_hash, v_now, 1)
  on conflict (scope, identifier_hash) do update
    set window_started_at = case
          when public.rate_limit_windows.window_started_at + make_interval(secs => p_window_seconds) <= v_now
          then v_now else public.rate_limit_windows.window_started_at end,
        request_count = case
          when public.rate_limit_windows.window_started_at + make_interval(secs => p_window_seconds) <= v_now
          then 1 else public.rate_limit_windows.request_count + 1 end,
        updated_at = v_now
  returning request_count into v_count;

  return v_count <= p_max_requests;
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;

-- Staff explicitly sets inventory tracking mode; an unknown count remains NULL.
create or replace function public.configure_inventory_tracking(
  p_product_id uuid,
  p_tracking_mode public.stock_tracking_mode,
  p_quantity_on_hand bigint,
  p_low_stock_threshold bigint,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inventory public.product_inventory%rowtype;
  v_delta bigint := 0;
begin
  if not public.is_store_staff() then
    raise exception using errcode = '42501', message = 'Staff permission required';
  end if;
  if p_tracking_mode is null or p_reason is null or length(btrim(p_reason)) not between 3 and 500
     or (p_low_stock_threshold is not null and p_low_stock_threshold < 0) then
    raise exception using errcode = '22023', message = 'Inventory mode, threshold or reason is invalid';
  end if;
  if (p_tracking_mode = 'tracked' and (p_quantity_on_hand is null or p_quantity_on_hand < 0))
     or (p_tracking_mode <> 'tracked' and p_quantity_on_hand is not null) then
    raise exception using errcode = '22023', message = 'Tracked stock requires a known non-negative quantity; other modes require NULL';
  end if;

  select * into v_inventory from public.product_inventory i
   where i.product_id = p_product_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Product inventory record not found';
  end if;
  if v_inventory.quantity_reserved > 0 and p_tracking_mode <> 'tracked' then
    raise exception using errcode = '55000', message = 'Release active reservations before changing away from tracked stock';
  end if;
  if p_tracking_mode = 'tracked' and p_quantity_on_hand < v_inventory.quantity_reserved then
    raise exception using errcode = '23514', message = 'On-hand quantity cannot be below existing reservations';
  end if;

  if p_tracking_mode = 'tracked' then
    v_delta := p_quantity_on_hand - coalesce(v_inventory.quantity_on_hand, 0);
  elsif v_inventory.tracking_mode = 'tracked' then
    v_delta := -coalesce(v_inventory.quantity_on_hand, 0);
  end if;

  update public.product_inventory
     set tracking_mode = p_tracking_mode,
         quantity_on_hand = p_quantity_on_hand,
         low_stock_threshold = case when p_tracking_mode = 'tracked' then p_low_stock_threshold else null end,
         quantity_reserved = case when p_tracking_mode = 'tracked' then quantity_reserved else 0 end
   where product_id = p_product_id;

  if v_delta <> 0 then
    insert into public.inventory_movements(
      product_id, movement_type, quantity_on_hand_delta, reason, actor_user_id
    ) values (
      p_product_id,
      case when v_delta > 0 then 'receipt'::public.inventory_movement_type else 'adjustment_decrease'::public.inventory_movement_type end,
      v_delta, left(btrim(p_reason), 500), (select auth.uid())
    );
  end if;
  insert into public.audit_events(actor_user_id, action, resource_type, resource_id, metadata)
  values ((select auth.uid()), 'inventory_tracking_configured', 'product', p_product_id,
    jsonb_build_object('tracking_mode', p_tracking_mode));
end;
$$;

revoke all on function public.configure_inventory_tracking(uuid, public.stock_tracking_mode, bigint, bigint, text) from public, anon;
grant execute on function public.configure_inventory_tracking(uuid, public.stock_tracking_mode, bigint, bigint, text) to authenticated;

create or replace function public.update_order_fulfilment_status(
  p_order_id uuid,
  p_next_status public.fulfilment_status,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_allowed boolean := false;
begin
  if not public.is_store_staff() then
    raise exception using errcode = '42501', message = 'Staff permission required';
  end if;
  if p_next_status is null or (p_note is not null and length(p_note) > 500) then
    raise exception using errcode = '22023', message = 'Invalid fulfilment update';
  end if;
  select * into v_order from public.orders o where o.id = p_order_id for update;
  if not found or v_order.payment_status <> 'verified' or v_order.order_status <> 'confirmed' then
    raise exception using errcode = '55000', message = 'Only paid and confirmed orders can progress through fulfilment';
  end if;

  v_allowed := (v_order.fulfilment_status = 'processing' and p_next_status = 'packed')
    or (v_order.fulfilment_status = 'packed' and p_next_status = 'shipped')
    or (v_order.fulfilment_status = 'shipped' and p_next_status = 'delivered');
  if not v_allowed then
    raise exception using errcode = '55000', message = 'Invalid fulfilment status transition';
  end if;

  update public.orders set fulfilment_status = p_next_status where id = p_order_id;
  insert into public.order_events(order_id, event_type, from_status, to_status, actor_user_id, note)
  values (p_order_id, 'fulfilment_status_changed', v_order.fulfilment_status::text,
    p_next_status::text, (select auth.uid()), left(p_note, 500));
  insert into public.audit_events(actor_user_id, action, resource_type, resource_id, metadata)
  values ((select auth.uid()), 'fulfilment_status_changed', 'order', p_order_id,
    jsonb_build_object('from', v_order.fulfilment_status, 'to', p_next_status));
end;
$$;

revoke all on function public.update_order_fulfilment_status(uuid, public.fulfilment_status, text) from public, anon;
grant execute on function public.update_order_fulfilment_status(uuid, public.fulfilment_status, text) to authenticated;

-- RLS is enabled on every application table, including append-only history/audit tables.
alter table public.admin_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.product_specifications enable row level security;
alter table public.product_inventory enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.payment_method_settings enable row level security;
alter table public.store_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stock_reservations enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.payment_submissions enable row level security;
alter table public.payment_events enable row level security;
alter table public.order_events enable row level security;
alter table public.audit_events enable row level security;
alter table public.rate_limit_windows enable row level security;

-- Explicit grants start from a deny-by-default baseline. This also removes any
-- Supabase default privileges that may have been configured for the public schema.
revoke all on all tables in schema public from public, anon, authenticated;
revoke all on all sequences in schema public from public, anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from public, anon, authenticated;
alter default privileges in schema public revoke all on sequences from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;


-- Customer-safe checkout configuration. Internal singleton settings are never exposed directly.
create or replace function public.get_public_checkout_config()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'checkoutEnabled', coalesce((select s.checkout_enabled from public.store_settings s where s.singleton), false),
    'deliveryZones', coalesce((
      select jsonb_agg(jsonb_build_object('id', z.id, 'code', z.code, 'name', z.name,
        'description', z.coverage_description, 'deliveryChargeBdt', z.delivery_charge_bdt)
        order by z.name)
      from public.delivery_zones z where z.is_enabled and z.delivery_charge_bdt is not null
    ), '[]'::jsonb),
    'paymentMethods', coalesce((
      select jsonb_agg(jsonb_build_object('method', p.method, 'receivingNumber', p.receiving_number,
        'instructions', p.customer_instructions) order by p.method)
      from public.payment_method_settings p where p.is_enabled
        and nullif(btrim(p.receiving_number), '') is not null
        and nullif(btrim(p.customer_instructions), '') is not null
    ), '[]'::jsonb)
  );
$$;

-- Explicit function execute allow-list. SECURITY DEFINER helpers are not executable by
-- browser roles unless named below; privileged order/payment functions remain service_role-only.
grant execute on function public.has_store_role(public.admin_role[]) to anon, authenticated;
grant execute on function public.is_store_staff() to anon, authenticated;
grant execute on function public.is_store_admin() to anon, authenticated;
grant execute on function public.search_catalog_products(text, text, bigint, bigint, text, integer, integer) to anon, authenticated;
grant execute on function public.get_public_checkout_config() to anon, authenticated;
grant execute on function public.set_primary_product_image(uuid, uuid) to authenticated;
grant execute on function public.create_checkout_order(uuid, text, text, jsonb, jsonb, uuid, uuid) to service_role;
grant execute on function public.submit_manual_payment(uuid, text, uuid, public.payment_method, text, text, bigint) to service_role;
grant execute on function public.get_guest_order_summary(uuid, text) to service_role;
grant execute on function public.verify_manual_payment(uuid, public.payment_event_type, text, text) to authenticated;
grant execute on function public.confirm_order_stock(uuid, boolean, text) to authenticated;
grant execute on function public.adjust_inventory(uuid, bigint, text) to authenticated;
grant execute on function public.cancel_order_and_release_reservations(uuid, text) to authenticated;
grant execute on function public.mark_order_fulfilled(uuid) to authenticated;
grant execute on function public.expire_stock_reservations() to service_role;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;
grant execute on function public.configure_inventory_tracking(uuid, public.stock_tracking_mode, bigint, bigint, text) to authenticated;
grant execute on function public.update_order_fulfilment_status(uuid, public.fulfilment_status, text) to authenticated;

-- Own admin profile may be read; role changes are never self-service.
grant select on public.admin_profiles to authenticated;
create policy admin_profiles_read_self_or_admin on public.admin_profiles
for select to authenticated
using (user_id = (select auth.uid()) or public.is_store_admin());

-- Public catalogue access goes through safe columns and published-row RLS.
grant select (id, parent_id, slug, name, description, status, sort_order) on public.categories to anon, authenticated;
grant select (id, category_id, sku, slug, name, brand, short_description, description, price_bdt, status, public_availability, orderable, sort_order, published_at) on public.products to anon, authenticated;
grant select (id, product_id, sku, name, option_values, price_override_bdt, is_active, sort_order) on public.product_variants to anon, authenticated;
grant select (id, product_id, storage_path, alt_text, sort_order, is_primary) on public.product_images to anon, authenticated;
grant select (id, product_id, label, value, unit, sort_order) on public.product_specifications to anon, authenticated;
grant select on public.catalog_categories, public.catalog_products, public.catalog_product_variants,
  public.catalog_product_images, public.catalog_product_specifications to anon, authenticated;

create policy categories_public_read on public.categories
for select to anon, authenticated using (
  status = 'published' and (parent_id is null or exists (
    select 1 from public.categories as parent where parent.id = categories.parent_id and parent.status = 'published'
  ))
);
create policy products_public_read on public.products
for select to anon, authenticated using (
  status = 'published' and exists (
    select 1 from public.categories c where c.id = category_id and c.status = 'published'
  )
);
create policy product_variants_public_read on public.product_variants
for select to anon, authenticated using (
  is_active and exists (
    select 1 from public.products p
    join public.categories c on c.id = p.category_id and c.status = 'published'
    where p.id = product_id and p.status = 'published'
  )
);
create policy product_images_public_read on public.product_images
for select to anon, authenticated using (
  exists (
    select 1 from public.products p
    join public.categories c on c.id = p.category_id and c.status = 'published'
    where p.id = product_id and p.status = 'published'
  )
);
create policy product_specifications_public_read on public.product_specifications
for select to anon, authenticated using (
  exists (
    select 1 from public.products p
    join public.categories c on c.id = p.category_id and c.status = 'published'
    where p.id = product_id and p.status = 'published'
  )
);

-- Staff manage catalogue data. Payment verification is deliberately not included in staff privileges.
grant select on public.categories, public.products, public.product_variants,
  public.product_images, public.product_specifications to authenticated;
grant insert (parent_id, slug, name, description, status, sort_order),
  update (parent_id, slug, name, description, status, sort_order), delete on public.categories to authenticated;
grant insert (category_id, sku, slug, name, brand, short_description, description, price_bdt, status, public_availability, orderable, sort_order),
  update (category_id, sku, slug, name, brand, short_description, description, price_bdt, status, public_availability, orderable, sort_order), delete on public.products to authenticated;
grant insert (product_id, sku, name, option_values, price_override_bdt, is_active, sort_order),
  update (sku, name, option_values, price_override_bdt, is_active, sort_order), delete on public.product_variants to authenticated;
grant insert (product_id, storage_path, alt_text, sort_order, is_primary),
  update (storage_path, alt_text, sort_order, is_primary), delete on public.product_images to authenticated;
grant insert (product_id, label, value, unit, sort_order),
  update (label, value, unit, sort_order), delete on public.product_specifications to authenticated;
create policy categories_staff_manage on public.categories
for all to authenticated using (public.is_store_staff()) with check (public.is_store_staff());
create policy products_staff_manage on public.products
for all to authenticated using (public.is_store_staff()) with check (public.is_store_staff());
create policy product_variants_staff_manage on public.product_variants
for all to authenticated using (public.is_store_staff()) with check (public.is_store_staff());
create policy product_images_staff_manage on public.product_images
for all to authenticated using (public.is_store_staff()) with check (public.is_store_staff());
create policy product_specifications_staff_manage on public.product_specifications
for all to authenticated using (public.is_store_staff()) with check (public.is_store_staff());

-- Inventory is private; staff can read it and must use audited functions to change it.
grant select on public.product_inventory, public.inventory_movements, public.stock_reservations to authenticated;
create policy inventory_staff_read on public.product_inventory
for select to authenticated using (public.is_store_staff());
create policy inventory_movements_staff_read on public.inventory_movements
for select to authenticated using (public.is_store_staff());
create policy reservations_staff_read on public.stock_reservations
for select to authenticated using (public.is_store_staff());

-- Customer accounts can only read/change their own profile and saved addresses.
grant select on public.customer_profiles, public.customer_addresses to authenticated;
grant insert (user_id, full_name, phone), update (full_name, phone) on public.customer_profiles to authenticated;
grant insert (user_id, recipient_name, phone, address_line_1, address_line_2, area, city, postal_code, is_default),
  update (recipient_name, phone, address_line_1, address_line_2, area, city, postal_code, is_default), delete on public.customer_addresses to authenticated;
create policy customer_profile_own_select on public.customer_profiles
for select to authenticated using (user_id = (select auth.uid()));
create policy customer_profile_own_insert on public.customer_profiles
for insert to authenticated with check (user_id = (select auth.uid()));
create policy customer_profile_own_update on public.customer_profiles
for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy customer_addresses_own_access on public.customer_addresses
for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Public can see only enabled delivery zones with an explicit charge.
grant select (id, code, name, coverage_description, delivery_charge_bdt, is_enabled) on public.delivery_zones to anon, authenticated;
grant select on public.delivery_zones to authenticated;
grant insert (code, name, coverage_description, delivery_charge_bdt, is_enabled),
  update (code, name, coverage_description, delivery_charge_bdt, is_enabled) on public.delivery_zones to authenticated;
create policy delivery_zones_public_read on public.delivery_zones
for select to anon, authenticated using (is_enabled and delivery_charge_bdt is not null);
create policy delivery_zones_staff_manage on public.delivery_zones
for all to authenticated using (public.is_store_staff()) with check (public.is_store_staff());

-- Public can see only enabled payment instructions; columns are limited to customer-facing fields.
grant select (method, is_enabled, receiving_number, customer_instructions) on public.payment_method_settings to anon, authenticated;
grant select (updated_at) on public.payment_method_settings to authenticated;
grant update (is_enabled, receiving_number, customer_instructions, updated_by) on public.payment_method_settings to authenticated;
create policy payment_methods_enabled_public_read on public.payment_method_settings
for select to anon, authenticated using (is_enabled);
create policy payment_methods_admin_read on public.payment_method_settings
for select to authenticated using (public.is_store_admin());
create policy payment_methods_admin_update on public.payment_method_settings
for update to authenticated using (public.is_store_admin()) with check (public.is_store_admin());

-- Settings, orders, payments and audit data are private to authenticated staff/customers as applicable.
grant select (checkout_enabled, reservation_ttl_minutes) on public.store_settings to authenticated;
grant update (checkout_enabled, updated_by) on public.store_settings to authenticated;
create policy store_settings_admin_access on public.store_settings
for all to authenticated using (public.is_store_admin()) with check (public.is_store_admin());

grant select on public.orders to authenticated;
create policy orders_staff_read on public.orders
for select to authenticated using (public.is_store_staff());
create policy orders_customer_read_own on public.orders
for select to authenticated using (customer_user_id = (select auth.uid()));

grant select on public.order_items to authenticated;
create policy order_items_staff_read on public.order_items
for select to authenticated using (public.is_store_staff());
create policy order_items_customer_read_own on public.order_items
for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and o.customer_user_id = (select auth.uid()))
);

grant select on public.payment_submissions to authenticated;
create policy payments_admin_read on public.payment_submissions
for select to authenticated using (public.is_store_admin());
create policy payments_customer_read_own on public.payment_submissions
for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and o.customer_user_id = (select auth.uid()))
);

grant select on public.payment_events, public.order_events to authenticated;
create policy payment_events_admin_read on public.payment_events
for select to authenticated using (public.is_store_admin());
create policy order_events_staff_read on public.order_events
for select to authenticated using (public.is_store_staff());

grant select on public.audit_events to authenticated;
create policy audit_events_admin_read on public.audit_events
for select to authenticated using (public.is_store_admin());

-- No direct access to rate-limit identifiers, reservation writes or financial mutations.
-- All these writes run through SECURITY DEFINER functions with explicit role checks or service_role-only grants.

grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- Storage buckets: product images remain private at the bucket level. Object RLS
-- permits anonymous reads only for paths attached to a published product in a published category.
-- Private order files are staff-only. Upsert enforces the intended access mode if a bucket already exists.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', false, 8388608, array['image/jpeg','image/png','image/webp','image/avif']),
  ('private-order-files', 'private-order-files', false, 10485760, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy product_images_published_public_read on storage.objects
for select to anon, authenticated using (
  bucket_id = 'product-images' and exists (
    select 1
    from public.product_images pi
    join public.products p on p.id = pi.product_id and p.status = 'published'
    join public.categories c on c.id = p.category_id and c.status = 'published'
    where pi.storage_path = storage.objects.name
  )
);
create policy product_images_staff_preview on storage.objects
for select to authenticated using (
  bucket_id = 'product-images' and public.is_store_staff()
);
create policy product_images_staff_upload on storage.objects
for insert to authenticated with check (bucket_id = 'product-images' and public.is_store_staff());
create policy product_images_staff_update on storage.objects
for update to authenticated using (bucket_id = 'product-images' and public.is_store_staff())
with check (bucket_id = 'product-images' and public.is_store_staff());
create policy product_images_staff_delete on storage.objects
for delete to authenticated using (bucket_id = 'product-images' and public.is_store_staff());

create policy private_order_files_staff_read on storage.objects
for select to authenticated using (bucket_id = 'private-order-files' and public.is_store_staff());
create policy private_order_files_staff_upload on storage.objects
for insert to authenticated with check (bucket_id = 'private-order-files' and public.is_store_staff());
create policy private_order_files_staff_update on storage.objects
for update to authenticated using (bucket_id = 'private-order-files' and public.is_store_staff())
with check (bucket_id = 'private-order-files' and public.is_store_staff());
create policy private_order_files_staff_delete on storage.objects
for delete to authenticated using (bucket_id = 'private-order-files' and public.is_store_staff());

commit;
