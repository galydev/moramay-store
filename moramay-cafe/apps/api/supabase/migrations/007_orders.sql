-- orders: a single purchase, guest or authenticated.
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  shipping_cost numeric(12, 2) not null check (shipping_cost >= 0),
  total numeric(12, 2) not null check (total >= 0),
  shipping_city text not null,
  shipping_address text not null,
  payment_reference text,
  placed_as_guest boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_customer_id on orders (customer_id);
create index if not exists idx_orders_status on orders (status);
