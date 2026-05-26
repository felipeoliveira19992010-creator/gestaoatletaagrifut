create table if not exists public.app_storage (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_storage enable row level security;

comment on table public.app_storage is
  'Key/value storage used by the Agrifut Netlify Function. Browser clients do not access this table directly.';
