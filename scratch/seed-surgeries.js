const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://edamqdqlfscmgxwjdvsa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkYW1xZHFsZnNjbWd4d2pkdnNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQxMjkwNSwiZXhwIjoyMDkxOTg4OTA1fQ.vQ4kmBsWwkudmL8ElBtT-s0PpFzgJawVTtobJYfCe34';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const surgeries = [
  {
    id: 'appendix_lap',
    name: 'Laparoscopic Appendectomy',
    risks_json: [
      "Bleeding & Infection",
      "Organ Injury",
      "General Anesthesia",
      "Conversion to Open",
      "Shoulder Pain"
    ]
  },
  {
    id: 'knee_replace',
    name: 'Total Knee Arthroplasty',
    risks_json: [
      "Blood Clots (DVT)",
      "Joint Stiffness",
      "Implant Failure",
      "Nerve Damage",
      "Persistent Pain"
    ]
  },
  {
    id: 'cataract',
    name: 'Phacoemulsification for Cataract',
    risks_json: [
      "Retinal Detachment",
      "Posterior Capsular Opacity",
      "Increased Eye Pressure",
      "Vitreous Loss",
      "Infection (Endophthalmitis)"
    ]
  }
];

async function seed() {
  console.log('Seeding surgeries...');
  for (const s of surgeries) {
    const { error } = await supabase.from('surgeries').upsert(s);
    if (error) console.error(`Error seeding ${s.id}:`, error.message);
    else console.log(`Successfully seeded ${s.id}`);
  }
}

seed();
