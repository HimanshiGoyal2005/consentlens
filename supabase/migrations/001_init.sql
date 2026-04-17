-- ConsentLens Database Schema
-- Run this in Supabase SQL Editor or via supabase db push

-- Surgeries reference table
create table surgeries (
  id varchar(50) primary key,
  name text not null,
  risks_json jsonb not null,
  sop_approved_by varchar
);

-- Consent session status enum
create type consent_status as enum ('generating', 'ready', 'in_progress', 'completed', 'approved');

-- Consent sessions — one per patient consent flow
create table consent_sessions (
  session_id uuid primary key default gen_random_uuid(),
  patient_id varchar not null,
  patient_name text,
  bed_number varchar,
  surgery_id varchar references surgeries(id),
  doctor_id varchar,
  language varchar(30),
  video_url text,
  pdf_url text,
  c2pa_hash text,
  comprehension_score integer default 0,
  status consent_status default 'generating',
  created_at timestamp default now(),
  completed_at timestamp,
  approved_at timestamp
);

-- Comprehension log — tracks each risk acknowledgement
create table comprehension_log (
  id serial primary key,
  session_id uuid references consent_sessions(session_id),
  risk_index integer,
  response varchar check (response in ('understood', 'replay_requested', 'nurse_flagged')),
  timestamp timestamp default now(),
  replay_count integer default 0
);
