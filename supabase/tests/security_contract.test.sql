-- pgTAP security contract for 0001_initial_schema.sql.
-- Run with `supabase test db` against a disposable local database after applying migrations.
-- These checks cover SQL privileges and policy presence; add identity/row-fixture tests
-- before enabling production checkout.

begin;
create extension if not exists pgtap with schema extensions;
select plan(23);

select ok(
  (select bool_and(c.relrowsecurity)
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'),
  'RLS is enabled on every public application table'
);

select ok(not has_table_privilege('anon', 'public.product_inventory', 'select'),
  'anonymous users cannot read inventory');
select ok(not has_table_privilege('anon', 'public.inventory_movements', 'select'),
  'anonymous users cannot read inventory history');
select ok(not has_table_privilege('anon', 'public.stock_reservations', 'select'),
  'anonymous users cannot read stock reservations');
select ok(not has_table_privilege('anon', 'public.orders', 'select'),
  'anonymous users cannot read orders');
select ok(not has_table_privilege('anon', 'public.payment_submissions', 'select'),
  'anonymous users cannot read payment submissions');
select ok(not has_table_privilege('anon', 'public.audit_events', 'select'),
  'anonymous users cannot read audit history');

select ok(has_column_privilege('anon', 'public.products', 'price_bdt', 'select'),
  'anonymous users can read the customer-facing selling price');
select ok(not has_table_privilege('anon', 'public.products', 'insert'),
  'anonymous users cannot create products');
select ok(exists (
  select 1 from pg_policies
   where schemaname = 'public' and tablename = 'products'
     and policyname = 'products_staff_manage'
     and coalesce(qual, '') like '%is_store_staff%'
     and coalesce(with_check, '') like '%is_store_staff%'
), 'product mutations are guarded by the staff role policy');
select ok(not has_table_privilege('authenticated', 'public.payment_submissions', 'insert'),
  'customers cannot insert payment submissions directly');
select ok(not has_table_privilege('authenticated', 'public.orders', 'insert'),
  'customers cannot insert orders directly');
select ok(not has_table_privilege('authenticated', 'public.payment_submissions', 'update'),
  'customers cannot rewrite payment submissions after creating them');

select ok(not has_function_privilege(
  'anon', 'public.create_checkout_order(uuid,text,text,jsonb,jsonb,uuid,uuid)', 'execute'
), 'anonymous users cannot call privileged checkout');
select ok(has_function_privilege(
  'service_role', 'public.create_checkout_order(uuid,text,text,jsonb,jsonb,uuid,uuid)', 'execute'
), 'trusted server service role can call checkout');
select ok(not has_function_privilege(
  'anon', 'public.submit_manual_payment(uuid,text,uuid,public.payment_method,text,text,bigint)', 'execute'
), 'anonymous users cannot submit payment through the service-only function');
select ok(has_function_privilege(
  'service_role', 'public.submit_manual_payment(uuid,text,uuid,public.payment_method,text,text,bigint)', 'execute'
), 'trusted server service role can submit manual payment references');
select ok(not has_function_privilege(
  'anon', 'public.verify_manual_payment(uuid,public.payment_event_type,text,text)', 'execute'
), 'anonymous users cannot verify payments');
select ok(has_function_privilege('anon', 'public.get_public_checkout_config()', 'execute'),
  'anonymous users can read only the customer-safe checkout configuration function');

select is(
  (select public::text from storage.buckets where id = 'product-images'),
  'false',
  'product image bucket is private and relies on row-level object policies'
);
select ok(exists (
  select 1 from pg_policies
   where schemaname = 'storage' and tablename = 'objects'
     and policyname = 'product_images_published_public_read'
), 'only published product image paths have an anonymous object-read policy');
select ok(exists (
  select 1 from pg_policies
   where schemaname = 'storage' and tablename = 'objects'
     and policyname = 'product_images_staff_preview'
     and coalesce(qual, '') like '%is_store_staff%'
), 'authenticated staff can preview private product images without exposing draft images publicly');

select ok(has_function_privilege('authenticated', 'public.set_primary_product_image(uuid,uuid)', 'execute')
  and not has_function_privilege('anon', 'public.set_primary_product_image(uuid,uuid)', 'execute'),
  'primary product image changes are restricted to authenticated staff through an atomic function');

select * from finish();
rollback;
