-- Seed default shipping rates (configurable later from the admin panel).
insert into shipping_rates (city, rate) values
  ('Medellín', 8000),
  ('Bogotá', 12000),
  ('Santa Marta', 15000),
  ('default', 18000)
on conflict (city) do nothing;
