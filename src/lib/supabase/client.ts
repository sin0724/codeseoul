import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let client: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (typeof window === 'undefined') {
    return createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
  
  if (client) return client;
  
  client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'codeseoul-auth',
      storage: window.localStorage,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  
  return client;
}
