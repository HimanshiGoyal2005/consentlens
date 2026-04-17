import { createClient } from '@supabase/supabase-js';

// Browser client — safe for client components, uses anon key (respects RLS)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Server/admin client — for API routes only, bypasses RLS
// We wrap in a check to avoid crashing in browser env where SERVICE_ROLE_KEY is hidden
export const supabaseAdmin = (typeof window === 'undefined') 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
  : null;
