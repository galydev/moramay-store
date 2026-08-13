import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase browser client for email/password auth (T-034).
 * TODO(backend): once apps/api exposes /auth guards (T-005), confirm whether
 * the frontend should call Supabase directly for auth (current assumption)
 * or proxy through the NestJS API.
 */
let browserClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (typeof window === "undefined") {
    // During SSR/static generation we return a no-op-like client only if env
    // vars are missing. In the browser it is created lazily with real env vars.
    const serverUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const serverKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    if (!serverUrl || !serverKey) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set."
      );
    }
    return createClient(serverUrl, serverKey);
  }

  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.warn(
      "Supabase env vars are missing. Auth screens will not work until NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set to use auth."
    );
  }

  browserClient = createClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
