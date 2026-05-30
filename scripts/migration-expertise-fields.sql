-- Migration script to refactor Registrations Step 4
-- Execute this script in your Supabase Database SQL Editor

-- Drop the job_titles_order column if it exists
ALTER TABLE public.registrations DROP COLUMN IF EXISTS job_titles_order;

-- Add the new expertise_fields column as JSONB
ALTER TABLE public.registrations ADD COLUMN expertise_fields jsonb;
