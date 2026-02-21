import { createBrowserClient, type SupabaseClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let client: SupabaseClient | null = null;

export function createClient() {
  if (client) return client;
  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
