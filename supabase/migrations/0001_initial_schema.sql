-- Kundu Electronics initial schema proposal.
-- Review and apply only after creating the Supabase project and checking RLS in a staging project.
-- Never place supplier purchase cost or private inventory notes in the public products table.

create type public.product_visibility as enum ('draft', 'published', 'archived');
create type public.product_availability as enum (
  'in_stock', 'low_stock', 'out_of_stock', 'backorder', 'discontinued', 'build_to_order'
);
create type public.order_status as enum (
  'awaiting_payment', 'paid', 'processing', 'shipped', 'completed', 'cancelled'
);
create type public.payment_method as enum ('bkash', 'nagad');
create type public.payment_status as enum ('pending_verification', 'verified', 'rejected');

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order integer not null default 0,
  visibility public.product_visibility not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  slug text not null unique,
  name text not null,
  brand text,
  summary text,
  description text,
  price_bdt integer check (price_bdt is null or price_bdt > 0),
  category_id uuid references public.categories(id) on delete set null,
  availability public.product_availability not null default 'out_of_stock',
  visibility public.product_visibility not null default 'draft',
  specifications jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_products_require_price check (visibility <> 'published' or price_bdt is not null)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(product_id, storage_path)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  order_status public.order_status not null default 'awaiting_payment',
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'pending_verification',
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_address text not null,
  delivery_area text,
  delivery_city text not null,
  delivery_postal_code text,
  payment_sender_phone text,
  payment_transaction_reference text not null,
  subtotal_bdt integer not null check (subtotal_bdt >= 0),
  delivery_fee_bdt integer not null check (delivery_fee_bdt >= 0),
  total_bdt integer not null check (total_bdt >= 0),
  customer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  sku_snapshot text not null,
  name_snapshot text not null,
  unit_price_bdt integer not null check (unit_price_bdt > 0),
  quantity integer not null check (quantity > 0),
  line_total_bdt integer not null check (line_total_bdt > 0),
  created_at timestamptz not null default now()
);

create index products_visibility_category_idx on public.products(visibility, category_id);
create index products_name_search_idx on public.products using gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(sku, '') || ' ' || coalesce(brand, '')));
create index categories_parent_sort_idx on public.categories(parent_id, sort_order);
create index product_images_product_sort_idx on public.product_images(product_id, sort_order);
create index orders_created_at_idx on public.orders(created_at desc);
create index orders_payment_status_idx on public.orders(payment_status, created_at desc);
create index order_items_order_idx on public.order_items(order_id);

alter table public.admin_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Admin/staff can read only their own role record. Role assignment is performed out-of-band
-- by a trusted project owner/service role, never by an end-user form.
create policy "staff can read own admin profile"
  on public.admin_profiles for select to authenticated
  using (user_id = (select auth.uid()));

-- Public catalogue is read-only and only published rows are visible.
create policy "public can read published categories"
  on public.categories for select to anon, authenticated
  using (visibility = 'published');

create policy "public can read published products"
  on public.products for select to anon, authenticated
  using (visibility = 'published');

create policy "public can read images for published products"
  on public.product_images for select to anon, authenticated
  using (exists (
    select 1 from public.products p
    where p.id = product_id and p.visibility = 'published'
  ));

-- Admin/staff product and category operations are protected by their role record.
create policy "staff can manage categories"
  on public.categories for all to authenticated
  using (exists (select 1 from public.admin_profiles ap where ap.user_id = (select auth.uid()) and ap.role in ('admin', 'staff')))
  with check (exists (select 1 from public.admin_profiles ap where ap.user_id = (select auth.uid()) and ap.role in ('admin', 'staff')));

create policy "staff can manage products"
  on public.products for all to authenticated
  using (exists (select 1 from public.admin_profiles ap where ap.user_id = (select auth.uid()) and ap.role in ('admin', 'staff')))
  with check (exists (select 1 from public.admin_profiles ap where ap.user_id = (select auth.uid()) and ap.role in ('admin', 'staff')));

create policy "staff can manage product images"
  on public.product_images for all to authenticated
  using (exists (select 1 from public.admin_profiles ap where ap.user_id = (select auth.uid()) and ap.role in ('admin', 'staff')))
  with check (exists (select 1 from public.admin_profiles ap where ap.user_id = (select auth.uid()) and ap.role in ('admin', 'staff')));

-- Orders and order items are private. Only authenticated staff can read/update them.
-- Customer checkout will be a server-side route using a secret key held only on the server.
-- No anon/authenticated insert policy is defined; do not add one without reviewing abuse controls.
create policy "staff can read orders"
  on public.orders for select to authenticated
  using (exists (select 1 from public.admin_profiles ap where ap.user_id = (select auth.uid()) and ap.role in ('admin', 'staff')));

create policy "admins can update orders and verify manual payments"
  on public.orders for update to authenticated
  using (exists (select 1 from public.admin_profiles ap where ap.user_id = (select auth.uid()) and ap.role = 'admin'))
  with check (exists (select 1 from public.admin_profiles ap where ap.user_id = (select auth.uid()) and ap.role = 'admin'));

create policy "staff can read order items"
  on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o
    join public.admin_profiles ap on ap.user_id = (select auth.uid()) and ap.role in ('admin', 'staff')
    where o.id = order_id
  ));

-- Explicit grants. RLS narrows the rows visible to each role.
grant select on public.categories, public.products, public.product_images to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_images to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;
