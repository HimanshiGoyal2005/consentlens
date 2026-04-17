const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSurgeries() {
  const { data, error } = await supabase.from('surgeries').select('*');
  if (error) {
    console.error('Error fetching surgeries:', error);
  } else {
    console.log('Surgeries in DB:', data.map(s => ({ id: s.id, name: s.name })));
  }
}

checkSurgeries();
