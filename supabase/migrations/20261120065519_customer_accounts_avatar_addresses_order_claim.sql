-- Customer accounts: avatar storage, labelled delivery addresses, order claiming and review history.
alter table public.customer_profiles add column if not exists avatar_path text;
alter table public.customer_addresses add column if not exists label text not null default 'Address';
alter table public.customer_addresses add column if not exists delivery_zone_id uuid references public.delivery_zones(id) on delete set null;
alter table public.customer_addresses add constraint customer_addresses_label_length_check
 check (length(btrim(label)) between 1 and 80);
create index if not exists customer_addresses_delivery_zone_idx on public.customer_addresses(delivery_zone_id);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('customer-avatars','customer-avatars',true,2097152,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public=true,file_size_limit=2097152,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/avif'];
drop policy if exists customer_avatars_public_read on storage.objects;
create policy customer_avatars_public_read on storage.objects for select to anon,authenticated using (bucket_id='customer-avatars');
drop policy if exists customer_avatars_owner_insert on storage.objects;
create policy customer_avatars_owner_insert on storage.objects for insert to authenticated with check (bucket_id='customer-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists customer_avatars_owner_update on storage.objects;
create policy customer_avatars_owner_update on storage.objects for update to authenticated using (bucket_id='customer-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text) with check (bucket_id='customer-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists customer_avatars_owner_delete on storage.objects;
create policy customer_avatars_owner_delete on storage.objects for delete to authenticated using (bucket_id='customer-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create or replace function public.set_customer_default_address(p_address_id uuid) returns void language plpgsql security invoker set search_path='' as $$
declare v_user_id uuid := (select auth.uid());
begin
 if v_user_id is null then raise exception using errcode='42501',message='Sign in required'; end if;
 update public.customer_addresses set is_default=false where user_id=v_user_id;
 update public.customer_addresses set is_default=true where id=p_address_id and user_id=v_user_id;
 if not found then raise exception using errcode='P0002',message='Address not found'; end if;
end;$$;
revoke all on function public.set_customer_default_address(uuid) from public,anon;
grant execute on function public.set_customer_default_address(uuid) to authenticated;
create or replace function public.claim_guest_order(p_order_id uuid,p_order_access_token_hash text,p_user_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_order public.orders%rowtype;
begin
 if p_user_id is null or p_order_access_token_hash is null or p_order_access_token_hash !~ '^[0-9a-f]{64}$' then raise exception using errcode='22023',message='Invalid claim request';end if;
 select * into v_order from public.orders o where o.id=p_order_id for update;
 if not found or v_order.order_access_token_hash <> p_order_access_token_hash then raise exception using errcode='42501',message='Order access token is invalid';end if;
 if v_order.customer_user_id is null then
  update public.orders set customer_user_id=p_user_id,updated_at=now() where id=p_order_id;
  insert into public.audit_events(actor_user_id,action,resource_type,resource_id,metadata) values(p_user_id,'guest_order_claimed','order',p_order_id,jsonb_build_object('linked_to_account',true));
 elsif v_order.customer_user_id <> p_user_id then raise exception using errcode='42501',message='Order is already linked to another account';end if;
end;$$;
revoke all on function public.claim_guest_order(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.claim_guest_order(uuid,text,uuid) to service_role;
drop policy if exists customer_reviews_authenticated_select on public.customer_reviews;
create policy customer_reviews_authenticated_select on public.customer_reviews for select to authenticated using (status='approved' or public.is_store_staff() or customer_user_id=(select auth.uid()));
