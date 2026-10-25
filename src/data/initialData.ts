import {
  Company,
  User,
  SubscriptionPlan,
  CreditWallet,
  CreditLedgerEntry,
  TenantApiKey,
  WABAConfig,
  MetaTemplate,
  Contact,
  ContactGroup,
  Campaign,
  ChatConversation,
  ChatMessage,
  InternalNote,
  BotAutomationRule,
  AuditLog,
  BackgroundJob,
  PermissionMatrix,
  AppSettings
} from '../types';

export const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_basic',
    name: 'Basic',
    slug: 'basic',
    price: 1500,
    monthlyPrice: 1500,
    billing_period: 'yearly',
    marketingCreditsQuota: 5000,
    utilityCreditsQuota: 3000,
    message_limit: 8000,
    max_campaign_size: 1000,
    contact_limit: 2000,
    agent_limit: 3,
    agentSeatLimit: 3,
    rateLimitRpm: 120,
    features: ['WhatsApp Cloud API', 'CSV Campaign Wizard', 'Live Chat', 'Basic Auto-replies'],
    status: 'active',
    overLimitAction: 'BLOCK'
  },
  {
    id: 'plan_premium',
    name: 'Premium',
    slug: 'premium',
    price: 2500,
    monthlyPrice: 2500,
    billing_period: 'monthly',
    marketingCreditsQuota: 20000,
    utilityCreditsQuota: 10000,
    message_limit: 30000,
    max_campaign_size: 5000,
    contact_limit: 10000,
    agent_limit: 10,
    agentSeatLimit: 10,
    rateLimitRpm: 300,
    features: ['API Access', 'Bot Builder', 'Multi-Agent Chat', 'Webhook Integration', 'Priority Queue'],
    status: 'active',
    overLimitAction: 'GRACE_OVERAGE'
  },
  {
    id: 'plan_refund_sys',
    name: 'Refund Sys',
    slug: 'refund_sys',
    price: 1857,
    monthlyPrice: 1857,
    billing_period: 'monthly',
    marketingCreditsQuota: 12000,
    utilityCreditsQuota: 8000,
    message_limit: 20000,
    max_campaign_size: 3000,
    contact_limit: 5000,
    agent_limit: 5,
    agentSeatLimit: 5,
    rateLimitRpm: 200,
    features: ['Refund Accounting', 'Automated Webhook Receipts', 'Double-Entry Ledgers'],
    status: 'active',
    overLimitAction: 'GRACE_OVERAGE'
  },
  {
    id: 'plan_starter_100',
    name: 'Starter Plan 100',
    slug: 'starter_100',
    price: 5,
    monthlyPrice: 5,
    billing_period: 'monthly',
    marketingCreditsQuota: 100,
    utilityCreditsQuota: 100,
    message_limit: 200,
    max_campaign_size: 50,
    contact_limit: 100,
    agent_limit: 1,
    agentSeatLimit: 1,
    rateLimitRpm: 60,
    features: ['Test Environment'],
    status: 'active',
    overLimitAction: 'BLOCK'
  },
  {
    id: 'plan_dedicated',
    name: 'Dedicated',
    slug: 'dedicated',
    price: 300000,
    monthlyPrice: 300000,
    billing_period: 'monthly',
    marketingCreditsQuota: 500000,
    utilityCreditsQuota: 250000,
    message_limit: 750000,
    max_campaign_size: 100000,
    contact_limit: 500000,
    agent_limit: 100,
    agentSeatLimit: 100,
    rateLimitRpm: 2400,
    features: ['Dedicated WhatsApp WABA Infrastructure', 'Custom SLA', '24/7 Phone Support'],
    status: 'active',
    overLimitAction: 'GRACE_OVERAGE'
  },
  {
    id: 'plan_zest_30k',
    name: 'Zest 30k',
    slug: 'zest_30k',
    price: 10000,
    monthlyPrice: 10000,
    billing_period: 'monthly',
    marketingCreditsQuota: 30000,
    utilityCreditsQuota: 15000,
    message_limit: 45000,
    max_campaign_size: 10000,
    contact_limit: 30000,
    agent_limit: 15,
    agentSeatLimit: 15,
    rateLimitRpm: 600,
    features: ['High Throughput Concurrency', 'Bot Rule Escalations'],
    status: 'active',
    overLimitAction: 'GRACE_OVERAGE'
  },
  {
    id: 'plan_refund_hubspot',
    name: 'Refund & Hubspot',
    slug: 'refund_hubspot',
    price: 4000,
    monthlyPrice: 4000,
    billing_period: 'monthly',
    marketingCreditsQuota: 25000,
    utilityCreditsQuota: 15000,
    message_limit: 40000,
    max_campaign_size: 8000,
    contact_limit: 25000,
    agent_limit: 10,
    agentSeatLimit: 10,
    rateLimitRpm: 400,
    features: ['Hubspot CRM Sync', 'Automatic Credit Reconciliation'],
    status: 'active',
    overLimitAction: 'GRACE_OVERAGE'
  }
];

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'cmp_bijendra',
    company_uid: 'CMP-000001',
    name: 'Bijendra Sain (House Seekers)',
    code: 'bijendra_sain',
    status: 'active',
    planId: 'plan_refund_sys',
    planName: 'Refund Sys',
    ownerName: 'Bijendra Sain',
    ownerEmail: 'bijendra@safel4sign.com',
    phone: '+919782869752',
    mobile: '+919782869752',
    address: 'Sector 62, Noida, Uttar Pradesh, India',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    cached_credit_balance: 9999,
    wabaAccountId: 'waba_acc_bijendra_01',
    createdAt: 'Thursday, September 10, 2026 2:17 PM'
  },
  {
    id: 'cmp_jytechnosoft',
    company_uid: 'CMP-000002',
    name: 'jytechnosoft',
    code: 'jytechnosoft',
    status: 'active',
    planId: 'plan_basic',
    planName: 'Plan 1',
    ownerName: 'jytechnosoft',
    ownerEmail: 'jytechnosoft@gmail.com',
    phone: '+919811223344',
    mobile: '+919811223344',
    address: 'Jaipur, Rajasthan, India',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    cached_credit_balance: 5000,
    createdAt: 'Thursday, September 10, 2026 11:31 PM'
  },
  {
    id: 'cmp_kachchi_mitti',
    company_uid: 'CMP-000003',
    name: 'Kachchi Mitti',
    code: 'kachchi_mitti',
    status: 'active',
    planId: 'plan_refund_sys',
    planName: 'Refund Sys',
    ownerName: 'Kachchi Mitti Organic',
    ownerEmail: 'kachchimitti@gmail.com',
    phone: '+919877665544',
    mobile: '+919877665544',
    address: 'Udaipur, Rajasthan, India',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    cached_credit_balance: 4200,
    createdAt: 'Friday, September 7, 2026 11:18 AM'
  },
  {
    id: 'cmp_arvind_gupta',
    company_uid: 'CMP-000004',
    name: 'ARVIND KUMAR GUPTA AND COMPANY',
    code: 'arvind_gupta',
    status: 'active',
    planId: 'plan_refund_sys',
    planName: 'Refund Sys',
    ownerName: 'Arvind Kumar Gupta',
    ownerEmail: 'arvindKUMARGUPTA@gmail.com',
    phone: '+919833445566',
    mobile: '+919833445566',
    address: 'Connaught Place, New Delhi, India',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    cached_credit_balance: 8500,
    createdAt: 'Friday, September 4, 2026 1:21 PM'
  },
  {
    id: 'cmp_abc_enterprises',
    company_uid: 'CMP-000005',
    name: 'ABC Enterprises',
    code: 'abc_enterprises',
    status: 'active',
    planId: 'plan_premium',
    planName: 'Premium',
    ownerName: 'Rajesh Sharma',
    ownerEmail: 'rajesh@abcenterprises.com',
    phone: '+919822222222',
    mobile: '+919822222222',
    address: 'Nehru Place, New Delhi, India',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    cached_credit_balance: 2000,
    createdAt: 'Saturday, August 15, 2026 10:00 AM'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    companyId: 'cmp_bijendra',
    name: 'Admin',
    email: 'admin@whatsappsaas.com',
    mobile: '+919876543210',
    role: 'super_admin',
    status: 'active',
    isActive: true,
    lastLoginAt: '2026-10-25T08:12:00Z',
    isOnline: true
  },
  {
    id: 'usr_bijendra',
    companyId: 'cmp_bijendra',
    name: 'Bijendra Sain',
    email: 'bijendra@safel4sign.com',
    mobile: '+919782869752',
    role: 'company_admin',
    status: 'active',
    isActive: true,
    lastLoginAt: '2026-10-25T08:00:00Z',
    isOnline: true
  },
  {
    id: 'usr_saroj',
    companyId: 'cmp_bijendra',
    name: 'Saroj Kumar',
    email: 'saroj@houseseekers.com',
    mobile: '+919811111111',
    role: 'company_admin',
    status: 'active',
    isActive: true,
    lastLoginAt: '2026-10-24T18:20:00Z',
    isOnline: true
  },
  {
    id: 'usr_agent_rahul',
    companyId: 'cmp_bijendra',
    name: 'Rahul Verma',
    email: 'rahul@houseseekers.com',
    mobile: '+919811111122',
    role: 'agent',
    status: 'active',
    isActive: true,
    lastLoginAt: '2026-10-25T07:30:00Z',
    isOnline: true,
    activeChatCount: 2,
    maxChatCapacity: 5
  },
  {
    id: 'usr_agent_amit',
    companyId: 'cmp_bijendra',
    name: 'Amit Singh',
    email: 'amit@houseseekers.com',
    mobile: '+919811111133',
    role: 'agent',
    status: 'active',
    isActive: true,
    lastLoginAt: '2026-10-25T07:15:00Z',
    isOnline: true,
    activeChatCount: 1,
    maxChatCapacity: 5
  },
  {
    id: 'usr_jytechnosoft',
    companyId: 'cmp_jytechnosoft',
    name: 'jytechnosoft Admin',
    email: 'jytechnosoft@gmail.com',
    mobile: '+919811223344',
    role: 'company_admin',
    status: 'active',
    isActive: true,
    lastLoginAt: '2026-10-24T12:00:00Z',
    isOnline: true
  },
  {
    id: 'usr_kachchi_mitti',
    companyId: 'cmp_kachchi_mitti',
    name: 'Kachchi Mitti Organic',
    email: 'kachchimitti@gmail.com',
    mobile: '+919877665544',
    role: 'company_admin',
    status: 'active',
    isActive: true,
    lastLoginAt: '2026-10-24T14:30:00Z',
    isOnline: true
  },
  {
    id: 'usr_arvind_gupta',
    companyId: 'cmp_arvind_gupta',
    name: 'Arvind Kumar Gupta',
    email: 'arvindKUMARGUPTA@gmail.com',
    mobile: '+919833445566',
    role: 'company_admin',
    status: 'active',
    isActive: true,
    lastLoginAt: '2026-10-25T06:00:00Z',
    isOnline: true
  },
  {
    id: 'usr_abc_enterprises',
    companyId: 'cmp_abc_enterprises',
    name: 'Rajesh Sharma',
    email: 'rajesh@abcenterprises.com',
    mobile: '+919822222222',
    role: 'company_admin',
    status: 'active',
    isActive: true,
    lastLoginAt: '2026-10-25T05:45:00Z',
    isOnline: true
  }
];

export const INITIAL_PERMISSION_MATRIX: PermissionMatrix = {
  super_admin: {
    'platform:manage_companies': true,
    'platform:impersonate_tenant': true,
    'platform:manage_plans': true,
    'credits:allocate_any': true,
    'credits:view_all': true,
    'campaigns:create': true,
    'campaigns:execute': true,
    'campaigns:cancel': true,
    'chat:read': true,
    'chat:reply': true,
    'chat:reassign': true,
    'templates:manage': true,
    'contacts:manage': true,
    'bot:configure': true,
    'api_keys:manage': true,
    'audit:read': true
  },
  company_admin: {
    'platform:manage_companies': false,
    'platform:impersonate_tenant': false,
    'platform:manage_plans': false,
    'credits:allocate_any': false,
    'credits:view_all': true,
    'campaigns:create': true,
    'campaigns:execute': true,
    'campaigns:cancel': true,
    'chat:read': true,
    'chat:reply': true,
    'chat:reassign': true,
    'templates:manage': true,
    'contacts:manage': true,
    'bot:configure': true,
    'api_keys:manage': true,
    'audit:read': true
  },
  agent: {
    'platform:manage_companies': false,
    'platform:impersonate_tenant': false,
    'platform:manage_plans': false,
    'credits:allocate_any': false,
    'credits:view_all': false,
    'campaigns:create': false,
    'campaigns:execute': false,
    'campaigns:cancel': false,
    'chat:read': true,
    'chat:reply': true,
    'chat:reassign': false,
    'templates:manage': false,
    'contacts:manage': false,
    'bot:configure': false,
    'api_keys:manage': false,
    'audit:read': false
  }
};

export const INITIAL_WALLETS: Record<string, CreditWallet> = {
  cmp_bijendra: {
    companyId: 'cmp_bijendra',
    marketingTotal: 7499,
    marketingReserved: 500,
    marketingConsumed: 1200,
    utilityTotal: 2500,
    utilityReserved: 200,
    utilityConsumed: 800,
    lastReconciledAt: '2026-10-25T01:00:00Z'
  },
  cmp_jytechnosoft: {
    companyId: 'cmp_jytechnosoft',
    marketingTotal: 3000,
    marketingReserved: 0,
    marketingConsumed: 600,
    utilityTotal: 2000,
    utilityReserved: 0,
    utilityConsumed: 400,
    lastReconciledAt: '2026-10-25T01:00:00Z'
  },
  cmp_kachchi_mitti: {
    companyId: 'cmp_kachchi_mitti',
    marketingTotal: 2800,
    marketingReserved: 100,
    marketingConsumed: 900,
    utilityTotal: 1400,
    utilityReserved: 0,
    utilityConsumed: 300,
    lastReconciledAt: '2026-10-25T01:00:00Z'
  },
  cmp_arvind_gupta: {
    companyId: 'cmp_arvind_gupta',
    marketingTotal: 6000,
    marketingReserved: 200,
    marketingConsumed: 1800,
    utilityTotal: 2500,
    utilityReserved: 50,
    utilityConsumed: 700,
    lastReconciledAt: '2026-10-25T01:00:00Z'
  },
  cmp_abc_enterprises: {
    companyId: 'cmp_abc_enterprises',
    marketingTotal: 1500,
    marketingReserved: 0,
    marketingConsumed: 450,
    utilityTotal: 500,
    utilityReserved: 0,
    utilityConsumed: 150,
    lastReconciledAt: '2026-10-24T12:00:00Z'
  }
};

export const INITIAL_LEDGER: CreditLedgerEntry[] = [
  {
    id: 'led_tx_001',
    companyId: 'cmp_bijendra',
    category: 'MARKETING',
    type: 'plan_allocation',
    amount: 10000,
    beforeBalance: 0,
    afterBalance: 10000,
    referenceType: 'subscription',
    referenceId: 'sub_1',
    reason: 'Initial monthly plan credits allocated',
    idempotencyKey: 'idemp_sub_alloc_01',
    timestamp: '2026-10-01T00:00:00Z',
    actorId: 'usr_admin',
    actorEmail: 'admin@whatsappsaas.com'
  },
  {
    id: 'led_tx_002',
    companyId: 'cmp_bijendra',
    category: 'UTILITY',
    type: 'admin_added',
    amount: 2000,
    beforeBalance: 0,
    afterBalance: 2000,
    referenceType: 'manual_grant',
    referenceId: 'admin_grant_01',
    reason: 'Bonus utility credits provided by admin',
    idempotencyKey: 'idemp_admin_grant_02',
    timestamp: '2026-10-05T10:00:00Z',
    actorId: 'usr_admin',
    actorEmail: 'admin@whatsappsaas.com'
  },
  {
    id: 'led_tx_003',
    companyId: 'cmp_bijendra',
    category: 'MARKETING',
    type: 'campaign_reserved',
    amount: -800,
    beforeBalance: 10000,
    afterBalance: 9200,
    referenceType: 'campaign',
    referenceId: 'cmp_festival_offer',
    reason: 'Reserved for Festival Offer Campaign (800 recipients)',
    idempotencyKey: 'idemp_cmp_res_03',
    timestamp: '2026-10-25T01:30:00Z',
    actorId: 'usr_bijendra',
    actorEmail: 'bijendra@safel4sign.com'
  },
  {
    id: 'led_tx_004',
    companyId: 'cmp_bijendra',
    category: 'MARKETING',
    type: 'campaign_released',
    amount: 50,
    beforeBalance: 9200,
    afterBalance: 9250,
    referenceType: 'campaign',
    referenceId: 'cmp_festival_offer',
    reason: 'Released unsent message credits back to balance',
    idempotencyKey: 'idemp_cmp_rel_04',
    timestamp: '2026-10-25T01:45:00Z',
    actorId: 'usr_bijendra',
    actorEmail: 'bijendra@safel4sign.com'
  },
  {
    id: 'led_tx_005',
    companyId: 'cmp_bijendra',
    category: 'MARKETING',
    type: 'message_consumed',
    amount: -750,
    beforeBalance: 9250,
    afterBalance: 9250,
    referenceType: 'campaign',
    referenceId: 'cmp_festival_offer',
    reason: 'Consumed by confirmed dispatched batch to Meta Cloud API',
    idempotencyKey: 'idemp_cmp_con_05',
    timestamp: '2026-10-25T01:50:00Z',
    actorId: 'usr_admin',
    actorEmail: 'worker@aspai.in'
  }
];

export const INITIAL_API_KEYS: TenantApiKey[] = [
  {
    id: 'key_asp_live_01',
    companyId: 'cmp_bijendra',
    name: 'Production Cloud API Token',
    keyPrefix: 'G1K2RttZ8kFj',
    tokenHash: 'd3b07384d113edec49eaa6238ad5ff00',
    rawKeyOnce: 'G1K2RttZ8kFjckvvYOSRtbBKWYdRejL11FWzpZOe51adc7f',
    scopes: ['messages:send', 'templates:read', 'contacts:read'],
    rateLimitRpm: 300,
    currentMinuteUsage: 14,
    status: 'ACTIVE',
    lastUsedAt: '2026-10-25T02:10:00Z',
    expiresAt: '2027-10-25T00:00:00Z',
    createdAt: '2026-09-10T10:00:00Z'
  }
];

export const INITIAL_WABA_CONFIG: WABAConfig = {
  companyId: 'cmp_bijendra',
  wabaId: '392817492049182',
  phoneNumberId: '109283746592819',
  displayPhoneNumber: '+91 97828 69752',
  verifiedName: 'ASP Ai Official',
  qualityRating: 'GREEN',
  metaTier: 'TIER_100K',
  accessTokenMasked: 'EAAR4IQDQbN1BBOWr1j120mqCInZCZBCCpkvJH',
  webhookVerifyToken: '0TK1RtZ28kFjckvvYOSRtbBKWYdRejL11FWzpZOe51adc7f',
  appSecretMasked: '4f29...91b8',
  isConnected: true,
  lastSyncedAt: '2026-10-25T02:00:00Z',
  callbackUrl: 'https://app.aspai.in/webhook/receive/0TK1RtZ28kFjckvvYOSRtbBKWYdRejL11FWzpZOe51adc7f'
};

export const INITIAL_TEMPLATES: MetaTemplate[] = [
  {
    id: 'tpl_safe4sign_otp',
    companyId: 'cmp_bijendra',
    metaTemplateId: 'meta_tpl_safe4sign',
    name: 'safe4sign_login_otp',
    whatsapp_template_name: 'safe4sign_login_otp',
    category: 'AUTHENTICATION',
    language: 'en',
    status: 'APPROVED',
    headerType: 'NONE',
    bodyText: '"123456" is your verification code. For your security, do not share this code.\nExpires in 5 minutes.',
    variablesCount: 1,
    sampleValues: ['123456'],
    footerText: 'Security Notice',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Copy code' }
    ],
    lastSyncedAt: '2026-10-24T18:00:00Z'
  },
  {
    id: 'tpl_property_launch',
    companyId: 'cmp_bijendra',
    metaTemplateId: 'meta_tpl_prop_01',
    name: 'Property Announcement',
    whatsapp_template_name: 'property_launch_v1',
    category: 'MARKETING',
    language: 'en',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerText: 'Exclusive Property Launch',
    bodyText: 'Hello {{1}}, check out our new luxury apartments in sector 62! Reply for private walkthrough.',
    variablesCount: 1,
    sampleValues: ['Anil'],
    footerText: 'House Seekers Premier Real Estate',
    buttons: [
      { type: 'URL', text: 'View Brochure', value: 'https://houseseekers.com/sec62' },
      { type: 'QUICK_REPLY', text: 'Book Visit' }
    ],
    lastSyncedAt: '2026-10-24T18:00:00Z'
  }
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'cnt_001',
    companyId: 'cmp_bijendra',
    phone: '919782869752',
    name: 'Bijendra Sain',
    email: 'bijendra@safel4sign.com',
    country_code: '+91',
    consentStatus: 'OPTED_IN',
    consentSource: 'WEBSITE_FORM',
    consentTimestamp: '2026-09-13T10:00:00Z',
    tags: ['vip', 'admin'],
    groups: ['grp_investors'],
    customAttributes: { city: 'Noida' },
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-09-13T10:00:00Z'
  },
  {
    id: 'cnt_002',
    companyId: 'cmp_bijendra',
    phone: '919800000001',
    name: 'Anil Gupta',
    email: 'anil@gmail.com',
    country_code: '+91',
    consentStatus: 'OPTED_IN',
    consentSource: 'CHECKOUT',
    consentTimestamp: '2026-09-14T11:00:00Z',
    tags: ['lead', 'buyer'],
    groups: ['grp_investors'],
    customAttributes: { city: 'Delhi' },
    createdAt: '2026-09-14T11:00:00Z',
    updatedAt: '2026-09-14T11:00:00Z'
  },
  {
    id: 'cnt_003',
    companyId: 'cmp_bijendra',
    phone: '919800000002',
    name: 'Priya Sharma',
    email: 'priya@gmail.com',
    country_code: '+91',
    consentStatus: 'OPTED_IN',
    consentSource: 'INBOUND_MESSAGE',
    consentTimestamp: '2026-09-14T12:00:00Z',
    tags: ['client', 'retail'],
    groups: ['grp_general'],
    customAttributes: { city: 'Noida' },
    createdAt: '2026-09-14T12:00:00Z',
    updatedAt: '2026-09-14T12:00:00Z'
  },
  {
    id: 'cnt_004',
    companyId: 'cmp_bijendra',
    phone: '919800000003',
    name: 'Vikram Mehta',
    email: 'vikram@gmail.com',
    country_code: '+91',
    consentStatus: 'OPTED_IN',
    consentSource: 'CSV_IMPORT',
    consentTimestamp: '2026-09-14T14:00:00Z',
    tags: ['investor'],
    groups: ['grp_investors'],
    customAttributes: { city: 'Gurgaon' },
    createdAt: '2026-09-14T14:00:00Z',
    updatedAt: '2026-09-14T14:00:00Z'
  }
];

export const INITIAL_GROUPS: ContactGroup[] = [
  {
    id: 'grp_investors',
    companyId: 'cmp_bijendra',
    name: 'Sector 62 Luxury Investors',
    description: 'High net-worth contacts interested in real estate',
    contactCount: 3,
    isDynamic: false,
    createdAt: '2026-09-10T10:00:00Z'
  },
  {
    id: 'grp_general',
    companyId: 'cmp_bijendra',
    name: 'General Subscribers',
    description: 'All inbound opted-in WhatsApp contacts',
    contactCount: 1,
    isDynamic: true,
    createdAt: '2026-09-12T10:00:00Z'
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp_festival_offer',
    companyId: 'cmp_bijendra',
    name: 'Festival Offer Campaign',
    category: 'MARKETING',
    templateId: 'tpl_property_launch',
    templateName: 'Property Announcement',
    status: 'completed',
    totalRecipients: 3,
    recipient_count: 3,
    sentCount: 3,
    deliveredCount: 2,
    readCount: 1,
    failedCount: 1,
    skippedCount: 0,
    creditsReserved: 800,
    reserved_credits: 800,
    creditsConsumed: 750,
    consumed_credits: 750,
    creditsRefunded: 50,
    released_credits: 50,
    batchSize: 50,
    concurrency: 4,
    sendRateMs: 200,
    maxRetryAttempts: 3,
    startedAt: '2026-03-01 10:00:05',
    completedAt: '2026-03-01 10:05:00',
    variableMapping: { '1': 'name' },
    recipients: [
      {
        id: 'rec_001',
        campaignId: 'cmp_festival_offer',
        contactId: 'cnt_002',
        phone: '919800000001',
        name: 'Anil Gupta',
        variables: { '1': 'Anil' },
        status: 'read',
        wabaMessageId: 'wamid.HBgLOTE5ODAwMDAwMDAxFQIAERgSQjE2RUU1NkRGMzE3OUY0MTE2AA==',
        whatsapp_message_id: 'wamid.HBgLOTE5ODAwMDAwMDAxFQIAERgSQjE2RUU1NkRGMzE3OUY0MTE2AA==',
        idempotencyKey: 'idemp_cmp_001_anil',
        retryCount: 0,
        sentAt: '2026-03-01 10:00:10',
        deliveredAt: '2026-03-01 10:00:12',
        readAt: '2026-03-01 10:01:30'
      },
      {
        id: 'rec_002',
        campaignId: 'cmp_festival_offer',
        contactId: 'cnt_003',
        phone: '919800000002',
        name: 'Priya Sharma',
        variables: { '1': 'Priya' },
        status: 'delivered',
        wabaMessageId: 'wamid.HBgLOTE5ODAwMDAwMDAyFQIAERgSQjE2RUU1NkRGMzE3OUY0MTE3AA==',
        whatsapp_message_id: 'wamid.HBgLOTE5ODAwMDAwMDAyFQIAERgSQjE2RUU1NkRGMzE3OUY0MTE3AA==',
        idempotencyKey: 'idemp_cmp_002_priya',
        retryCount: 0,
        sentAt: '2026-03-01 10:00:11',
        deliveredAt: '2026-03-01 10:00:15'
      },
      {
        id: 'rec_003',
        campaignId: 'cmp_festival_offer',
        contactId: 'cnt_004',
        phone: '919800000003',
        name: 'Vikram Mehta',
        variables: { '1': 'Vikram' },
        status: 'failed',
        errorCode: '131026',
        errorMessage: 'Message undeliverable to target number',
        idempotencyKey: 'idemp_cmp_003_vikram',
        retryCount: 1
      }
    ],
    createdAt: '2026-03-01 10:00:00'
  }
];

export const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv_asp_util',
    companyId: 'cmp_bijendra',
    contactId: 'cnt_001',
    contactPhone: '+919782869752',
    contactName: 'Asp Utility',
    assignedAgentId: 'usr_agent_rahul',
    assignedAgentName: 'Rahul Verma',
    status: 'open',
    isBotHandled: false,
    unreadCount: 1,
    lastMessage: 'hi',
    lastMessageTime: 'a day ago',
    tags: ['utility', 'inbound'],
    createdAt: '2026-10-24T10:00:00Z'
  },
  {
    id: 'conv_phone_num',
    companyId: 'cmp_bijendra',
    contactId: 'cnt_002',
    contactPhone: '919782869752',
    contactName: '919782869752',
    assignedAgentId: 'usr_agent_amit',
    assignedAgentName: 'Amit Singh',
    status: 'open',
    isBotHandled: true,
    unreadCount: 0,
    lastMessage: 'hi',
    lastMessageTime: '1 day ago',
    tags: ['bot_replied'],
    createdAt: '2026-10-24T12:00:00Z'
  },
  {
    id: 'conv_bijendra',
    companyId: 'cmp_bijendra',
    contactId: 'cnt_001',
    contactPhone: '+919782869752',
    contactName: 'Bijendra Sain',
    assignedAgentId: 'usr_agent_rahul',
    assignedAgentName: 'Rahul Verma',
    status: 'open',
    isBotHandled: false,
    unreadCount: 0,
    lastMessage: 'hi',
    lastMessageTime: '2 days ago',
    tags: ['admin'],
    createdAt: '2026-10-23T14:00:00Z'
  }
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  conv_asp_util: [
    {
      id: 'msg_01',
      conversationId: 'conv_asp_util',
      companyId: 'cmp_bijendra',
      direction: 'incoming',
      senderType: 'CUSTOMER',
      senderName: 'Asp Utility',
      content: 'hi',
      deliveryStatus: 'delivered',
      timestamp: '2026-10-24T10:00:00Z'
    },
    {
      id: 'msg_02',
      conversationId: 'conv_asp_util',
      companyId: 'cmp_bijendra',
      direction: 'outgoing',
      senderType: 'AGENT',
      senderName: 'Rahul Verma',
      content: 'Hello! Welcome to ASP Ai. How can we assist your business today?',
      deliveryStatus: 'read',
      timestamp: '2026-10-24T10:05:00Z'
    }
  ],
  conv_phone_num: [
    {
      id: 'msg_11',
      conversationId: 'conv_phone_num',
      companyId: 'cmp_bijendra',
      direction: 'incoming',
      senderType: 'CUSTOMER',
      senderName: '919782869752',
      content: 'hi',
      deliveryStatus: 'delivered',
      timestamp: '2026-10-24T12:00:00Z'
    },
    {
      id: 'msg_12',
      conversationId: 'conv_phone_num',
      companyId: 'cmp_bijendra',
      direction: 'outgoing',
      senderType: 'BOT',
      senderName: 'ASP Bot',
      content: 'Welcome to House Seekers! For property details reply "1", for price quote reply "2".',
      deliveryStatus: 'read',
      timestamp: '2026-10-24T12:00:02Z'
    }
  ],
  conv_bijendra: [
    {
      id: 'msg_21',
      conversationId: 'conv_bijendra',
      companyId: 'cmp_bijendra',
      direction: 'incoming',
      senderType: 'CUSTOMER',
      senderName: 'Bijendra Sain',
      content: 'hi',
      deliveryStatus: 'read',
      timestamp: '2026-10-23T14:00:00Z'
    }
  ]
};

export const INITIAL_INTERNAL_NOTES: Record<string, InternalNote[]> = {
  conv_asp_util: [
    {
      id: 'note_01',
      conversationId: 'conv_asp_util',
      authorId: 'usr_agent_rahul',
      authorName: 'Rahul Verma',
      content: 'Customer is exploring enterprise bulk messaging tier. Follow up with custom quote.',
      createdAt: '2026-10-24T10:10:00Z'
    }
  ]
};

export const INITIAL_BOT_RULES: BotAutomationRule[] = [
  {
    id: 'bot_01',
    companyId: 'cmp_bijendra',
    priority: 1,
    name: 'Property Pricing Auto-Reply',
    triggerType: 'CONTAINS',
    trigger_text: 'price, quote, cost, sector 62',
    response_text: 'Sector 62 3BHK luxury apartments start from ₹1.45 Cr. Brochure sent to your WhatsApp.',
    keywords: ['price', 'quote', 'cost', 'sector 62'],
    caseSensitive: false,
    actionType: 'SEND_TEXT',
    replyText: 'Sector 62 3BHK luxury apartments start from ₹1.45 Cr. Brochure sent to your WhatsApp.',
    isActive: true,
    status: 'active',
    hitCount: 42
  },
  {
    id: 'bot_02',
    companyId: 'cmp_bijendra',
    priority: 2,
    name: 'Agent Escalation',
    triggerType: 'CONTAINS',
    trigger_text: 'agent, human, support, representative',
    response_text: 'Connecting you with Rahul Verma right now. Please hold on...',
    keywords: ['agent', 'human', 'support', 'representative'],
    caseSensitive: false,
    actionType: 'HANDOFF_AGENT',
    replyText: 'Connecting you with Rahul Verma right now. Please hold on...',
    assignToAgentId: 'usr_agent_rahul',
    isActive: true,
    status: 'active',
    hitCount: 19
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_001',
    companyId: 'cmp_bijendra',
    companyName: 'Bijendra Sain (House Seekers)',
    actorId: 'usr_admin',
    actorEmail: 'admin@whatsappsaas.com',
    actorRole: 'super_admin',
    category: 'CREDIT',
    action: 'ADMIN_CREDIT_ADD',
    details: 'Allocated 2,000 bonus Utility Credits to House Seekers',
    ipAddress: '127.0.0.1',
    timestamp: '2026-10-25T01:00:00Z'
  },
  {
    id: 'aud_002',
    companyId: 'cmp_bijendra',
    companyName: 'Bijendra Sain (House Seekers)',
    actorId: 'usr_bijendra',
    actorEmail: 'bijendra@safel4sign.com',
    actorRole: 'company_admin',
    category: 'CAMPAIGN',
    action: 'CAMPAIGN_LAUNCHED',
    details: 'Festival Offer Campaign launched. 800 credits reserved.',
    ipAddress: '103.21.124.5',
    timestamp: '2026-10-25T01:30:00Z'
  }
];

export const INITIAL_BACKGROUND_JOBS: BackgroundJob[] = [
  {
    id: 'job_001',
    companyId: 'cmp_bijendra',
    type: 'CAMPAIGN_DISPATCH',
    status: 'COMPLETED',
    progress: 100,
    payloadDescription: 'Festival Offer Campaign (3 recipients, completed)',
    attempts: 1,
    maxAttempts: 3,
    createdAt: '2026-03-01 10:00:00',
    completedAt: '2026-03-01 10:05:00'
  }
];

export const INITIAL_APP_SETTINGS: AppSettings = {
  enableAgents: true,
  showOnlyAssignedChats: false,
  webhookCallbackUrl: 'https://app.aspai.in/webhook/receive/0TK1RtZ28kFjckvvYOSRtbBKWYdRejL11FWzpZOe51adc7f',
  blacklistedPhoneNumbers: '+18005550000, +919800009999',
  projectName: 'ASP Ai',
  siteUrl: 'https://app.aspai.in'
};

export const ADMIN_STATS = {
  users: 89,
  usersNewThisMonth: 1,
  payingClients: 62,
  payingClientsNewThisMonth: 4,
  mrr: 503679.00,
  arr: 6044148.00
};

export const TENANT_STATS = {
  singleSendTemplates: 2,
  openRatePct: 50,
  templates: 1,
  approvedTemplates: 1,
  contacts: 4,
  newContactsThisMonth: 1,
  openChats: 3,
  resolvedConversations: 0,
  creditLimit: 9999
};
