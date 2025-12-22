import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server-side client (untyped for flexibility)
export const createServerSupabaseClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// More permissive client for server actions - bypasses strict type checking
// for tables not defined in the Database schema
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
