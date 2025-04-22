import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Creates a Supabase client that bypasses RLS for server-side operations
 * This should ONLY be used on the server-side for operations like token validation
 * that need to access tables regardless of user authentication
 */
export function createAdminClient() {
  // Make sure we're on the server
  if (typeof window !== "undefined") {
    throw new Error("Admin client must only be used on the server!");
  }

  // Ensure environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn("Missing service role key - falling back to public client");

    // Fallback to anon key if service role key is not available
    return createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        },
      }
    );
  }

  // Use service role key to bypass RLS
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
