
import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getStoredValue(key: string, envFallback: string): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored && stored.trim()) return stored.trim();
    } catch {}
  }
  return envFallback || "";
}

let currentUrl = getStoredValue("omniwaba_supabase_url", import.meta.env.VITE_SUPABASE_URL || "");
let currentKey = getStoredValue("omniwaba_supabase_key", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "");

export function getSupabaseConfig(): { url: string; key: string; isConfigured: boolean } {
  return {
    url: currentUrl,
    key: currentKey,
    isConfigured: Boolean(currentUrl && currentKey && !currentUrl.includes("mock-instance")),
  };
}

export let supabase: SupabaseClient = createClient(
  currentUrl || "https://mock-instance.supabase.co",
  currentKey || "mock-anon-key"
);

export function updateSupabaseClient(url: string, key: string): SupabaseClient {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();
  currentUrl = cleanUrl;
  currentKey = cleanKey;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem("omniwaba_supabase_url", cleanUrl);
      window.localStorage.setItem("omniwaba_supabase_key", cleanKey);
    } catch {}
  }

  supabase = createClient(
    cleanUrl || "https://mock-instance.supabase.co",
    cleanKey || "mock-anon-key"
  );
  return supabase;
}

