-- return_requests: return/claim request associated with an order.
create table if not exists return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  channel text not null check (channel in ('site_button', 'whatsapp', 'email')),
  reason text,
  status text not null default 'open' check (status in ('open', 'in_review', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists idx_return_requests_order_id on return_requests (order_id);
