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

// Safely resolve environment variables across Vite client and Node.js backend
const envUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL)) ||
  "";

const envKey = 
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) ||
  (typeof process !== 'undefined' && (process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) ||
  "";

let currentUrl = getStoredValue("omniwaba_supabase_url", envUrl);
let currentKey = getStoredValue("omniwaba_supabase_key", envKey);

/**
 * Validates whether a provided key is a service_role key.
 * Service role keys MUST NEVER be exposed in client-side code.
 */
export function isServiceRoleKey(key: string): boolean {
  if (!key) return false;
  try {
    const parts = key.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return payload.role === 'service_role';
    }
  } catch {}
  return key.toLowerCase().includes('service_role');
}

export function getSupabaseConfig(): { url: string; key: string; isConfigured: boolean; isServiceRoleWarning: boolean } {
  const isServiceRole = isServiceRoleKey(currentKey);
  const isValidUrl = currentUrl && !currentUrl.includes("mock-instance") && (currentUrl.startsWith("http://") || currentUrl.startsWith("https://"));
  const isValidKey = currentKey && !currentKey.includes("mock-anon-key") && currentKey.length > 20;

  return {
    url: currentUrl,
    key: currentKey,
    isConfigured: Boolean(isValidUrl && isValidKey),
    isServiceRoleWarning: isServiceRole,
  };
}

export let supabase: SupabaseClient = createClient(
  currentUrl || "https://mock-instance.supabase.co",
  currentKey || "mock-anon-key"
);

export function updateSupabaseClient(url: string, key: string): SupabaseClient {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();

  if (isServiceRoleKey(cleanKey)) {
    console.error('[SECURITY ALERT] Administrative service role credentials detected in browser client. Please use the public ANON key in client browsers.');
  }

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
