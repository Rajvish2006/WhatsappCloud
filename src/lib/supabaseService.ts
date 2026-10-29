import { supabase } from './supabase';

export interface SupabaseStatus {
  isConfigured: boolean;
  isConnected: boolean;
  projectUrl: string;
  isRlsRestricted: boolean;
  error?: string;
  tablesAvailable: {
    companies: boolean;
    users: boolean;
    contacts: boolean;
    contact_groups: boolean;
    templates: boolean;
    campaigns: boolean;
    messages: boolean;
    conversations: boolean;
    bot_rules: boolean;
    credit_wallets: boolean;
    credit_ledger: boolean;
    tenant_api_keys: boolean;
    audit_logs: boolean;
    app_settings: boolean;
  };
  tableCounts?: Record<string, number>;
  lastCheckedAt?: string;
  lastSyncedAt?: string;
}

export const SUPABASE_RLS_FIX_SQL = `-- =========================================================================
-- Webcraft Solution - Supabase Table Creation & Full Permissions Script
-- Run this in your Supabase Dashboard -> SQL Editor to enable full sync
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
    id TEXT PRIMARY KEY,
    company_uid TEXT,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    plan_id TEXT,
    plan_name TEXT,
    owner_name TEXT,
    owner_email TEXT,
    phone TEXT,
    mobile TEXT,
    address TEXT,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    currency TEXT DEFAULT 'INR',
    cached_credit_balance NUMERIC DEFAULT 0,
    waba_id TEXT,
    phone_number_id TEXT,
    access_token TEXT,
    app_id TEXT,
    app_secret TEXT,
    webhook_verify_token TEXT,
    graph_api_version TEXT DEFAULT 'v22.0',
    display_phone_number TEXT,
    verified_name TEXT,
    quality_rating TEXT,
    webhook_connected BOOLEAN DEFAULT FALSE,
    webhook_connected_at TIMESTAMPTZ,
    hard_secret_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT,
    role TEXT NOT NULL DEFAULT 'agent',
    status TEXT DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE,
    avatar TEXT,
    last_login_at TIMESTAMPTZ,
    is_online BOOLEAN DEFAULT FALSE,
    active_chat_count INT DEFAULT 0,
    max_chat_capacity INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Contacts Table
CREATE TABLE IF NOT EXISTS public.contacts (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    phone TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    country_code TEXT DEFAULT '+91',
    consent_status TEXT DEFAULT 'OPTED_IN',
    consent_source TEXT DEFAULT 'MANUAL',
    consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
    tags JSONB DEFAULT '[]'::jsonb,
    groups JSONB DEFAULT '[]'::jsonb,
    custom_attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Contact Groups Table
CREATE TABLE IF NOT EXISTS public.contact_groups (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    contact_count INT DEFAULT 0,
    is_dynamic BOOLEAN DEFAULT FALSE,
    filter_criteria JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WhatsApp Templates Table
CREATE TABLE IF NOT EXISTS public.templates (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    meta_template_id TEXT,
    name TEXT NOT NULL,
    whatsapp_template_name TEXT,
    category TEXT NOT NULL DEFAULT 'MARKETING',
    language TEXT NOT NULL DEFAULT 'en_US',
    status TEXT NOT NULL DEFAULT 'APPROVED',
    rejection_reason TEXT,
    header_type TEXT DEFAULT 'NONE',
    header_text TEXT,
    body_text TEXT NOT NULL DEFAULT '',
    variables_count INT DEFAULT 0,
    sample_values JSONB DEFAULT '[]'::jsonb,
    footer_text TEXT,
    buttons JSONB DEFAULT '[]'::jsonb,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'MARKETING',
    template_id TEXT,
    template_name TEXT,
    status TEXT NOT NULL DEFAULT 'queued',
    total_recipients INT DEFAULT 0,
    recipient_count INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    read_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    skipped_count INT DEFAULT 0,
    credits_reserved INT DEFAULT 0,
    reserved_credits INT DEFAULT 0,
    credits_consumed INT DEFAULT 0,
    consumed_credits INT DEFAULT 0,
    credits_refunded INT DEFAULT 0,
    released_credits INT DEFAULT 0,
    batch_size INT DEFAULT 50,
    concurrency INT DEFAULT 4,
    send_rate_ms INT DEFAULT 200,
    max_retry_attempts INT DEFAULT 3,
    variable_mapping JSONB DEFAULT '{}'::jsonb,
    recipients JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT,
    company_id TEXT,
    direction TEXT NOT NULL DEFAULT 'outgoing',
    sender_type TEXT NOT NULL DEFAULT 'AGENT',
    sender_name TEXT,
    sender_id TEXT,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT DEFAULT 'none',
    template_id TEXT,
    delivery_status TEXT DEFAULT 'sent',
    error_code TEXT,
    waba_message_id TEXT,
    whatsapp_message_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    is_internal_note BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Chat Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    contact_id TEXT,
    contact_phone TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    assigned_agent_id TEXT,
    assigned_agent_name TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    is_bot_handled BOOLEAN DEFAULT FALSE,
    unread_count INT DEFAULT 0,
    last_message TEXT,
    last_message_time TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Bot Automation Rules Table
CREATE TABLE IF NOT EXISTS public.bot_rules (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    name TEXT NOT NULL,
    priority INT DEFAULT 10,
    trigger_type TEXT DEFAULT 'CONTAINS',
    trigger_text TEXT,
    response_text TEXT,
    keywords JSONB DEFAULT '["help"]'::jsonb,
    case_sensitive BOOLEAN DEFAULT FALSE,
    action_type TEXT DEFAULT 'SEND_TEXT',
    reply_text TEXT,
    hit_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Credit Wallets Table
CREATE TABLE IF NOT EXISTS public.credit_wallets (
    company_id TEXT PRIMARY KEY,
    marketing_total NUMERIC DEFAULT 0,
    marketing_reserved NUMERIC DEFAULT 0,
    marketing_consumed NUMERIC DEFAULT 0,
    utility_total NUMERIC DEFAULT 0,
    utility_reserved NUMERIC DEFAULT 0,
    utility_consumed NUMERIC DEFAULT 0,
    last_reconciled_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Credit Ledger Table
CREATE TABLE IF NOT EXISTS public.credit_ledger (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    before_balance NUMERIC DEFAULT 0,
    after_balance NUMERIC DEFAULT 0,
    reference_type TEXT,
    reference_id TEXT,
    reason TEXT,
    idempotency_key TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor_id TEXT,
    actor_email TEXT
);

-- 12. Tenant API Keys Table
CREATE TABLE IF NOT EXISTS public.tenant_api_keys (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    name TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    raw_key_once TEXT,
    scopes JSONB DEFAULT '[]'::jsonb,
    rate_limit_rpm INT DEFAULT 300,
    current_minute_usage INT DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE',
    is_hardened_secret BOOLEAN DEFAULT TRUE,
    description TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    company_id TEXT,
    company_name TEXT,
    actor_id TEXT,
    actor_email TEXT,
    actor_role TEXT,
    category TEXT,
    action TEXT,
    details TEXT,
    ip_address TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 14. App Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY DEFAULT 'global_config',
    enable_agents BOOLEAN DEFAULT TRUE,
    show_only_assigned_chats BOOLEAN DEFAULT FALSE,
    webhook_callback_url TEXT,
    blacklisted_phone_numbers TEXT,
    project_name TEXT DEFAULT 'OmniWABA',
    site_url TEXT DEFAULT 'https://whatsappcloud-virid.vercel.app',
    meta_app_secret TEXT,
    meta_app_id TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- Disable RLS and Grant Full Privileges for Seamless CRM Sync
-- =========================================================================
ALTER TABLE IF EXISTS public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bot_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.credit_wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.credit_ledger DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tenant_api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_settings DISABLE ROW LEVEL SECURITY;

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
    companies: false,
    users: false,
    contacts: false,
    contact_groups: false,
    templates: false,
    campaigns: false,
    messages: false,
    conversations: false,
    bot_rules: false,
    credit_wallets: false,
    credit_ledger: false,
    tenant_api_keys: false,
    audit_logs: false,
    app_settings: false
  };

  const tableCounts: Record<string, number> = {};

  if (!isConfigured) {
    return {
      isConfigured: false,
      isConnected: false,
      projectUrl: url || 'Not Configured',
      isRlsRestricted: false,
      tablesAvailable,
      tableCounts,
      lastCheckedAt: new Date().toISOString()
    };
  }

  let isConnected = false;
  let isRlsRestricted = false;
  let lastError: string | undefined = undefined;

  const tableList: Array<keyof typeof tablesAvailable> = [
    'companies',
    'users',
    'contacts',
    'contact_groups',
    'templates',
    'campaigns',
    'messages',
    'conversations',
    'bot_rules',
    'credit_wallets',
    'credit_ledger',
    'tenant_api_keys',
    'audit_logs',
    'app_settings'
  ];

  for (const table of tableList) {
    try {
      const { data, count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        tablesAvailable[table] = true;
        tableCounts[table] = count || 0;
        isConnected = true;
      } else {
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          tablesAvailable[table] = true;
          isConnected = true;
          isRlsRestricted = true;
          tableCounts[table] = 0;
        } else if (error.code !== 'PGRST205' && !error.message?.includes('does not exist')) {
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
    tableCounts,
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
  onConflictKey = 'id'
): Promise<{ success: boolean; error?: string; isRlsError?: boolean }> {
  try {
    const { error } = await supabase
      .from(tableName)
      .upsert(record, { onConflict: onConflictKey });
    
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
 * Asynchronously syncs a record to Supabase in the background without blocking the UI
 */
export function syncRecordAsync(tableName: string, record: Record<string, any>, onConflictKey = 'id') {
  saveSupabaseRecord(tableName, record, onConflictKey).catch(err => {
    console.warn(`[Supabase Background Sync] Failed to sync to ${tableName}:`, err);
  });
}

/**
 * Generic delete for a Supabase table row
 */
export async function deleteSupabaseRecord(
  tableName: string, 
  id: string,
  idColumn = 'id'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from(tableName).delete().eq(idColumn, id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Pushes all in-memory platform state into Supabase tables
 */
export async function pushAllDataToSupabase(payload: {
  companies: any[];
  users: any[];
  contacts: any[];
  groups: any[];
  templates: any[];
  campaigns: any[];
  messages: Record<string, any[]>;
  conversations: any[];
  botRules: any[];
  wallets: Record<string, any>;
  ledger: any[];
  apiKeys: any[];
  auditLogs: any[];
  appSettings: any;
}): Promise<{
  success: boolean;
  syncedCounts: Record<string, number>;
  errors: Record<string, string>;
}> {
  const syncedCounts: Record<string, number> = {};
  const errors: Record<string, string> = {};

  // 1. Companies
  try {
    const companyRecords = payload.companies.map(c => ({
      id: c.id,
      company_uid: c.company_uid || c.code,
      name: c.name,
      code: c.code,
      status: c.status,
      plan_id: c.planId,
      plan_name: c.planName,
      owner_name: c.ownerName,
      owner_email: c.ownerEmail,
      phone: c.phone,
      mobile: c.mobile,
      address: c.address,
      timezone: c.timezone,
      currency: c.currency,
      cached_credit_balance: c.cached_credit_balance || 0,
      waba_id: c.wabaId || c.wabaAccountId,
      phone_number_id: c.phoneNumberId,
      access_token: c.accessToken,
      app_id: c.appId,
      app_secret: c.appSecret,
      webhook_verify_token: c.webhookVerifyToken,
      graph_api_version: c.graphApiVersion || 'v22.0',
      display_phone_number: c.displayPhoneNumber,
      verified_name: c.verifiedName,
      quality_rating: c.qualityRating,
      webhook_connected: c.webhookConnected ?? false,
      webhook_connected_at: c.webhookConnectedAt,
      hard_secret_token: c.hardSecretToken,
      created_at: c.createdAt
    }));
    const { error } = await supabase.from('companies').upsert(companyRecords, { onConflict: 'id' });
    if (error) errors.companies = error.message;
    else syncedCounts.companies = companyRecords.length;
  } catch (e: any) {
    errors.companies = e.message;
  }

  // 2. Users
  try {
    const userRecords = payload.users.map(u => ({
      id: u.id,
      company_id: u.companyId,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      role: u.role,
      status: u.status || 'active',
      is_active: u.isActive ?? true,
      avatar: u.avatar,
      last_login_at: u.lastLoginAt,
      is_online: u.isOnline ?? false,
      active_chat_count: u.activeChatCount || 0,
      max_chat_capacity: u.maxChatCapacity || 5
    }));
    const { error } = await supabase.from('users').upsert(userRecords, { onConflict: 'id' });
    if (error) errors.users = error.message;
    else syncedCounts.users = userRecords.length;
  } catch (e: any) {
    errors.users = e.message;
  }

  // 3. Contacts
  try {
    const contactRecords = payload.contacts.map(c => ({
      id: c.id,
      company_id: c.companyId,
      phone: c.phone,
      name: c.name,
      email: c.email,
      country_code: c.country_code || '+91',
      consent_status: c.consentStatus,
      consent_source: c.consentSource,
      consent_timestamp: c.consentTimestamp,
      tags: c.tags || [],
      groups: c.groups || [],
      custom_attributes: c.customAttributes || {},
      created_at: c.createdAt,
      updated_at: c.updatedAt
    }));
    const { error } = await supabase.from('contacts').upsert(contactRecords, { onConflict: 'id' });
    if (error) errors.contacts = error.message;
    else syncedCounts.contacts = contactRecords.length;
  } catch (e: any) {
    errors.contacts = e.message;
  }

  // 4. Contact Groups
  try {
    const groupRecords = payload.groups.map(g => ({
      id: g.id,
      company_id: g.companyId,
      name: g.name,
      description: g.description,
      contact_count: g.contactCount || 0,
      is_dynamic: g.isDynamic ?? false,
      filter_criteria: g.filterCriteria,
      created_at: g.createdAt
    }));
    const { error } = await supabase.from('contact_groups').upsert(groupRecords, { onConflict: 'id' });
    if (error) errors.contact_groups = error.message;
    else syncedCounts.contact_groups = groupRecords.length;
  } catch (e: any) {
    errors.contact_groups = e.message;
  }

  // 5. Templates
  try {
    const templateRecords = payload.templates.map(t => ({
      id: t.id,
      company_id: t.companyId,
      meta_template_id: t.metaTemplateId || t.id,
      name: t.name,
      whatsapp_template_name: t.whatsapp_template_name || t.name,
      category: t.category,
      language: t.language,
      status: t.status,
      rejection_reason: t.rejectionReason,
      header_type: t.headerType,
      header_text: t.headerText,
      body_text: t.bodyText,
      variables_count: t.variablesCount || 0,
      sample_values: t.sampleValues || [],
      footer_text: t.footerText,
      buttons: t.buttons || [],
      last_synced_at: t.lastSyncedAt
    }));
    const { error } = await supabase.from('templates').upsert(templateRecords, { onConflict: 'id' });
    if (error) errors.templates = error.message;
    else syncedCounts.templates = templateRecords.length;
  } catch (e: any) {
    errors.templates = e.message;
  }

  // 6. Campaigns
  try {
    const campaignRecords = payload.campaigns.map(camp => ({
      id: camp.id,
      company_id: camp.companyId,
      name: camp.name,
      category: camp.category,
      template_id: camp.templateId,
      template_name: camp.templateName,
      status: camp.status,
      total_recipients: camp.totalRecipients || camp.recipient_count || 0,
      recipient_count: camp.recipient_count || camp.totalRecipients || 0,
      sent_count: camp.sentCount || 0,
      delivered_count: camp.deliveredCount || 0,
      read_count: camp.readCount || 0,
      failed_count: camp.failedCount || 0,
      skipped_count: camp.skippedCount || 0,
      credits_reserved: camp.creditsReserved || camp.reserved_credits || 0,
      reserved_credits: camp.reserved_credits || camp.creditsReserved || 0,
      credits_consumed: camp.creditsConsumed || camp.consumed_credits || 0,
      consumed_credits: camp.consumed_credits || camp.creditsConsumed || 0,
      credits_refunded: camp.creditsRefunded || camp.released_credits || 0,
      released_credits: camp.released_credits || camp.creditsRefunded || 0,
      batch_size: camp.batchSize || 50,
      concurrency: camp.concurrency || 4,
      send_rate_ms: camp.sendRateMs || 200,
      max_retry_attempts: camp.maxRetryAttempts || 3,
      variable_mapping: camp.variableMapping || {},
      recipients: camp.recipients || [],
      started_at: camp.startedAt,
      completed_at: camp.completedAt,
      created_at: camp.createdAt
    }));
    const { error } = await supabase.from('campaigns').upsert(campaignRecords, { onConflict: 'id' });
    if (error) errors.campaigns = error.message;
    else syncedCounts.campaigns = campaignRecords.length;
  } catch (e: any) {
    errors.campaigns = e.message;
  }

  // 7. Messages
  try {
    const allMessages = Object.values(payload.messages).flat();
    if (allMessages.length > 0) {
      const msgRecords = allMessages.map(m => ({
        id: m.id,
        conversation_id: m.conversationId,
        company_id: m.companyId,
        direction: m.direction,
        sender_type: m.senderType,
        sender_name: m.senderName,
        sender_id: m.senderId,
        content: m.content,
        media_url: m.mediaUrl,
        media_type: m.mediaType || 'none',
        template_id: m.templateId,
        delivery_status: m.deliveryStatus,
        error_code: m.errorCode,
        waba_message_id: m.wabaMessageId,
        whatsapp_message_id: m.whatsapp_message_id,
        timestamp: m.timestamp,
        is_internal_note: m.isInternalNote ?? false
      }));
      const { error } = await supabase.from('messages').upsert(msgRecords, { onConflict: 'id' });
      if (error) errors.messages = error.message;
      else syncedCounts.messages = msgRecords.length;
    } else {
      syncedCounts.messages = 0;
    }
  } catch (e: any) {
    errors.messages = e.message;
  }

  // 8. Conversations
  try {
    const convRecords = payload.conversations.map(conv => ({
      id: conv.id,
      company_id: conv.companyId,
      contact_id: conv.contactId,
      contact_phone: conv.contactPhone,
      contact_name: conv.contactName,
      assigned_agent_id: conv.assignedAgentId,
      assigned_agent_name: conv.assignedAgentName,
      status: conv.status,
      is_bot_handled: conv.isBotHandled ?? false,
      unread_count: conv.unreadCount || 0,
      last_message: conv.lastMessage,
      last_message_time: conv.lastMessageTime,
      tags: conv.tags || [],
      created_at: conv.createdAt
    }));
    const { error } = await supabase.from('conversations').upsert(convRecords, { onConflict: 'id' });
    if (error) errors.conversations = error.message;
    else syncedCounts.conversations = convRecords.length;
  } catch (e: any) {
    errors.conversations = e.message;
  }

  // 9. Bot Rules
  try {
    const botRecords = payload.botRules.map(b => ({
      id: b.id,
      company_id: b.companyId,
      name: b.name,
      priority: b.priority || 10,
      trigger_type: b.triggerType || 'CONTAINS',
      trigger_text: b.trigger_text || b.triggerText,
      response_text: b.response_text || b.responseText || b.replyText,
      keywords: b.keywords || [],
      case_sensitive: b.caseSensitive ?? false,
      action_type: b.actionType || 'SEND_TEXT',
      reply_text: b.replyText || b.response_text,
      hit_count: b.hitCount || 0,
      is_active: b.isActive ?? true,
      status: b.status || 'active'
    }));
    const { error } = await supabase.from('bot_rules').upsert(botRecords, { onConflict: 'id' });
    if (error) errors.bot_rules = error.message;
    else syncedCounts.bot_rules = botRecords.length;
  } catch (e: any) {
    errors.bot_rules = e.message;
  }

  // 10. Credit Wallets
  try {
    const walletRecords = Object.values(payload.wallets).map(w => ({
      company_id: w.companyId,
      marketing_total: w.marketingTotal,
      marketing_reserved: w.marketingReserved,
      marketing_consumed: w.marketingConsumed,
      utility_total: w.utilityTotal,
      utility_reserved: w.utilityReserved,
      utility_consumed: w.utilityConsumed,
      last_reconciled_at: w.lastReconciledAt,
      updated_at: new Date().toISOString()
    }));
    const { error } = await supabase.from('credit_wallets').upsert(walletRecords, { onConflict: 'company_id' });
    if (error) errors.credit_wallets = error.message;
    else syncedCounts.credit_wallets = walletRecords.length;
  } catch (e: any) {
    errors.credit_wallets = e.message;
  }

  // 11. Credit Ledger
  try {
    const ledgerRecords = payload.ledger.slice(0, 100).map(l => ({
      id: l.id,
      company_id: l.companyId,
      category: l.category,
      type: l.type,
      amount: l.amount,
      before_balance: l.beforeBalance || 0,
      after_balance: l.afterBalance || 0,
      reference_type: l.referenceType,
      reference_id: l.referenceId,
      reason: l.reason,
      idempotency_key: l.idempotencyKey,
      timestamp: l.timestamp,
      actor_id: l.actorId,
      actor_email: l.actorEmail
    }));
    const { error } = await supabase.from('credit_ledger').upsert(ledgerRecords, { onConflict: 'id' });
    if (error) errors.credit_ledger = error.message;
    else syncedCounts.credit_ledger = ledgerRecords.length;
  } catch (e: any) {
    errors.credit_ledger = e.message;
  }

  // 12. Tenant API Keys
  try {
    const keyRecords = payload.apiKeys.map(k => ({
      id: k.id,
      company_id: k.companyId,
      name: k.name,
      key_prefix: k.keyPrefix,
      token_hash: k.tokenHash,
      raw_key_once: k.rawKeyOnce,
      scopes: k.scopes || [],
      rate_limit_rpm: k.rateLimitRpm || 300,
      current_minute_usage: k.currentMinuteUsage || 0,
      status: k.status,
      is_hardened_secret: k.isHardenedSecret ?? true,
      description: k.description,
      expires_at: k.expiresAt,
      created_at: k.createdAt
    }));
    const { error } = await supabase.from('tenant_api_keys').upsert(keyRecords, { onConflict: 'id' });
    if (error) errors.tenant_api_keys = error.message;
    else syncedCounts.tenant_api_keys = keyRecords.length;
  } catch (e: any) {
    errors.tenant_api_keys = e.message;
  }

  // 13. Audit Logs
  try {
    const auditRecords = payload.auditLogs.slice(0, 50).map(a => ({
      id: a.id,
      company_id: a.companyId,
      company_name: a.companyName,
      actor_id: a.actorId,
      actor_email: a.actorEmail,
      actor_role: a.actorRole,
      category: a.category,
      action: a.action,
      details: a.details,
      ip_address: a.ipAddress,
      timestamp: a.timestamp
    }));
    const { error } = await supabase.from('audit_logs').upsert(auditRecords, { onConflict: 'id' });
    if (error) errors.audit_logs = error.message;
    else syncedCounts.audit_logs = auditRecords.length;
  } catch (e: any) {
    errors.audit_logs = e.message;
  }

  // 14. App Settings
  try {
    const settingsRecord = {
      id: 'global_config',
      enable_agents: payload.appSettings.enableAgents ?? true,
      show_only_assigned_chats: payload.appSettings.showOnlyAssignedChats ?? false,
      webhook_callback_url: payload.appSettings.webhookCallbackUrl,
      blacklisted_phone_numbers: payload.appSettings.blacklistedPhoneNumbers,
      project_name: payload.appSettings.projectName || 'OmniWABA',
      site_url: payload.appSettings.siteUrl || 'https://whatsappcloud-virid.vercel.app',
      meta_app_secret: payload.appSettings.metaAppSecret,
      meta_app_id: payload.appSettings.metaAppId,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('app_settings').upsert(settingsRecord, { onConflict: 'id' });
    if (error) errors.app_settings = error.message;
    else syncedCounts.app_settings = 1;
  } catch (e: any) {
    errors.app_settings = e.message;
  }

  const hasAnySuccess = Object.keys(syncedCounts).length > 0;
  return {
    success: hasAnySuccess,
    syncedCounts,
    errors
  };
}
