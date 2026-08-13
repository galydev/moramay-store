-- subscription_billing_history: billing attempt history for a subscription.
create table if not exists subscription_billing_history (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscriptions (id) on delete cascade,
  billed_at timestamptz not null default now(),
  amount numeric(12, 2) not null check (amount >= 0),
  result text not null check (result in ('success', 'failed', 'awaiting_manual_confirmation')),
  payment_reference text
);

create index if not exists idx_subscription_billing_history_subscription_id
  on subscription_billing_history (subscription_id);
