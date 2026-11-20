-- 20261119235416_allow_out_of_stock_preorders
-- Allow published, priced out-of-stock products to be ordered as pre-orders.
-- Pending pre-orders do not reserve other cart stock until the complete order is ready.
-- On stock arrival, reserve tracked quantities atomically before enabling payment.

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_orderable_requires_valid_price_and_availability;

ALTER TABLE public.products
  ADD CONSTRAINT products_orderable_requires_valid_price_and_availability
  CHECK (
    NOT orderable OR (
      price_bdt IS NOT NULL
      AND public_availability IN (
        'in_stock'::public.public_availability_status,
        'low_stock'::public.public_availability_status,
        'out_of_stock'::public.public_availability_status,
        'backorder'::public.public_availability_status,
        'build_to_order'::public.public_availability_status
      )
    )
  );

UPDATE public.products p
   SET orderable = true,
       updated_at = now()
  FROM public.product_inventory i
 WHERE i.product_id = p.id
   AND p.status = 'published'
   AND p.public_availability = 'out_of_stock'
   AND p.price_bdt IS NOT NULL
   AND p.price_bdt > 0
   AND i.tracking_mode = 'tracked'
   AND p.orderable = false;
CREATE OR REPLACE FUNCTION public.create_checkout_order(p_idempotency_key uuid, p_request_fingerprint text, p_order_access_token_hash text, p_customer_details jsonb, p_items jsonb, p_delivery_zone_id uuid, p_customer_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(order_id uuid, order_number text, order_status order_status, stock_status stock_status, subtotal_bdt bigint, delivery_charge_bdt bigint, total_bdt bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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

  if coalesce((select s.checkout_enabled from public.store_settings s where s.singleton), false) is not true then
    raise exception using errcode = '55000', message = 'Website checkout is disabled';
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
        v_requires_stock_confirmation := true;
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
    v_variant_id := nullif(v_item->>'variantId', '');
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

    if not v_requires_stock_confirmation
       and (select i.tracking_mode from public.product_inventory i where i.product_id = v_product.id) = 'tracked' then
      insert into public.stock_reservations(order_id, order_item_id, product_id, quantity, expires_at)
      values (
        v_order_id, v_order_item_id, v_product.id, v_quantity,
        case when v_ttl_minutes is null then null else now() + make_interval(mins => v_ttl_minutes) end
      );
    end if;
  end loop;

  -- Do not reserve partial cart stock for a pre-order. Reserve the entire tracked cart immediately only when all lines are available.
  if not v_requires_stock_confirmation then
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
  end if;

  insert into public.order_events(order_id, event_type, to_status, actor_user_id)
  values (v_order_id, 'order_created', v_new_order_status::text, p_customer_user_id);

  return query select v_order_id, v_order_number, v_new_order_status,
    v_new_stock_status, v_subtotal, v_delivery_charge, v_total;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.confirm_order_stock(p_order_id uuid, p_available boolean, p_note text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_order public.orders%rowtype;
  v_group record;
  v_item record;
  v_inventory public.product_inventory%rowtype;
  v_existing_reservation public.stock_reservations%rowtype;
  v_ttl_minutes integer;
  v_existing_reserved bigint;
  v_missing_quantity bigint;
  v_item_reserved bigint;
  v_item_missing bigint;
  v_has_untracked boolean := false;
begin
  if not public.is_store_staff() then
    raise exception using errcode = '42501', message = 'Staff permission required';
  end if;
  if p_note is null or length(btrim(p_note)) < 3 or length(p_note) > 500 then
    raise exception using errcode = '22023', message = 'A stock drop note is required';
  end if;

  select * into v_order from public.orders o where o.id = p_order_id for update;
  if not found or v_order.stock_status <> 'pending_confirmation'
     or v_order.order_status <> 'pending_stock_confirmation' then
    raise exception using errcode = '55000', message = 'Order is not awaiting the next stock drop';
  end if;

  if p_available then
    select s.reservation_ttl_minutes into v_ttl_minutes
      from public.store_settings s where s.singleton;

    -- Lock existing reservation rows before inventory rows; expiry/cancellation code follows this lock order.
    perform r.id
      from public.stock_reservations r
     where r.order_id = p_order_id
     for update;

    for v_group in
      select oi.product_id, sum(oi.quantity)::bigint as total_quantity
        from public.order_items oi
       where oi.order_id = p_order_id
       group by oi.product_id
       order by oi.product_id
    loop
      select i.* into v_inventory
        from public.product_inventory i
       where i.product_id = v_group.product_id
       for update;
      if not found then
        raise exception using errcode = 'P0001', message = 'Inventory state is missing for a pre-order item';
      end if;

      if v_inventory.tracking_mode = 'tracked' then
        select coalesce(sum(greatest(oi.quantity - case when r.status = 'active' then r.quantity else 0 end, 0)), 0)
          into v_missing_quantity
          from public.order_items oi
          left join public.stock_reservations r on r.order_item_id = oi.id
         where oi.order_id = p_order_id and oi.product_id = v_group.product_id;

        if v_inventory.quantity_on_hand - v_inventory.quantity_reserved < v_missing_quantity then
          raise exception using errcode = 'P0001', message = 'Not enough available stock to release this pre-order; adjust inventory or leave it waiting';
        end if;

        if v_missing_quantity > 0 then
          update public.product_inventory
             set quantity_reserved = quantity_reserved + v_missing_quantity
           where product_id = v_group.product_id;
          insert into public.inventory_movements(
            product_id, order_id, movement_type, quantity_reserved_delta, reason, actor_user_id
          ) values (
            v_group.product_id, p_order_id, 'reservation', v_missing_quantity,
            'Pre-order stock drop reservation', (select auth.uid())
          );
        end if;

        for v_item in
          select oi.id, oi.quantity
            from public.order_items oi
           where oi.order_id = p_order_id and oi.product_id = v_group.product_id
           order by oi.id
        loop
          select r.* into v_existing_reservation
            from public.stock_reservations r
           where r.order_item_id = v_item.id
           for update;

          if found then
            v_item_reserved := case when v_existing_reservation.status = 'active' then v_existing_reservation.quantity else 0 end;
            if v_item_reserved > v_item.quantity then
              raise exception using errcode = '55000', message = 'Existing reservation exceeds the order item quantity';
            end if;
          else
            v_item_reserved := 0;
          end if;

          v_item_missing := v_item.quantity - v_item_reserved;
          if v_item_missing > 0 then
            if found then
              update public.stock_reservations
                 set quantity = v_item.quantity,
                     status = 'active',
                     expires_at = case when v_ttl_minutes is null then null else now() + make_interval(mins => v_ttl_minutes) end,
                     released_at = null,
                     consumed_at = null
               where id = v_existing_reservation.id;
            else
              insert into public.stock_reservations(order_id, order_item_id, product_id, quantity, expires_at)
              values (
                p_order_id, v_item.id, v_group.product_id, v_item.quantity,
                case when v_ttl_minutes is null then null else now() + make_interval(mins => v_ttl_minutes) end
              );
            end if;
          end if;
        end loop;
      else
        v_has_untracked := true;
      end if;
    end loop;

    update public.orders
       set stock_status = case when v_has_untracked
         then 'confirmed_untracked'::public.stock_status
         else 'reserved'::public.stock_status end,
           order_status = 'awaiting_payment'
     where id = p_order_id;

    insert into public.order_events(order_id, event_type, from_status, to_status, actor_user_id, note)
    values (p_order_id, 'stock_confirmed_manually', v_order.order_status::text,
      'awaiting_payment', (select auth.uid()), left(p_note, 500));
  else
    for v_item in
      select r.id, r.product_id, r.quantity
        from public.stock_reservations r
       where r.order_id = p_order_id and r.status = 'active'
       order by r.product_id
       for update
    loop
      update public.product_inventory
         set quantity_reserved = quantity_reserved - v_item.quantity
       where product_id = v_item.product_id;
      update public.stock_reservations
         set status = 'released', released_at = now()
       where id = v_item.id;
      insert into public.inventory_movements(
        product_id, order_id, movement_type, quantity_reserved_delta, reason, actor_user_id
      ) values (
        v_item.product_id, p_order_id, 'reservation_release', -v_item.quantity,
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
$function$
;
