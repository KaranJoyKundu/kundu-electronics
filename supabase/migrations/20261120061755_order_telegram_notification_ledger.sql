-- Deduplicate order-created Telegram notifications without storing message content or secrets.
create table if not exists public.order_telegram_notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade unique,
  status text not null default 'sending' check (status in ('sending', 'sent', 'failed')),
  sent_at timestamptz,
  failure_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.order_telegram_notifications enable row level security;
revoke all on table public.order_telegram_notifications from anon, authenticated;
grant all on table public.order_telegram_notifications to service_role;

create index if not exists order_telegram_notifications_status_created_idx
  on public.order_telegram_notifications(status, created_at desc);
