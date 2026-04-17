-- Migration: Add Emergency Kin Consent columns
-- Run this in your Supabase SQL Editor

-- 1. Create the consent_actor_type enum
CREATE TYPE consent_actor_type AS ENUM ('patient', 'kin');

-- 2. Add the columns to consent_sessions
ALTER TABLE consent_sessions 
ADD COLUMN consent_actor consent_actor_type DEFAULT 'patient',
ADD COLUMN emergency_reason text,
ADD COLUMN kin_name text,
ADD COLUMN kin_phone text,
ADD COLUMN kin_relation text;

-- 3. Note: PostgREST cache might need a refresh. 
-- In Supabase dashboard, go to API settings and click "Reload PostgREST Schema" if errors persist.
