import { supabase } from './supabase';

export interface SupabaseStatus {
  isConfigured: boolean;
  isConnected: boolean;
  projectUrl: string;
  isRlsRestricted: boolean;
  error?: string;
  tablesAvailable: {
    templates: boolean;
    contacts: boolean;
    campaigns: boolean;
    bot_rules: boolean;
    messages: boolean;
    conversations: boolean;
    companies: boolean;
    users: boolean;
  };
  lastCheckedAt?: string;
}

export const SUPABASE_RLS_FIX_SQL = `-- =========================================================================
-- Webcraft Solution - Supabase Table & RLS Policy Configuration
-- Run this in your Supabase Dashboard -> SQL Editor to enable full sync
-- =========================================================================

-- Option 1: Disable Row-Level Security for direct CRM client access
ALTER TABLE IF EXISTS public.templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bot_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Option 2: Grant full CRUD permissions to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
`;

export const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  const isConfigured = Boolean(url && key && !url.includes('mock-instance'));
  return { url, key, isConfigured };
};

export async function checkSupabaseConnection(): Promise<SupabaseStatus> {
  const { url, isConfigured } = getSupabaseConfig();
  
  const tablesAvailable = {
    templates: false,
    contacts: false,
    campaigns: false,
    bot_rules: false,
    messages: false,
    conversations: false,
    companies: false,
    users: false
  };

  if (!isConfigured) {
    return {
      isConfigured: false,
      isConnected: false,
      projectUrl: url || 'Not Configured',
      isRlsRestricted: false,
      tablesAvailable,
      lastCheckedAt: new Date().toISOString()
    };
  }

  let isConnected = false;
  let isRlsRestricted = false;
  let lastError: string | undefined = undefined;

  const tableList: Array<keyof typeof tablesAvailable> = [
    'templates',
    'contacts',
    'campaigns',
    'bot_rules',
    'messages',
    'conversations',
    'companies',
    'users'
  ];

  for (const table of tableList) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (!error) {
        tablesAvailable[table] = true;
        isConnected = true;
      } else {
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          tablesAvailable[table] = true;
          isConnected = true;
          isRlsRestricted = true;
        } else if (error.code !== 'PGRST205') {
          // Table exists but returned other error
          tablesAvailable[table] = true;
          isConnected = true;
        } else {
          tablesAvailable[table] = false;
        }
        lastError = error.message;
      }
    } catch (err: any) {
      lastError = err?.message || String(err);
    }
  }

  return {
    isConfigured: true,
    isConnected,
    projectUrl: url,
    isRlsRestricted,
    error: isConnected ? undefined : lastError,
    tablesAvailable,
    lastCheckedAt: new Date().toISOString()
  };
}

/**
 * Generic query to fetch rows from a Supabase table
 */
export async function fetchSupabaseTable<T = any>(tableName: string): Promise<{ data: T[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as T[], error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Network error' };
  }
}

/**
 * Generic upsert to save a row into a Supabase table
 */
export async function saveSupabaseRecord(
  tableName: string, 
  record: Record<string, any>, 
  onConflictKey?: string
): Promise<{ success: boolean; error?: string; isRlsError?: boolean }> {
  try {
    const query = onConflictKey 
      ? supabase.from(tableName).upsert(record, { onConflict: onConflictKey })
      : supabase.from(tableName).insert([record]);
    
    const { error } = await query;
    if (error) {
      const isRls = error.code === '42501' || error.message?.includes('row-level security');
      return { 
        success: false, 
        error: error.message, 
        isRlsError: isRls 
      };
    }
    return { success: true };
  } catch (err: any) {
    return { 
      success: false, 
      error: err?.message || 'Network error during save' 
    };
  }
}

/**
 * Generic delete for a Supabase table row
 */
export async function deleteSupabaseRecord(
  tableName: string, 
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}
