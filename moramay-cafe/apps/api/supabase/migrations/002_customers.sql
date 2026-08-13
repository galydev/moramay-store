-- customers: linked to Supabase Auth users (auth.users.id).
create table if not exists customers (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  national_id text,
  phone text,
  billing_address text,
  shipping_address text,
  city text,
  created_via text not null default 'self_registered'
    check (created_via in ('self_registered', 'guest_checkout')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customers_email on customers (email);
