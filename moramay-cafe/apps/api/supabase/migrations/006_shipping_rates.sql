-- shipping_rates: configurable shipping cost per city (never hardcoded).
create table if not exists shipping_rates (
  id uuid primary key default gen_random_uuid(),
  city text not null unique,
  rate numeric(12, 2) not null check (rate >= 0),
  updated_at timestamptz not null default now()
);
