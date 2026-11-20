-- Reviews can only be submitted for delivered orders using their order-access token.
create table public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  customer_user_id uuid references auth.users(id) on delete set null,
  reviewer_display_name text check (reviewer_display_name is null or length(btrim(reviewer_display_name)) between 1 and 80),
  rating smallint not null check (rating between 1 and 5),
  review_text text check (review_text is null or length(review_text) <= 1000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderator_user_id uuid references auth.users(id) on delete set null,
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customer_reviews_status_created_idx on public.customer_reviews(status, created_at desc);
create index customer_reviews_customer_idx on public.customer_reviews(customer_user_id, created_at desc);

alter table public.customer_reviews enable row level security;
grant select on public.customer_reviews to anon, authenticated;
grant all on public.customer_reviews to service_role;

create policy customer_reviews_public_approved_select on public.customer_reviews
for select to anon, authenticated using (status = 'approved');

create policy customer_reviews_staff_select on public.customer_reviews
for select to authenticated using (public.is_store_staff());

create or replace function public.submit_customer_review(
  p_order_id uuid,
  p_order_access_token_hash text,
  p_rating smallint,
  p_review_text text default null,
  p_reviewer_display_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_review_id uuid;
  v_text text := nullif(btrim(p_review_text), '');
  v_name text := nullif(btrim(p_reviewer_display_name), '');
begin
  if p_order_id is null
    or p_order_access_token_hash is null
    or p_order_access_token_hash !~ '^[0-9a-f]{64}$'
    or p_rating is null or p_rating not between 1 and 5
    or (v_text is not null and length(v_text) > 1000)
    or (v_name is not null and length(v_name) > 80) then
    raise exception using errcode = '22023', message = 'Invalid review submission';
  end if;

  select * into v_order from public.orders o where o.id = p_order_id for update;
  if not found
    or v_order.order_access_token_hash <> p_order_access_token_hash
    or v_order.order_status <> 'confirmed'
    or v_order.fulfilment_status <> 'delivered' then
    raise exception using errcode = '42501', message = 'Order is not eligible for a review';
  end if;

  insert into public.customer_reviews(
    order_id, customer_user_id, reviewer_display_name, rating, review_text, status
  ) values (
    p_order_id, v_order.customer_user_id, v_name, p_rating, v_text, 'pending'
  )
  on conflict (order_id) do update
    set customer_user_id = excluded.customer_user_id,
        reviewer_display_name = excluded.reviewer_display_name,
        rating = excluded.rating,
        review_text = excluded.review_text,
        status = 'pending',
        moderator_user_id = null,
        moderated_at = null,
        updated_at = now()
    where public.customer_reviews.status = 'rejected'
  returning id into v_review_id;

  if v_review_id is null then
    raise exception using errcode = '23505', message = 'Review already exists for this order';
  end if;
  return v_review_id;
end;
$$;

revoke all on function public.submit_customer_review(uuid, text, smallint, text, text) from public, anon, authenticated;
grant execute on function public.submit_customer_review(uuid, text, smallint, text, text) to service_role;

-- Expose only aggregate storefront counters, never customer/order records.
create or replace function public.get_public_store_stats()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'completedOrders', (
      select count(*) from public.orders
      where order_status = 'confirmed' and fulfilment_status = 'delivered'
    ),
    'customers', (
      select count(distinct customer_phone) from public.orders
      where order_status <> 'cancelled' and fulfilment_status <> 'cancelled'
    ),
    'verifiedReviews', (
      select count(*) from public.customer_reviews where status = 'approved'
    )
  );
$$;

revoke all on function public.get_public_store_stats() from public;
grant execute on function public.get_public_store_stats() to anon, authenticated;
