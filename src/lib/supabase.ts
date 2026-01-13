import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing. Check your environment variables.')
}

export const supabase = createSupabaseClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'plantify-auth-token' // Explicitly set storage key
    }
})
