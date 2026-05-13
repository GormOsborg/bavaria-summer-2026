import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and fill in your Supabase credentials.`,
    );
  }
  return value;
}

export function supabaseRead(): SupabaseClient {
  return createClient(assertEnv(url, "NEXT_PUBLIC_SUPABASE_URL"), assertEnv(anonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false },
  });
}

export function supabaseWrite(): SupabaseClient {
  return createClient(assertEnv(url, "NEXT_PUBLIC_SUPABASE_URL"), assertEnv(serviceKey, "SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });
}
