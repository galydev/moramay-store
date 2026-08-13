-- Support guest checkout properly: the customer account is only created
-- once payment is approved (see T-024), so `orders.customer_id` must be
-- nullable and the guest's contact info captured directly on the order.
alter table orders alter column customer_id drop not null;

alter table orders
  add column if not exists guest_full_name text,
  add column if not exists guest_email text,
  add column if not exists guest_national_id text,
  add column if not exists guest_phone text;

alter table orders
  add constraint orders_guest_info_required check (
    (placed_as_guest = false) or (guest_email is not null and guest_national_id is not null)
  );
