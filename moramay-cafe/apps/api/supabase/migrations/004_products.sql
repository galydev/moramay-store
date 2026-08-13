-- products: sellable items (coffee or merch).
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('coffee', 'merch')),
  name text not null,
  description text,
  origin text,
  roast_date date,
  lot_number text,
  base_price numeric(12, 2) not null check (base_price >= 0),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on products (category);
create index if not exists idx_products_status on products (status);
