create table if not exists public.registrations (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  -- Personal Information
  full_name text not null,
  gender text not null,
  email text not null,
  phone_number text not null,
  -- Academic Information
  university text not null,
  major text not null,
  uni_id text not null,
  graduation_year text not null,
  linkedin text,
  -- Concerns & Preferences
  skills text[] not null,
  experience_projects text not null,
  free_space text,
  commitment_duration text not null,
  cv_path text not null,
  cv_url text not null,
  -- Company & Job Ratings (JSONB format: {"Apple": 5, "Microsoft": 3, ...})
  companies_ratings jsonb not null,
  job_ratings jsonb not null,
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
