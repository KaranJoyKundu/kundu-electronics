-- Persist checkout payment preference and support a distinct cash-on-delivery lifecycle.
alter table public.orders add column if not exists payment_preference text;
alter table public.orders add constraint orders_payment_preference_check
  check (payment_preference is null or payment_preference in ('cash_on_delivery','online_payment'));

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
     or (coalesce(p_customer_details->>'paymentPreference', 'online_payment') <> 'cash_on_delivery'
       and not exists (select 1 from public.payment_method_settings pms where pms.is_enabled
         and nullif(btrim(pms.receiving_number), '') is not null
         and nullif(btrim(pms.customer_instructions), '') is not null)) then
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

create or replace function public.create_checkout_order_with_preference(
  p_idempotency_key uuid,
  p_request_fingerprint text,
  p_order_access_token_hash text,
  p_customer_details jsonb,
  p_items jsonb,
  p_delivery_zone_id uuid,
  p_customer_user_id uuid,
  p_payment_preference text
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
  v_created record;
begin
  if p_payment_preference not in ('cash_on_delivery', 'online_payment') then
    raise exception using errcode = '22023', message = 'Invalid checkout payment preference';
  end if;
  select * into v_created from public.create_checkout_order(
    p_idempotency_key, p_request_fingerprint, p_order_access_token_hash,
    p_customer_details || jsonb_build_object('paymentPreference', p_payment_preference),
    p_items, p_delivery_zone_id, p_customer_user_id
  );
  if not found then
    raise exception using errcode = 'P0001', message = 'Checkout order creation failed';
  end if;
  update public.orders set payment_preference = p_payment_preference where id = v_created.order_id;
  return query select v_created.order_id, v_created.order_number, v_created.order_status,
    v_created.stock_status, v_created.subtotal_bdt, v_created.delivery_charge_bdt, v_created.total_bdt;
end;
$$;

revoke all on function public.create_checkout_order_with_preference(uuid, text, text, jsonb, jsonb, uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.create_checkout_order_with_preference(uuid, text, text, jsonb, jsonb, uuid, uuid, text) to service_role;

create or replace function public.confirm_cash_on_delivery_order(
  p_order_id uuid,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  if not public.is_store_staff() then
    raise exception using errcode = '42501', message = 'Staff permission required';
  end if;
  if p_note is not null and length(p_note) > 500 then
    raise exception using errcode = '22023', message = 'Confirmation note is too long';
  end if;
  select * into v_order from public.orders o where o.id = p_order_id for update;
  if not found or v_order.order_status <> 'awaiting_payment'
    or v_order.payment_preference is distinct from 'cash_on_delivery'
    or v_order.stock_status not in ('reserved', 'confirmed_untracked')
    or v_order.payment_status <> 'not_submitted' then
    raise exception using errcode = '55000', message = 'COD order is not eligible for confirmation';
  end if;

  update public.orders set order_status = 'confirmed', updated_at = now() where id = p_order_id;
  insert into public.order_events(order_id, event_type, from_status, to_status, actor_user_id, note)
  values (p_order_id, 'order_confirmed_cod', 'awaiting_payment', 'confirmed', (select auth.uid()), left(p_note, 500));
  insert into public.audit_events(actor_user_id, action, resource_type, resource_id, metadata)
  values ((select auth.uid()), 'order_confirmed_cod', 'order', p_order_id,
    jsonb_build_object('payment_preference', 'cash_on_delivery'));
end;
$$;

revoke all on function public.confirm_cash_on_delivery_order(uuid, text) from public, anon;
grant execute on function public.confirm_cash_on_delivery_order(uuid, text) to authenticated;

create or replace function public.mark_cash_on_delivery_collected(
  p_order_id uuid,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  if not public.is_store_staff() then
    raise exception using errcode = '42501', message = 'Staff permission required';
  end if;
  if p_note is not null and length(p_note) > 500 then
    raise exception using errcode = '22023', message = 'Collection note is too long';
  end if;
  select * into v_order from public.orders o where o.id = p_order_id for update;
  if not found or v_order.order_status <> 'confirmed'
    or v_order.fulfilment_status <> 'delivered'
    or v_order.payment_preference is distinct from 'cash_on_delivery'
    or v_order.payment_status <> 'not_submitted' then
    raise exception using errcode = '55000', message = 'COD collection cannot be recorded for this order';
  end if;

  update public.orders set payment_status = 'verified', updated_at = now() where id = p_order_id;
  insert into public.order_events(order_id, event_type, from_status, to_status, actor_user_id, note)
  values (p_order_id, 'cod_payment_collected', 'not_submitted', 'verified', (select auth.uid()), left(p_note, 500));
  insert into public.audit_events(actor_user_id, action, resource_type, resource_id, metadata)
  values ((select auth.uid()), 'cod_payment_collected', 'order', p_order_id,
    jsonb_build_object('payment_preference', 'cash_on_delivery'));
end;
$$;

revoke all on function public.mark_cash_on_delivery_collected(uuid, text) from public, anon;
grant execute on function public.mark_cash_on_delivery_collected(uuid, text) to authenticated;

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
  if not found or v_order.order_status <> 'confirmed' or not (
    v_order.payment_status = 'verified'
    or (v_order.payment_preference = 'cash_on_delivery' and v_order.payment_status = 'not_submitted')
  ) then
    raise exception using errcode = '55000', message = 'Only confirmed and payment-eligible orders can progress through fulfilment';
  end if;

  v_allowed := (v_order.fulfilment_status = 'unfulfilled' and p_next_status = 'processing')
    or (v_order.fulfilment_status = 'processing' and p_next_status = 'packed')
    or (v_order.fulfilment_status = 'packed' and p_next_status = 'shipped')
    or (v_order.fulfilment_status = 'shipped' and p_next_status = 'delivered');
  if not v_allowed then
    raise exception using errcode = '55000', message = 'Invalid fulfilment status transition';
  end if;

  update public.orders set fulfilment_status = p_next_status, updated_at = now() where id = p_order_id;
  insert into public.order_events(order_id, event_type, from_status, to_status, actor_user_id, note)
  values (p_order_id, 'fulfilment_status_changed', v_order.fulfilment_status::text,
    p_next_status::text, (select auth.uid()), left(p_note, 500));
  insert into public.audit_events(actor_user_id, action, resource_type, resource_id, metadata)
  values ((select auth.uid()), 'fulfilment_status_changed', 'order', p_order_id,
    jsonb_build_object('from', v_order.fulfilment_status, 'to', p_next_status));
end;
$$;

create or replace function public.auto_deliver_shipped_orders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_delivered integer := 0;
begin
  with eligible as (
    select o.id
    from public.orders o
    join lateral (
      select e.created_at
      from public.order_events e
      where e.order_id = o.id
        and e.event_type = 'fulfilment_status_changed'
        and e.to_status = 'shipped'
      order by e.created_at desc, e.id desc
      limit 1
    ) latest_shipment on true
    where o.order_status = 'confirmed'
      and (o.payment_status = 'verified'
        or (o.payment_preference = 'cash_on_delivery' and o.payment_status = 'not_submitted'))
      and o.fulfilment_status = 'shipped'
      and latest_shipment.created_at <= now() - interval '24 hours'
    for update of o skip locked
  ),
  delivered as (
    update public.orders o
    set fulfilment_status = 'delivered', updated_at = now()
    from eligible e
    where o.id = e.id
    returning o.id
  ),
  logged as (
    insert into public.order_events(order_id, event_type, from_status, to_status, actor_user_id, note)
    select id, 'fulfilment_status_changed', 'shipped', 'delivered', null,
      'Automatically delivered 24 hours after shipment.'
    from delivered
    returning order_id
  ),
  audited as (
    insert into public.audit_events(actor_user_id, action, resource_type, resource_id, metadata)
    select null, 'auto_delivered_after_24h', 'order', order_id,
      jsonb_build_object('from', 'shipped', 'to', 'delivered', 'trigger', '24h_after_shipment')
    from logged
    returning id
  )
  select count(*)::integer into v_delivered from logged;

  return v_delivered;
end;
$$;

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
    'paymentPreference', v_order.payment_preference,
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
