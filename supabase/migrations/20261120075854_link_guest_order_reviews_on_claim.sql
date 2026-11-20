-- When a guest order is securely claimed, attach any guest review to the same customer account.
create or replace function public.claim_guest_order(
 p_order_id uuid,
 p_order_access_token_hash text,
 p_user_id uuid
)
returns void language plpgsql security definer set search_path='' as $$
declare v_order public.orders%rowtype;
begin
 if p_user_id is null or p_order_access_token_hash is null
   or p_order_access_token_hash !~ '^[0-9a-f]{64}$' then
  raise exception using errcode='22023',message='Invalid claim request';
 end if;
 select * into v_order from public.orders o where o.id=p_order_id for update;
 if not found or v_order.order_access_token_hash <> p_order_access_token_hash then
  raise exception using errcode='42501',message='Order access token is invalid';
 end if;
 if v_order.customer_user_id is null then
  update public.orders set customer_user_id=p_user_id,updated_at=now() where id=p_order_id;
  insert into public.audit_events(actor_user_id,action,resource_type,resource_id,metadata)
  values(p_user_id,'guest_order_claimed','order',p_order_id,jsonb_build_object('linked_to_account',true));
 elsif v_order.customer_user_id <> p_user_id then
  raise exception using errcode='42501',message='Order is already linked to another account';
 end if;
 update public.customer_reviews set customer_user_id=p_user_id,updated_at=now()
 where order_id=p_order_id and customer_user_id is null;
end;
$$;
revoke all on function public.claim_guest_order(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.claim_guest_order(uuid,text,uuid) to service_role;
