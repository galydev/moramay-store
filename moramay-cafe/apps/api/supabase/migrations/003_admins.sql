-- admins: linked to Supabase Auth users, self-referencing invited_by.
create table if not exists admins (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  invited_by uuid references admins (id) on delete set null,
  status text not null default 'invited'
    check (status in ('invited', 'active', 'revoked')),
  created_at timestamptz not null default now()
);

create index if not exists idx_admins_email on admins (email);
