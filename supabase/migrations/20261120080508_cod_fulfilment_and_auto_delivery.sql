-- Allow confirmed COD orders to enter fulfilment and auto-deliver 24 hours after dispatch.
create or replace function public.update_order_fulfilment_status(
 p_order_id uuid,
 p_next_status public.fulfilment_status,
 p_note text default null
)
returns void language plpgsql security definer set search_path='' as $$
declare v_order public.orders%rowtype; v_allowed boolean:=false;
begin
 if not public.is_store_staff() then raise exception using errcode='42501',message='Staff permission required';end if;
 if p_next_status is null or (p_note is not null and length(p_note)>500) then raise exception using errcode='22023',message='Invalid fulfilment update';end if;
 select * into v_order from public.orders o where o.id=p_order_id for update;
 if not found or v_order.order_status <> 'confirmed'
   or not (v_order.payment_status='verified' or (v_order.payment_preference='cash_on_delivery' and v_order.payment_status='not_submitted')) then
  raise exception using errcode='55000',message='Only confirmed paid online or accepted COD orders can progress through fulfilment';
 end if;
 v_allowed := (v_order.fulfilment_status='unfulfilled' and p_next_status='processing')
   or (v_order.fulfilment_status='processing' and p_next_status='packed')
   or (v_order.fulfilment_status='packed' and p_next_status='shipped')
   or (v_order.fulfilment_status='shipped' and p_next_status='delivered');
 if not v_allowed then raise exception using errcode='55000',message='Invalid fulfilment status transition';end if;
 update public.orders set fulfilment_status=p_next_status,updated_at=now() where id=p_order_id;
 insert into public.order_events(order_id,event_type,from_status,to_status,actor_user_id,note)
 values(p_order_id,'fulfilment_status_changed',v_order.fulfilment_status::text,p_next_status::text,(select auth.uid()),left(p_note,500));
 insert into public.audit_events(actor_user_id,action,resource_type,resource_id,metadata)
 values((select auth.uid()),'fulfilment_status_changed','order',p_order_id,jsonb_build_object('from',v_order.fulfilment_status,'to',p_next_status));
end;$$;
revoke all on function public.update_order_fulfilment_status(uuid,public.fulfilment_status,text) from public,anon;
grant execute on function public.update_order_fulfilment_status(uuid,public.fulfilment_status,text) to authenticated;

create or replace function public.auto_deliver_shipped_orders()
returns integer language plpgsql security definer set search_path='' as $$
declare v_delivered integer:=0;
begin
 with eligible as (
  select o.id from public.orders o
  join lateral (
   select e.created_at from public.order_events e
   where e.order_id=o.id and e.event_type='fulfilment_status_changed' and e.to_status='shipped'
   order by e.created_at desc,e.id desc limit 1
  ) latest_shipment on true
  where o.order_status='confirmed'
   and o.fulfilment_status='shipped'
   and latest_shipment.created_at<=now()-interval '24 hours'
   and (o.payment_status='verified' or (o.payment_preference='cash_on_delivery' and o.payment_status='not_submitted'))
  for update of o skip locked
 ),
 delivered as (
  update public.orders o set fulfilment_status='delivered',updated_at=now()
  from eligible e where o.id=e.id returning o.id
 ),
 logged as (
  insert into public.order_events(order_id,event_type,from_status,to_status,actor_user_id,note)
  select id,'fulfilment_status_changed','shipped','delivered',null,'Automatically delivered 24 hours after shipment.'
  from delivered returning order_id
 ),
 audited as (
  insert into public.audit_events(actor_user_id,action,resource_type,resource_id,metadata)
  select null,'auto_delivered_after_24h','order',order_id,jsonb_build_object('from','shipped','to','delivered','trigger','24h_after_shipment')
  from logged returning id
 )
 select count(*)::integer into v_delivered from logged;
 return v_delivered;
end;$$;
revoke all on function public.auto_deliver_shipped_orders() from public,anon,authenticated;
grant execute on function public.auto_deliver_shipped_orders() to service_role;
