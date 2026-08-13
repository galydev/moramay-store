-- subscription_items: products included in a subscription.
create table if not exists subscription_items (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscriptions (id) on delete cascade,
  product_variant_id uuid not null references product_variants (id) on delete restrict,
  quantity integer not null check (quantity > 0)
);

create index if not exists idx_subscription_items_subscription_id on subscription_items (subscription_id);
