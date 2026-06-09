create table if not exists public.registrations (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  full_name text not null,
  gender text not null,
  email text not null,
  phone_number text not null unique,
  university text not null,
  major text not null,
  uni_id text not null,
  graduation_year text not null,
  linkedin text,
  skills text[] not null,
  experience_projects text,
  commitment_duration text not null,
  cv_path text not null,
  cv_url text not null,
  companies_ratings jsonb not null,
  expertise_fields jsonb not null,
  constraint registrations_uni_id_unique unique (uni_id)
);

alter table public.registrations enable row level security;

create policy "Allow service role full access"
on public.registrations
as permissive
for all
to service_role
using (true)
with check (true);
