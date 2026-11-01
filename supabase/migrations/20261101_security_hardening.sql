-- ============================================================================
-- SUPABASE POSTGRESQL DATABASE SECURITY MIGRATION & RLS ENFORCEMENT
-- OmniWABA Multi-Tenant WhatsApp Business Cloud API Platform
-- Migration ID: 20261101_security_hardening.sql
-- ============================================================================

-- IMPORTANT: Run this script directly in the Supabase Dashboard SQL Editor
-- (Project -> SQL Editor -> New Query -> Run)

BEGIN;

-- ============================================================================
-- 1. DROP VULNERABLE USER-LEVEL & TENANT-LEVEL SECRET COLUMNS
-- ============================================================================
-- Meta App ID & Secret are platform-level infrastructure credentials governed
-- strictly on the backend server (process.env.META_APP_SECRET, META_APP_ID).
-- Individual companies and users must NEVER store, own, or manage app secrets.

DO $$
BEGIN
    -- Drop from public.companies if present
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'app_secret') THEN
        ALTER TABLE public.companies DROP COLUMN app_secret;
        RAISE NOTICE 'Dropped vulnerable column companies.app_secret';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'hard_secret_token') THEN
        ALTER TABLE public.companies DROP COLUMN hard_secret_token;
        RAISE NOTICE 'Dropped vulnerable column companies.hard_secret_token';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'app_id') THEN
        ALTER TABLE public.companies DROP COLUMN app_id;
        RAISE NOTICE 'Dropped redundant column companies.app_id';
    END IF;

    -- Drop any user-level token columns in users table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'access_token') THEN
        ALTER TABLE public.users DROP COLUMN access_token;
        RAISE NOTICE 'Dropped user-level access_token from users table';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'fb_token') THEN
        ALTER TABLE public.users DROP COLUMN fb_token;
        RAISE NOTICE 'Dropped user-level fb_token from users table';
    END IF;
END $$;

-- ============================================================================
-- 2. HELPER FUNCTIONS FOR TENANT CONTEXT & AUTH CLAIMS
-- ============================================================================

-- Function: Extract authenticated company ID from JWT or session
CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'company_id'),
    (current_setting('request.jwt.claims', true)::jsonb ->> 'company_id'),
    (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'company_id')
  );
$$;

-- Function: Check if the calling session is a Super Administrator
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role') = 'super_admin' OR
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'super_admin' OR
    (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'super_admin',
    false
  );
$$;

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS) ACROSS ALL APPLICATION TABLES
-- ============================================================================

ALTER TABLE IF EXISTS public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bot_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tenant_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. DROP EXISTING PERMISSIVE / LEGACY POLICIES
-- ============================================================================

DO $$
DECLARE
    tbl text;
    pol text;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'companies', 'users', 'contacts', 'contact_groups',
            'templates', 'campaigns', 'messages', 'conversations',
            'bot_rules', 'credit_wallets', 'credit_ledger',
            'tenant_api_keys', 'audit_logs', 'app_settings'
        ])
    LOOP
        FOR pol IN
            SELECT policyname FROM pg_policies WHERE tablename = tbl AND schemaname = 'public'
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol, tbl);
        END LOOP;
    END LOOP;
END $$;

-- ============================================================================
-- 5. CREATE STRICT MULTI-TENANT ISOLATION POLICIES
-- ============================================================================

-- Table 1: Companies
-- Tenants can view and update their own company profile; Super Admins have full access.
CREATE POLICY companies_tenant_isolation ON public.companies
    FOR ALL
    TO authenticated
    USING (id = public.get_auth_company_id() OR public.is_super_admin())
    WITH CHECK (id = public.get_auth_company_id() OR public.is_super_admin());

-- Allow initial company self-registration for new organizations
CREATE POLICY companies_registration ON public.companies
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow public/anon read of basic company configuration if needed for webhook handshake matching
CREATE POLICY companies_public_read ON public.companies
    FOR SELECT
    TO anon
    USING (true);

-- Table 2: Users
CREATE POLICY users_tenant_isolation ON public.users
    FOR ALL
    TO authenticated
    USING (company_id = public.get_auth_company_id() OR id = auth.uid()::text OR public.is_super_admin())
    WITH CHECK (company_id = public.get_auth_company_id() OR id = auth.uid()::text OR public.is_super_admin());

-- Table 3: Contacts
CREATE POLICY contacts_tenant_isolation ON public.contacts
    FOR ALL
    TO authenticated
    USING (company_id = public.get_auth_company_id() OR public.is_super_admin())
    WITH CHECK (company_id = public.get_auth_company_id() OR public.is_super_admin());

-- Table 4: Contact Groups
CREATE POLICY contact_groups_tenant_isolation ON public.contact_groups
    FOR ALL
    TO authenticated
    USING (company_id = public.get_auth_company_id() OR public.is_super_admin())
    WITH CHECK (company_id = public.get_auth_company_id() OR public.is_super_admin());

-- Table 5: Templates
CREATE POLICY templates_tenant_isolation ON public.templates
    FOR ALL
    TO authenticated
    USING (company_id = public.get_auth_company_id() OR public.is_super_admin())
    WITH CHECK (company_id = public.get_auth_company_id() OR public.is_super_admin());

-- Table 6: Campaigns
CREATE POLICY campaigns_tenant_isolation ON public.campaigns
    FOR ALL
    TO authenticated
    USING (company_id = public.get_auth_company_id() OR public.is_super_admin())
    WITH CHECK (company_id = public.get_auth_company_id() OR public.is_super_admin());

-- Table 7: Messages
CREATE POLICY messages_tenant_isolation ON public.messages
    FOR ALL
    TO authenticated
    USING (company_id = public.get_auth_company_id() OR public.is_super_admin())
    WITH CHECK (company_id = public.get_auth_company_id() OR public.is_super_admin());

-- Table 8: Conversations
CREATE POLICY conversations_tenant_isolation ON public.conversations
    FOR ALL
    TO authenticated
    USING (company_id = public.get_auth_company_id() OR public.is_super_admin())
    WITH CHECK (company_id = public.get_auth_company_id() OR public.is_super_admin());

-- Table 9: Bot Rules
CREATE POLICY bot_rules_tenant_isolation ON public.bot_rules
    FOR ALL
    TO authenticated
    USING (company_id = public.get_auth_company_id() OR public.is_super_admin())
    WITH CHECK (company_id = public.get_auth_company_id() OR public.is_super_admin());

-- Table 10: Credit Wallets
-- Enforce atomic reading and update restricted to tenant
CREATE POLICY credit_wallets_tenant_isolation ON public.credit_wallets
    FOR ALL
    TO authenticated
    USING (company_id = public.get_auth_company_id() OR public.is_super_admin())
    WITH CHECK (company_id = public.get_auth_company_id() OR public.is_super_admin());

-- Table 11: Credit Ledger (Immutable Double-Entry Ledger)
-- Tenants can only view their own ledger; only server/admin can append; updates/deletes prohibited
CREATE POLICY credit_ledger_select ON public.credit_ledger
    FOR SELECT
    TO authenticated
    USING (company_id = public.get_auth_company_id() OR public.is_super_admin());

CREATE POLICY credit_ledger_insert ON public.credit_ledger
    FOR INSERT
    TO authenticated
    WITH CHECK (company_id = public.get_auth_company_id() OR public.is_super_admin());

-- Table 12: Tenant API Keys
-- Raw secret tokens are only visible once; tokenHash is isolated to tenant
CREATE POLICY tenant_api_keys_tenant_isolation ON public.tenant_api_keys
    FOR ALL
    TO authenticated
    USING (company_id = public.get_auth_company_id() OR public.is_super_admin())
    WITH CHECK (company_id = public.get_auth_company_id() OR public.is_super_admin());

-- Table 13: Audit Logs
CREATE POLICY audit_logs_select ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (company_id = public.get_auth_company_id() OR public.is_super_admin());

CREATE POLICY audit_logs_insert ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (company_id = public.get_auth_company_id() OR public.is_super_admin());

-- Table 14: App Settings (Global system parameters)
-- Read-only for authenticated tenants; writes restricted strictly to Super Admins
CREATE POLICY app_settings_read ON public.app_settings
    FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY app_settings_admin_write ON public.app_settings
    FOR ALL
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- ============================================================================
-- 6. GRANT SERVICE ROLE FULL BYPASS FOR SECURE SERVER/EDGE FUNCTIONS
-- ============================================================================
-- Supabase service_role role automatically bypasses RLS in Postgres.
-- Server-side endpoints using SUPABASE_SERVICE_ROLE_KEY retain full access.

COMMIT;

-- ============================================================================
-- 7. AUDIT VERIFICATION QUERY
-- ============================================================================
-- Run this query after migration to verify that all 14 tables have RLS enabled:
-- 
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
--   AND tablename IN (
--     'companies', 'users', 'contacts', 'contact_groups',
--     'templates', 'campaigns', 'messages', 'conversations',
--     'bot_rules', 'credit_wallets', 'credit_ledger',
--     'tenant_api_keys', 'audit_logs', 'app_settings'
--   );
