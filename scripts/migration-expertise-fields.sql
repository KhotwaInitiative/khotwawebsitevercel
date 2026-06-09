-- Migration script to refactor Registrations Step 4
-- Execute this script in your Supabase Database SQL Editor

-- Clean legacy columns
ALTER TABLE public.registrations DROP COLUMN IF EXISTS job_ratings;
ALTER TABLE public.registrations DROP COLUMN IF EXISTS job_titles_order;

-- Add the new expertise_fields column as JSONB when missing
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS expertise_fields jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Make phone number unique for deduped registrations
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_phone_number_unique;
ALTER TABLE public.registrations ADD CONSTRAINT registrations_phone_number_unique UNIQUE (phone_number);
