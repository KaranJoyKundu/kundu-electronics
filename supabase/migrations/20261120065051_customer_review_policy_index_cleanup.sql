-- Keep a single approved-review read policy and index the moderator foreign key.
drop policy if exists customer_reviews_public_approved_select on public.customer_reviews;
drop policy if exists customer_reviews_staff_select on public.customer_reviews;
create policy customer_reviews_anon_approved_select on public.customer_reviews
for select to anon using (status = 'approved');
create policy customer_reviews_authenticated_select on public.customer_reviews
for select to authenticated using (status = 'approved' or public.is_store_staff());
create index if not exists customer_reviews_moderator_user_idx on public.customer_reviews(moderator_user_id);
