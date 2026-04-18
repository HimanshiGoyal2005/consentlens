import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate Supabase URL format
const isValidUrl = url => {
  if (!url) return false
  try {
    new URL(url)
    return url.startsWith('https://')
  } catch {
    return false
  }
}

// Browser client — safe for client components, uses anon key (respects RLS)
export const supabase =
  isValidUrl(supabaseUrl) && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// Server/admin client — for API routes only, bypasses RLS
export const supabaseAdmin =
  typeof window === 'undefined' && isValidUrl(supabaseUrl) && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null
