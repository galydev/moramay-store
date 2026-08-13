-- order_items: line items that make up an order.
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_variant_id uuid not null references product_variants (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0)
);

create index if not exists idx_order_items_order_id on order_items (order_id);
create index if not exists idx_order_items_product_variant_id on order_items (product_variant_id);
