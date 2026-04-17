-- ConsentLens Seed Data
-- Run this AFTER 001_init.sql in Supabase SQL Editor
--
-- IMPORTANT: Also create a PUBLIC storage bucket called 'consent-videos'
-- Steps:
--   1. Go to Supabase Dashboard → Storage
--   2. Click "New Bucket"
--   3. Name: consent-videos
--   4. Toggle "Public bucket" ON
--   5. Click "Create bucket"
--   6. Go to bucket policies → Add policy → Allow public SELECT for anonymous users
--      Policy: (bucket_id = 'consent-videos') with operation SELECT
--   7. Add policy → Allow authenticated INSERT/UPDATE for service role
--      Or use service role key (bypasses RLS) from your API routes

-- Seed surgeries
INSERT INTO surgeries (id, name, risks_json) VALUES
(
  'appendix_lap',
  'Laparoscopic Appendectomy',
  '["Bleeding during or after surgery may require a blood transfusion", "Infection at the surgical site or inside the abdomen", "Injury to nearby organs such as the bowel or bladder", "Allergic reaction to general anesthesia", "Blood clots forming in the legs or lungs after surgery"]'::jsonb
),
(
  'cholecystectomy',
  'Laparoscopic Cholecystectomy',
  '["Bile duct injury that may need additional surgery to repair", "Bleeding from the liver bed or surgical site", "Infection in the abdomen or at the incision wounds", "Retained gallstones in the bile duct requiring further procedures", "Conversion to open surgery if laparoscopic approach is not safe"]'::jsonb
),
(
  'c_section',
  'Caesarean Section',
  '["Heavy bleeding during or after delivery may require transfusion", "Infection of the uterus or surgical wound", "Injury to the bladder or bowel during the operation", "Blood clots in legs or lungs in the weeks after surgery", "Adverse reaction to spinal or general anesthesia"]'::jsonb
);

-- Seed demo consent session
INSERT INTO consent_sessions (
  patient_id, patient_name, bed_number, surgery_id,
  doctor_id, language, status, video_url, comprehension_score
) VALUES (
  'DEMO001', 'Ramu Yadav', '12', 'appendix_lap',
  'DR001', 'bhojpuri', 'ready', '/fallback-video.mp4', 0
);
