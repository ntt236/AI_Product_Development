import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for browser/client-side components.
 * Uses public environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (hoặc NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) are set.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
