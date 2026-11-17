create or replace function public.count_catalog_products(
  p_query text default ''::text,
  p_category_slug text default null::text,
  p_min_price_bdt bigint default null::bigint,
  p_max_price_bdt bigint default null::bigint
)
returns bigint
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_query text := lower(btrim(coalesce(p_query, '')));
  v_sanitized_query text;
  v_prefix_query text;
  v_total bigint;
begin
  if p_min_price_bdt is not null and p_min_price_bdt < 0 then
    raise exception using errcode = '22023', message = 'Minimum price must not be negative';
  end if;
  if p_max_price_bdt is not null and p_max_price_bdt < 0 then
    raise exception using errcode = '22023', message = 'Maximum price must not be negative';
  end if;
  if p_min_price_bdt is not null and p_max_price_bdt is not null and p_min_price_bdt > p_max_price_bdt then
    raise exception using errcode = '22023', message = 'Minimum price cannot exceed maximum price';
  end if;
  if length(v_query) > 120 then
    raise exception using errcode = '22023', message = 'Search query is too long';
  end if;

  v_sanitized_query := regexp_replace(v_query, '[^[:alnum:]_]+', ' ', 'g');
  select string_agg(token || ':*', ' & ') into v_prefix_query
    from regexp_split_to_table(v_sanitized_query, '\s+') as token
   where token <> '';

  select count(*) into v_total
  from public.products p
  join public.categories c on c.id = p.category_id and c.status = 'published'
  where p.status = 'published'
    and (p_category_slug is null or c.slug = p_category_slug)
    and (p_min_price_bdt is null or p.price_bdt >= p_min_price_bdt)
    and (p_max_price_bdt is null or p.price_bdt <= p_max_price_bdt)
    and (
      v_query = ''
      or (v_prefix_query is not null and p.search_document @@ to_tsquery('simple'::regconfig, v_prefix_query))
      or strpos(lower(p.name), v_query) > 0
      or strpos(lower(coalesce(p.sku, '')), v_query) > 0
      or strpos(lower(coalesce(p.brand, '')), v_query) > 0
    );
  return coalesce(v_total, 0);
end;
$function$;

revoke all on function public.count_catalog_products(text, text, bigint, bigint) from public, anon, authenticated;
grant execute on function public.count_catalog_products(text, text, bigint, bigint) to anon, authenticated;
