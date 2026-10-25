/**
 * Complete Enterprise SQL Database Schema Definitions, Constraints, Indexes & Migrations
 * Multi-Tenant WhatsApp Business Cloud API CRM
 */

export interface SchemaTable {
  name: string;
  category: 'core' | 'credits' | 'whatsapp' | 'campaigns' | 'chat' | 'audit';
  description: string;
  columns: Array<{
    name: string;
    type: string;
    constraints?: string;
    description: string;
  }>;
  indexes: string[];
  foreignKeys: string[];
  uniqueConstraints: string[];
}

export const COMPLETE_SQL_DDL = `-- ============================================================================
-- OMNIWABA ENTERPRISE MULTI-TENANT WHATSAPP CLOUD API SCHEMA
-- Engine: PostgreSQL 15+ / Compatible Relational SQL
-- Includes: Strict Tenant Isolation, Marketing & Utility Double-Entry Ledgers,
-- Foreign Keys, Partial & Unique Indexes, Audit Triggers, and Constraints.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. CORE TENANCY & ACCESS CONTROL
-- ----------------------------------------------------------------------------

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
    plan_id UUID NOT NULL,
    owner_name VARCHAR(128) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    suspension_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_code ON companies(code);

CREATE TABLE roles (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    description TEXT
);

CREATE TABLE permissions (
    id VARCHAR(64) PRIMARY KEY,
    module VARCHAR(32) NOT NULL,
    description TEXT
);

CREATE TABLE role_permissions (
    role_id VARCHAR(32) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(64) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    role VARCHAR(32) NOT NULL REFERENCES roles(id),
    name VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    avatar_url TEXT,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    max_chat_capacity INT NOT NULL DEFAULT 5,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_company_user_email UNIQUE(company_id, email)
);

CREATE INDEX idx_users_company_role ON users(company_id, role);
CREATE INDEX idx_users_email ON users(email);

-- ----------------------------------------------------------------------------
-- 2. PLANS & ATOMIC SEPARATE CREDIT ACCOUNTING
-- ----------------------------------------------------------------------------

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL UNIQUE,
    monthly_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    marketing_credits_quota BIGINT NOT NULL DEFAULT 0,
    utility_credits_quota BIGINT NOT NULL DEFAULT 0,
    agent_seat_limit INT NOT NULL DEFAULT 3,
    rate_limit_rpm INT NOT NULL DEFAULT 120,
    over_limit_action VARCHAR(32) NOT NULL DEFAULT 'BLOCK' CHECK (over_limit_action IN ('BLOCK', 'GRACE_OVERAGE', 'ALERT_ONLY')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE credit_wallets (
    company_id UUID PRIMARY KEY REFERENCES companies(id) ON DELETE RESTRICT,
    marketing_total BIGINT NOT NULL DEFAULT 0 CHECK (marketing_total >= 0),
    marketing_reserved BIGINT NOT NULL DEFAULT 0 CHECK (marketing_reserved >= 0),
    marketing_consumed BIGINT NOT NULL DEFAULT 0 CHECK (marketing_consumed >= 0),
    utility_total BIGINT NOT NULL DEFAULT 0 CHECK (utility_total >= 0),
    utility_reserved BIGINT NOT NULL DEFAULT 0 CHECK (utility_reserved >= 0),
    utility_consumed BIGINT NOT NULL DEFAULT 0 CHECK (utility_consumed >= 0),
    last_reconciled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 1,
    CONSTRAINT chk_marketing_balance CHECK (marketing_total >= (marketing_reserved + marketing_consumed)),
    CONSTRAINT chk_utility_balance CHECK (utility_total >= (utility_reserved + utility_consumed))
);

CREATE TABLE credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    category VARCHAR(16) NOT NULL CHECK (category IN ('MARKETING', 'UTILITY')),
    type VARCHAR(24) NOT NULL CHECK (type IN ('ALLOCATION', 'RESERVATION', 'COMMIT', 'REFUND', 'ADJUSTMENT')),
    amount BIGINT NOT NULL,
    before_balance BIGINT NOT NULL,
    after_balance BIGINT NOT NULL,
    reference_type VARCHAR(32) NOT NULL CHECK (reference_type IN ('CAMPAIGN', 'API_SEND', 'ADMIN_TOPUP', 'SUBSCRIPTION_RENEWAL', 'FAILURE_REFUND')),
    reference_id VARCHAR(64) NOT NULL,
    reason TEXT NOT NULL,
    idempotency_key VARCHAR(128) NOT NULL,
    actor_id UUID REFERENCES users(id),
    actor_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ledger_idempotency UNIQUE(company_id, idempotency_key)
);

CREATE INDEX idx_credit_ledger_company_cat ON credit_ledger(company_id, category, created_at DESC);
CREATE INDEX idx_credit_ledger_ref ON credit_ledger(reference_type, reference_id);

-- ----------------------------------------------------------------------------
-- 3. SECURE TENANT API CREDENTIALS & RATE LIMITING
-- ----------------------------------------------------------------------------

CREATE TABLE tenant_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    key_prefix VARCHAR(16) NOT NULL,
    token_hash VARCHAR(64) NOT NULL, -- SHA-256 representation of bearer token
    scopes TEXT[] NOT NULL DEFAULT '{"messages:send"}',
    rate_limit_rpm INT NOT NULL DEFAULT 120,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_api_token_hash UNIQUE(token_hash)
);

CREATE INDEX idx_tenant_api_company ON tenant_api_keys(company_id, status);

-- ----------------------------------------------------------------------------
-- 4. REAL WHATSAPP CLOUD API & TEMPLATES
-- ----------------------------------------------------------------------------

CREATE TABLE waba_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE RESTRICT,
    waba_id VARCHAR(64) NOT NULL,
    phone_number_id VARCHAR(64) NOT NULL,
    display_phone_number VARCHAR(32) NOT NULL,
    verified_name VARCHAR(128) NOT NULL,
    quality_rating VARCHAR(16) NOT NULL DEFAULT 'GREEN' CHECK (quality_rating IN ('GREEN', 'YELLOW', 'RED')),
    meta_tier VARCHAR(32) NOT NULL DEFAULT 'TIER_1K',
    access_token_encrypted TEXT NOT NULL,
    webhook_verify_token VARCHAR(128) NOT NULL,
    app_secret_encrypted TEXT NOT NULL,
    is_connected BOOLEAN NOT NULL DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE meta_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    meta_template_id VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(16) NOT NULL CHECK (category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
    language VARCHAR(16) NOT NULL DEFAULT 'en_US',
    status VARCHAR(16) NOT NULL DEFAULT 'APPROVED' CHECK (status IN ('APPROVED', 'REJECTED', 'PENDING', 'PAUSED')),
    rejection_reason TEXT,
    header_type VARCHAR(16) NOT NULL DEFAULT 'NONE',
    header_text TEXT,
    body_text TEXT NOT NULL,
    variables_count INT NOT NULL DEFAULT 0,
    sample_values JSONB DEFAULT '[]',
    footer_text TEXT,
    buttons JSONB DEFAULT '[]',
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_company_template UNIQUE(company_id, name, language)
);

CREATE INDEX idx_meta_templates_company_cat ON meta_templates(company_id, category, status);

-- ----------------------------------------------------------------------------
-- 5. AUDIENCE, CONTACTS & CONSENT TRACKING
-- ----------------------------------------------------------------------------

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    phone VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(255),
    consent_status VARCHAR(16) NOT NULL DEFAULT 'OPTED_IN' CHECK (consent_status IN ('OPTED_IN', 'OPTED_OUT', 'PENDING')),
    consent_source VARCHAR(32) NOT NULL DEFAULT 'MANUAL',
    consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tags TEXT[] NOT NULL DEFAULT '{}',
    custom_attributes JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_company_contact_phone UNIQUE(company_id, phone)
);

CREATE INDEX idx_contacts_company_phone ON contacts(company_id, phone);
CREATE INDEX idx_contacts_consent ON contacts(company_id, consent_status);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);

CREATE TABLE contact_consent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    previous_status VARCHAR(16),
    new_status VARCHAR(16) NOT NULL,
    source VARCHAR(64) NOT NULL,
    ip_or_user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE contact_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    is_dynamic BOOLEAN NOT NULL DEFAULT FALSE,
    filter_criteria JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_company_group_name UNIQUE(company_id, name)
);

CREATE TABLE contact_group_members (
    group_id UUID NOT NULL REFERENCES contact_groups(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, contact_id)
);

-- ----------------------------------------------------------------------------
-- 6. CAMPAIGN MANAGEMENT, BATCH WORKERS & IDEMPOTENCY
-- ----------------------------------------------------------------------------

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(16) NOT NULL CHECK (category IN ('MARKETING', 'UTILITY')),
    template_id UUID NOT NULL REFERENCES meta_templates(id),
    status VARCHAR(24) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'scheduled', 'queued', 'processing', 'paused', 'completed', 'partially_failed', 'cancelled', 'failed'
    )),
    total_recipients INT NOT NULL DEFAULT 0,
    sent_count INT NOT NULL DEFAULT 0,
    delivered_count INT NOT NULL DEFAULT 0,
    read_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    skipped_count INT NOT NULL DEFAULT 0,
    credits_reserved BIGINT NOT NULL DEFAULT 0,
    credits_consumed BIGINT NOT NULL DEFAULT 0,
    credits_refunded BIGINT NOT NULL DEFAULT 0,
    batch_size INT NOT NULL DEFAULT 50,
    concurrency INT NOT NULL DEFAULT 3,
    send_rate_ms INT NOT NULL DEFAULT 200,
    max_retry_attempts INT NOT NULL DEFAULT 3,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    variable_mapping JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_company_status ON campaigns(company_id, status);

CREATE TABLE campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id),
    phone VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL,
    variables JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(16) NOT NULL DEFAULT 'queued' CHECK (status IN (
        'queued', 'sent', 'delivered', 'read', 'failed', 'skipped'
    )),
    skip_reason VARCHAR(64),
    error_code VARCHAR(32),
    error_message TEXT,
    waba_message_id VARCHAR(128),
    idempotency_key VARCHAR(128) NOT NULL,
    retry_count INT NOT NULL DEFAULT 0,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_recipient_idempotency UNIQUE(campaign_id, idempotency_key)
);

CREATE INDEX idx_recipients_campaign_status ON campaign_recipients(campaign_id, status);
CREATE INDEX idx_recipients_waba_msg ON campaign_recipients(waba_message_id);

-- ----------------------------------------------------------------------------
-- 7. LIVE CHAT, CONCURRENT AGENTS & BOT AUTOMATION
-- ----------------------------------------------------------------------------

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    assigned_agent_id UUID REFERENCES users(id),
    status VARCHAR(16) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PENDING', 'RESOLVED')),
    is_bot_handled BOOLEAN NOT NULL DEFAULT TRUE,
    unread_count INT NOT NULL DEFAULT 0,
    last_message TEXT,
    last_message_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_company_contact_conversation UNIQUE(company_id, contact_id)
);

CREATE INDEX idx_conversations_company_agent ON conversations(company_id, assigned_agent_id, status);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    direction VARCHAR(16) NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    sender_type VARCHAR(16) NOT NULL CHECK (sender_type IN ('CUSTOMER', 'AGENT', 'BOT', 'SYSTEM')),
    sender_name VARCHAR(128) NOT NULL,
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(16) DEFAULT 'none',
    template_id UUID REFERENCES meta_templates(id),
    delivery_status VARCHAR(16) NOT NULL DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'delivered', 'read', 'failed')),
    error_code VARCHAR(32),
    waba_message_id VARCHAR(128),
    is_internal_note BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX idx_messages_waba_id ON messages(waba_message_id);

CREATE TABLE internal_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bot_automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    priority INT NOT NULL DEFAULT 100,
    name VARCHAR(128) NOT NULL,
    trigger_type VARCHAR(16) NOT NULL CHECK (trigger_type IN ('EXACT', 'CONTAINS', 'STARTS_WITH', 'REGEX')),
    keywords TEXT[] NOT NULL DEFAULT '{}',
    case_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
    action_type VARCHAR(32) NOT NULL CHECK (action_type IN ('SEND_TEXT', 'SEND_TEMPLATE', 'HANDOFF_AGENT', 'TAG_CONTACT')),
    reply_text TEXT,
    template_id UUID REFERENCES meta_templates(id),
    tag_to_add VARCHAR(64),
    assign_to_agent_id UUID REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    hit_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bot_rules_company_priority ON bot_automation_rules(company_id, priority ASC);

-- ----------------------------------------------------------------------------
-- 8. SYSTEM AUDIT LOGS & BACKGROUND JOBS
-- ----------------------------------------------------------------------------

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    company_name VARCHAR(255) NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_email VARCHAR(255) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    category VARCHAR(32) NOT NULL CHECK (category IN (
        'AUTH', 'CREDIT', 'CAMPAIGN', 'API_CREDENTIAL', 'IMPERSONATION', 'COMPANY_LIFECYCLE', 'WHATSAPP'
    )),
    action VARCHAR(128) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_company_time ON audit_logs(company_id, created_at DESC);
CREATE INDEX idx_audit_logs_category ON audit_logs(category, created_at DESC);

CREATE TABLE background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRYING')),
    progress INT NOT NULL DEFAULT 0,
    payload_description TEXT NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_jobs_status_retry ON background_jobs(status, next_retry_at);
`;

export const SCHEMA_MIGRATIONS = [
  {
    version: '202610250001',
    name: '001_initial_multitenant_foundation.sql',
    description: 'Creates companies, users, roles, permissions, and session throttling structures.',
    appliedAt: '2026-10-25 00:00:00 UTC',
    status: 'APPLIED',
  },
  {
    version: '202610250002',
    name: '002_separate_marketing_utility_credit_ledger.sql',
    description: 'Implements double-entry ledger with atomic reservation, consumption, failure refund, and balance check constraints.',
    appliedAt: '2026-10-25 00:01:00 UTC',
    status: 'APPLIED',
  },
  {
    version: '202610250003',
    name: '003_waba_templates_and_campaign_idempotency.sql',
    description: 'Adds Meta WABA accounts, sync templates, campaign batch workers, recipient idempotency keys, and live chat indices.',
    appliedAt: '2026-10-25 00:02:00 UTC',
    status: 'APPLIED',
  },
  {
    version: '202610250004',
    name: '004_bot_rules_and_audit_log_partitions.sql',
    description: 'Adds priority-based bot automation rules, agent workload counters, and company-level audit log indexing.',
    appliedAt: '2026-10-25 00:03:00 UTC',
    status: 'APPLIED',
  }
];

export const SCHEMA_TABLES: SchemaTable[] = [
  {
    name: 'companies',
    category: 'core',
    description: 'Multi-tenant organization boundary. Every business has strict data isolation.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'Unique tenant UUID' },
      { name: 'code', type: 'VARCHAR(32)', constraints: 'UNIQUE NOT NULL', description: 'Human-readable slug, e.g. "acme_retail"' },
      { name: 'name', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Legal company business name' },
      { name: 'status', type: 'VARCHAR(32)', constraints: 'CHECK IN (ACTIVE, SUSPENDED, ARCHIVED)', description: 'Lifecycle state' },
      { name: 'plan_id', type: 'UUID', constraints: 'NOT NULL', description: 'Active subscription tier' },
      { name: 'owner_email', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Primary company owner' },
      { name: 'timezone', type: 'VARCHAR(64)', constraints: 'DEFAULT UTC', description: 'Tenant reporting timezone' }
    ],
    indexes: ['idx_companies_status', 'idx_companies_code'],
    foreignKeys: ['plan_id -> subscription_plans(id)'],
    uniqueConstraints: ['code']
  },
  {
    name: 'credit_wallets',
    category: 'credits',
    description: 'Live balances with strict check constraints: separate Marketing and Utility balances, reservations, and consumption.',
    columns: [
      { name: 'company_id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'Company reference' },
      { name: 'marketing_total', type: 'BIGINT', constraints: 'CHECK >= 0', description: 'Total allocated marketing credits' },
      { name: 'marketing_reserved', type: 'BIGINT', constraints: 'CHECK >= 0', description: 'Credits currently held by queued/active campaigns' },
      { name: 'marketing_consumed', type: 'BIGINT', constraints: 'CHECK >= 0', description: 'Total confirmed dispatched messages' },
      { name: 'utility_total', type: 'BIGINT', constraints: 'CHECK >= 0', description: 'Total allocated utility credits' },
      { name: 'utility_reserved', type: 'BIGINT', constraints: 'CHECK >= 0', description: 'Credits reserved by utility triggers' },
      { name: 'utility_consumed', type: 'BIGINT', constraints: 'CHECK >= 0', description: 'Total confirmed utility messages' },
      { name: 'last_reconciled_at', type: 'TIMESTAMPTZ', constraints: 'NOT NULL', description: 'Timestamp of last audit ledger reconciliation' }
    ],
    indexes: ['PRIMARY KEY (company_id)'],
    foreignKeys: ['company_id -> companies(id) ON DELETE RESTRICT'],
    uniqueConstraints: ['company_id']
  },
  {
    name: 'credit_ledger',
    category: 'credits',
    description: 'Immutable double-entry transaction record. Every balance change has a corresponding audit record.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'Ledger entry UUID' },
      { name: 'company_id', type: 'UUID', constraints: 'NOT NULL', description: 'Tenant ID' },
      { name: 'category', type: 'VARCHAR(16)', constraints: 'MARKETING | UTILITY', description: 'Credit bucket' },
      { name: 'type', type: 'VARCHAR(24)', constraints: 'ALLOCATION | RESERVATION | COMMIT | REFUND', description: 'Movement type' },
      { name: 'amount', type: 'BIGINT', constraints: 'NOT NULL', description: 'Signed amount change' },
      { name: 'before_balance', type: 'BIGINT', constraints: 'NOT NULL', description: 'Balance prior to transaction' },
      { name: 'after_balance', type: 'BIGINT', constraints: 'NOT NULL', description: 'Balance after transaction' },
      { name: 'reference_type', type: 'VARCHAR(32)', constraints: 'CAMPAIGN | API_SEND | ADMIN_TOPUP | FAILURE_REFUND', description: 'Origin' },
      { name: 'reference_id', type: 'VARCHAR(64)', constraints: 'NOT NULL', description: 'Campaign ID or Dispatch ID' },
      { name: 'idempotency_key', type: 'VARCHAR(128)', constraints: 'UNIQUE per company', description: 'Prevents double ledger posting' }
    ],
    indexes: ['idx_credit_ledger_company_cat', 'idx_credit_ledger_ref', 'uq_ledger_idempotency'],
    foreignKeys: ['company_id -> companies(id)', 'actor_id -> users(id)'],
    uniqueConstraints: ['(company_id, idempotency_key)']
  },
  {
    name: 'campaigns',
    category: 'campaigns',
    description: 'Campaign entity with state machine, variable mappings, batching policies, and credit reservation.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'Campaign UUID' },
      { name: 'company_id', type: 'UUID', constraints: 'NOT NULL', description: 'Tenant reference' },
      { name: 'category', type: 'VARCHAR(16)', constraints: 'MARKETING | UTILITY', description: 'Determines deduction bucket' },
      { name: 'status', type: 'VARCHAR(24)', constraints: 'draft, scheduled, queued, processing, paused, completed, etc.', description: 'Lifecycle status' },
      { name: 'total_recipients', type: 'INT', constraints: 'DEFAULT 0', description: 'Validated recipient count' },
      { name: 'credits_reserved', type: 'BIGINT', constraints: 'DEFAULT 0', description: 'Atomic reserved credits' },
      { name: 'credits_consumed', type: 'BIGINT', constraints: 'DEFAULT 0', description: 'Confirmed sent credits' },
      { name: 'credits_refunded', type: 'BIGINT', constraints: 'DEFAULT 0', description: 'Credits returned on failed sends' },
      { name: 'batch_size', type: 'INT', constraints: 'DEFAULT 50', description: 'Chunk size for worker queues' },
      { name: 'concurrency', type: 'INT', constraints: 'DEFAULT 3', description: 'Simultaneous worker processes' }
    ],
    indexes: ['idx_campaigns_company_status'],
    foreignKeys: ['company_id -> companies(id)', 'template_id -> meta_templates(id)'],
    uniqueConstraints: ['id']
  },
  {
    name: 'campaign_recipients',
    category: 'campaigns',
    description: 'Individual recipient tracking with idempotency key, delivery status, and retry exponential backoff.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'Recipient row UUID' },
      { name: 'campaign_id', type: 'UUID', constraints: 'NOT NULL', description: 'Parent campaign' },
      { name: 'phone', type: 'VARCHAR(32)', constraints: 'NOT NULL', description: 'E.164 phone number' },
      { name: 'status', type: 'VARCHAR(16)', constraints: 'queued, sent, delivered, read, failed, skipped', description: 'Recipient lifecycle state' },
      { name: 'idempotency_key', type: 'VARCHAR(128)', constraints: 'UNIQUE per campaign', description: 'Guarantees zero duplicate sends on retry' },
      { name: 'retry_count', type: 'INT', constraints: 'DEFAULT 0', description: 'Retry attempts counter' },
      { name: 'waba_message_id', type: 'VARCHAR(128)', constraints: 'INDEXED', description: 'Meta WAMID for webhook correlation' }
    ],
    indexes: ['idx_recipients_campaign_status', 'idx_recipients_waba_msg', 'uq_recipient_idempotency'],
    foreignKeys: ['campaign_id -> campaigns(id) ON DELETE CASCADE'],
    uniqueConstraints: ['(campaign_id, idempotency_key)']
  },
  {
    name: 'tenant_api_keys',
    category: 'whatsapp',
    description: 'Secure API tokens for company system-to-system access with SHA-256 hash storage, rotation, and rate limits.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'Key record UUID' },
      { name: 'company_id', type: 'UUID', constraints: 'NOT NULL', description: 'Tenant reference' },
      { name: 'token_hash', type: 'VARCHAR(64)', constraints: 'UNIQUE NOT NULL', description: 'SHA-256 hash of API secret' },
      { name: 'key_prefix', type: 'VARCHAR(16)', constraints: 'NOT NULL', description: 'Visible identifier, e.g. waba_live_8f3a' },
      { name: 'scopes', type: 'TEXT[]', constraints: 'NOT NULL', description: 'Allowed permission scopes' },
      { name: 'rate_limit_rpm', type: 'INT', constraints: 'DEFAULT 120', description: 'Requests per minute quota' },
      { name: 'status', type: 'VARCHAR(16)', constraints: 'ACTIVE | REVOKED | EXPIRED', description: 'Key lifecycle status' }
    ],
    indexes: ['idx_tenant_api_company', 'uq_api_token_hash'],
    foreignKeys: ['company_id -> companies(id) ON DELETE CASCADE'],
    uniqueConstraints: ['token_hash']
  }
];
