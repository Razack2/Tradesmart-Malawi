import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseUrl = (() => {
  if (!rawSupabaseUrl) return rawSupabaseUrl;
  try {
    const u = new URL(rawSupabaseUrl);
    if (u.pathname && u.pathname !== "/") {
      console.warn('Supabase URL contains a path; using origin instead:', u.origin);
    }
    return u.origin;
  } catch (e) {
    // If it's not a full URL, fall back to trimming trailing slashes.
    return rawSupabaseUrl.replace(/\/+$/, "");
  }
})();

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const testConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    console.log('Supabase connection successful')
    return true
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return false
  }
}