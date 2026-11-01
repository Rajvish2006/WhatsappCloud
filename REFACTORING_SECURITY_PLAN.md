# OmniWABA Security Hardening & Architectural Refactoring Guide

## Executive Summary
This document provides the end-to-end architectural specification, security remediation guide, and deployment plan for the **OmniWABA WhatsApp Cloud API Enterprise Platform** deployed with **Supabase**.

---

## 1. Architectural Changes Implemented

### A. Global Meta App ID & Secret Architecture
- **Server-Side Governance:** Meta App credentials (`META_APP_ID`, `META_APP_SECRET`) are now strictly provisioned via server environment variables.
- **Tenant Isolation:** Individual tenants/organizations no longer input, view, store, or own Meta App secrets or developer app IDs.
- **HMAC-SHA256 Signature Verification:** Incoming Meta webhook payloads (`X-Hub-Signature-256`) are verified exclusively in backend proxy routes (`server.ts` or `supabase/functions/meta-webhook/index.ts`) using timing-safe cryptographic comparisons.

### B. Removal of User-Level WhatsApp Cloud Hooks & Token Columns
- **Stripped Columns:** Dropped deprecated `app_secret`, `app_id`, and `hard_secret_token` from database schemas and frontend types.
- **Tenant API Keys Hardened:** Per-tenant programmatic API access is isolated to `tenant_api_keys` with SHA-256 token hashing (`tokenHash`), preventing raw secret token leakage after creation.
- **Zero Client-Side Token Caching:** The frontend client state only handles masked display configurations and proxies all Graph API calls through authenticated server endpoints.

### C. Standardized Authentication Flow
- **Clean Supabase Auth Flow:** Eliminated legacy Facebook SDK quick-login buttons, brittle `fbAsyncInit` hooks, and insecure token exchanges.
- **Role-Based Access Control:** Standardized email/password and session-based authentication supporting `super_admin`, `company_admin`, and `agent` roles with brute-force lockout throttling and recovery flows.

### D. Supabase Security Audit & Secret Isolation
- **Public Anon Key Enforcement:** Frontend initializes strictly via public `VITE_SUPABASE_ANON_KEY` (or `VITE_SUPABASE_PUBLISHABLE_KEY`).
- **Service Role Key Shielding:** `SUPABASE_SERVICE_ROLE_KEY` is completely isolated from frontend bundles. Added runtime detection in `src/lib/supabase.ts` that warns if an elevated administrative token is passed to browser clients.
- **Row Level Security (RLS):** All 14 database tables have RLS enabled with tenant isolation policies (`company_id = get_auth_company_id()`).

---

## 2. Directory Structure of Security Deliverables

```
├── scripts/
│   ├── security_audit.js           # Automated standalone scanner (Node.js)
│   └── security_audit.py           # Automated standalone scanner (Python 3)
├── supabase/
│   ├── migrations/
│   │   └── 20261101_security_hardening.sql  # Database migration & RLS policies
│   └── functions/
│       └── meta-webhook/
│           └── index.ts            # Secure Supabase Edge Function template
├── src/
│   ├── lib/
│   │   ├── supabase.ts             # Hardened client with service_role detection
│   │   └── supabaseService.ts      # Cleaned schema definitions without app_secret
│   └── types/
│       └── index.ts                # Cleaned TypeScript interfaces (no per-tenant secrets)
├── server.ts                       # Secure Express proxy with HMAC validation
└── .env.example                    # Cleaned environment variables specification
```

---

## 3. Step-by-Step Refactoring & Deployment Checklist

### Step 1: Run the Database Migration in Supabase
1. Navigate to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project -> **SQL Editor** -> **New query**.
3. Paste the contents of `/supabase/migrations/20261101_security_hardening.sql`.
4. Click **Run**.
5. Run the verification query to confirm RLS is active on all 14 tables:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
     AND tablename IN (
       'companies', 'users', 'contacts', 'contact_groups',
       'templates', 'campaigns', 'messages', 'conversations',
       'bot_rules', 'credit_wallets', 'credit_ledger',
       'tenant_api_keys', 'audit_logs', 'app_settings'
     );
   ```
   *Expected Output: All 14 rows should show `rowsecurity = true`.*

### Step 2: Configure Environment Variables
In your Supabase Edge Functions or production server settings (e.g., Cloud Run, Vercel, VPS), configure:

| Variable Name | Environment | Description |
| :--- | :--- | :--- |
| `META_APP_ID` | **Server / Edge** | Global Meta Developer App ID |
| `META_APP_SECRET` | **Server / Edge** | Global Meta Developer App Secret (HMAC verification) |
| `WHATSAPP_ACCESS_TOKEN` | **Server / Edge** | Permanent System User Token from Meta Business Suite |
| `WHATSAPP_PHONE_NUMBER_ID`| **Server / Edge** | Primary WhatsApp Phone Number ID |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | **Server / Edge** | Primary WABA Account ID |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | **Server / Edge** | Random verify token for Meta handshake |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server / Edge** | High-privilege key (bypasses RLS for webhooks) |
| `VITE_SUPABASE_URL` | **Client & Server** | Supabase Project URL (`https://<id>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | **Client-side** | Public Anonymous Key (strictly safe for browser) |

### Step 3: Configure Meta Developer Portal Webhook
1. Go to [developers.facebook.com](https://developers.facebook.com) -> Your App -> **WhatsApp** -> **Configuration**.
2. **Callback URL:**
   - Server route: `https://<your-domain>/api/webhooks/whatsapp`
   - Or Supabase Edge Function: `https://<project-ref>.functions.supabase.co/meta-webhook`
3. **Verify Token:** Enter the value defined in `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
4. Click **Verify and Save**. Meta will execute the GET handshake with `hub.challenge`.
5. Under **Webhook Fields**, subscribe to:
   - `messages` (inbound chats & media)
   - `message_template_status_update` (template approvals & rejections)

### Step 4: Run the Automated Security Scanner
To ensure ongoing compliance and prevent secret regressions, run the audit scanner:

```bash
# Node.js
node scripts/security_audit.js

# Or Python 3
python3 scripts/security_audit.py
```

Expected result:
```
AUDIT PASSED: ZERO VULNERABILITIES DETECTED
[PASS] No hardcoded Meta app secrets or permanent access tokens.
[PASS] Supabase client strictly restricted to public anon key.
[PASS] Zero user-level WhatsApp cloud hook leaks or token storage columns.
[PASS] Global Meta credentials architecture verified (process.env.META_APP_SECRET).
[PASS] Row Level Security (RLS) enforcement verified in SQL migrations.
```
