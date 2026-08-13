-- product_variants: specific presentation of a product (weight/grind for
-- coffee, size/color for merch). stock_status is derived from
-- stock_quantity via a generated column so it stays consistent.
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  weight text check (weight in ('250g', '340g')),
  grind_type text check (grind_type in ('whole_bean', 'fine', 'medium', 'coarse')),
  attribute_label text,
  price numeric(12, 2) not null check (price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  stock_status text generated always as (
    case when stock_quantity > 0 then 'in_stock' else 'out_of_stock' end
  ) stored
);

create index if not exists idx_product_variants_product_id on product_variants (product_id);
