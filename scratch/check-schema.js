const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://edamqdqlfscmgxwjdvsa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkYW1xZHFsZnNjbWd4d2pkdnNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQxMjkwNSwiZXhwIjoyMDkxOTg4OTA1fQ.vQ4kmBsWwkudmL8ElBtT-s0PpFzgJawVTtobJYfCe34';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
  const { data, error } = await supabase
    .from('consent_sessions')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('Columns in consent_sessions:', Object.keys(data[0]));
  } else {
    // If table is empty, we can't get columns this way easily without RPC or specific queries
    // Let's try to insert a dummy row and rollback or just check if it fails
    console.log('Table is empty. Checking via insert attempt...');
    const { error: insertError } = await supabase
      .from('consent_sessions')
      .insert({ test_non_existent_col: 'value' });
    console.log('Insert error (expected):', insertError ? insertError.message : 'No error?');
  }
}

checkSchema();
