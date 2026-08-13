-- subscriptions: monthly subscription of a customer to one or more products.
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  status text not null default 'pending_confirmation'
    check (status in ('active', 'paused', 'cancelled', 'pending_confirmation')),
  billing_mode text not null check (billing_mode in ('automatic', 'manual_confirmation')),
  frequency text not null default 'monthly' check (frequency = 'monthly'),
  next_billing_date date not null,
  payment_source_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_customer_id on subscriptions (customer_id);
create index if not exists idx_subscriptions_status on subscriptions (status);
create index if not exists idx_subscriptions_next_billing_date on subscriptions (next_billing_date);
