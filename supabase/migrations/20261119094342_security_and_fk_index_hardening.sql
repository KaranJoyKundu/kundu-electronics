-- Add FK indexes identified by the live Supabase performance advisor.
-- These indexes are additive; no rows or business data are changed.
create index if not exists admin_profiles_created_by_idx on public.admin_profiles(created_by);
create index if not exists audit_events_actor_user_id_idx on public.audit_events(actor_user_id);
create index if not exists inventory_movements_actor_user_id_idx on public.inventory_movements(actor_user_id);
create index if not exists order_events_actor_user_id_idx on public.order_events(actor_user_id);
create index if not exists order_items_variant_id_idx on public.order_items(variant_id);
create index if not exists orders_delivery_zone_id_idx on public.orders(delivery_zone_id);
create index if not exists payment_events_actor_user_id_idx on public.payment_events(actor_user_id);
create index if not exists payment_method_settings_updated_by_idx on public.payment_method_settings(updated_by);
create index if not exists payment_submissions_verified_by_idx on public.payment_submissions(verified_by);
create index if not exists stock_reservations_product_id_idx on public.stock_reservations(product_id);
create index if not exists store_settings_updated_by_idx on public.store_settings(updated_by);

-- Reduce unnecessary anonymous access to role-introspection helpers.
-- Authenticated RLS policies still require is_store_admin/is_store_staff.
-- Their SECURITY DEFINER wrappers call has_store_role as the function owner.
revoke all on function public.has_store_role(public.admin_role[]) from public, anon, authenticated;
revoke all on function public.is_store_admin() from anon;
revoke all on function public.is_store_staff() from anon;
grant execute on function public.is_store_admin() to authenticated;
grant execute on function public.is_store_staff() to authenticated;

-- Intentionally no direct policies or table grants on this table. Rate limiting
-- is only mediated by the service-role-only consume_rate_limit RPC.
comment on table public.rate_limit_windows is
  'Private rate-limit state. No anon/authenticated policies or grants by design; accessed only by service_role via consume_rate_limit.';
