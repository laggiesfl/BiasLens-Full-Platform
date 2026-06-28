"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components (browser).
 * Uses the publishable/anon key — all data access is protected by
 * Row Level Security policies defined in the database.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
