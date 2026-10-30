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
    name: 'Starter',
    slug: 'starter',
    price: 1500,
    monthlyPrice: 1500,
    billing_period: 'monthly',
    marketingCreditsQuota: 5000,
    utilityCreditsQuota: 3000,
    message_limit: 8000,
    max_campaign_size: 1000,
    contact_limit: 2000,
    agent_limit: 3,
    agentSeatLimit: 3,
    rateLimitRpm: 120,
    features: ['WhatsApp Cloud API', 'CSV Campaign Wizard', 'Live Chat Inbox', 'Keyword Auto-replies'],
    status: 'active',
    overLimitAction: 'BLOCK'
  },
  {
    id: 'plan_premium',
    name: 'Professional Enterprise',
    slug: 'professional_enterprise',
    price: 3500,
    monthlyPrice: 3500,
    billing_period: 'monthly',
    marketingCreditsQuota: 25000,
    utilityCreditsQuota: 15000,
    message_limit: 40000,
    max_campaign_size: 10000,
    contact_limit: 25000,
    agent_limit: 10,
    agentSeatLimit: 10,
    rateLimitRpm: 300,
    features: ['Unlimited Campaigns', 'Full API Access', 'Multi-Agent Routing', 'Webhook Sync', 'Bot Builder', 'Double-Entry Ledger'],
    status: 'active',
    overLimitAction: 'GRACE_OVERAGE'
  },
  {
    id: 'plan_growth',
    name: 'Scale & Growth',
    slug: 'scale_growth',
    price: 7500,
    monthlyPrice: 7500,
    billing_period: 'monthly',
    marketingCreditsQuota: 60000,
    utilityCreditsQuota: 30000,
    message_limit: 90000,
    max_campaign_size: 25000,
    contact_limit: 60000,
    agent_limit: 25,
    agentSeatLimit: 25,
    rateLimitRpm: 600,
    features: ['High Throughput Concurrency', 'Priority Dispatch Queue', 'Dedicated Webhook Endpoints', 'Dedicated Account Manager'],
    status: 'active',
    overLimitAction: 'GRACE_OVERAGE'
  }
];

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'cmp_webcraft',
    company_uid: 'WC-000001',
    name: 'Webcraft Solution',
    code: 'webcraft_solution',
    status: 'active',
    planId: 'plan_premium',
    planName: 'Professional Enterprise',
    ownerName: 'Bijendra Sain',
    ownerEmail: 'vraj21712@gmail.com',
    phone: '+91 98765 43210',
    mobile: '+91 98765 43210',
    address: 'Webcraft Solution Corporate HQ, India',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    cached_credit_balance: 25000,
    wabaAccountId: 'waba_webcraft_01',
    appId: '2182826355974603',
    appSecret: '4f29a88c71b9e0293847a192837491b8',
    phoneNumberId: '123255029949291',
    webhookVerifyToken: 'webcraft_verify_token_whatsapp',
    webhookConnected: true,
    webhookConnectedAt: new Date().toISOString(),
    hardSecretToken: 'wc_sec_live_79a29d81f203847291a8274b091827491028374a91b2c3d4',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_superadmin',
    companyId: 'cmp_webcraft',
    name: 'Bijendra Sain',
    email: 'bijendra@webcraftsolution.com',
    mobile: '+91 98765 43210',
    role: 'super_admin',
    status: 'active',
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    isOnline: true
  },
  {
    id: 'usr_owner',
    companyId: 'cmp_webcraft',
    name: 'Bijendra Sain',
    email: 'vraj21712@gmail.com',
    mobile: '+91 98765 43210',
    role: 'company_admin',
    status: 'active',
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    isOnline: true
  },
  {
    id: 'usr_agent_support',
    companyId: 'cmp_webcraft',
    name: 'Support Specialist',
    email: 'support@webcraftsolution.com',
    mobile: '+91 98765 43211',
    role: 'agent',
    status: 'active',
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    isOnline: true,
    activeChatCount: 1,
    maxChatCapacity: 10
  }
];

export const INITIAL_WALLETS: Record<string, CreditWallet> = {
  cmp_webcraft: {
    companyId: 'cmp_webcraft',
    marketingTotal: 15000,
    marketingReserved: 0,
    marketingConsumed: 0,
    utilityTotal: 10000,
    utilityReserved: 0,
    utilityConsumed: 0,
    lastReconciledAt: new Date().toISOString()
  }
};

export const INITIAL_LEDGER: CreditLedgerEntry[] = [
  {
    id: 'ledg_init_mkt',
    companyId: 'cmp_webcraft',
    category: 'MARKETING',
    type: 'ALLOCATION',
    amount: 15000,
    beforeBalance: 0,
    afterBalance: 15000,
    referenceType: 'super_admin_grant',
    referenceId: 'init_grant_01',
    reason: 'Initial marketing credit allocation for Webcraft Solution',
    idempotencyKey: 'idemp_webcraft_mkt_01',
    timestamp: new Date().toISOString(),
    actorId: 'usr_superadmin',
    actorEmail: 'admin@webcraftsolution.com'
  },
  {
    id: 'ledg_init_utl',
    companyId: 'cmp_webcraft',
    category: 'UTILITY',
    type: 'ALLOCATION',
    amount: 10000,
    beforeBalance: 0,
    afterBalance: 10000,
    referenceType: 'super_admin_grant',
    referenceId: 'init_grant_02',
    reason: 'Initial utility credit allocation for Webcraft Solution',
    idempotencyKey: 'idemp_webcraft_utl_01',
    timestamp: new Date().toISOString(),
    actorId: 'usr_superadmin',
    actorEmail: 'admin@webcraftsolution.com'
  }
];

export const INITIAL_API_KEYS: TenantApiKey[] = [
  {
    id: 'key_webcraft_master_01',
    companyId: 'cmp_webcraft',
    name: 'Master Hardened Secret Token',
    keyPrefix: 'wc_sec_live',
    tokenHash: 'd3b07384d113edec49eaa6238ad5ff00',
    rawKeyOnce: 'wc_sec_live_79a29d81f203847291a8274b091827491028374a91b2c3d4',
    scopes: ['messages:send', 'templates:read', 'contacts:read', 'webhooks:listen'],
    rateLimitRpm: 600,
    currentMinuteUsage: 0,
    status: 'ACTIVE',
    isHardenedSecret: true,
    description: 'Permanent master high-entropy secret token generated at company provisioning',
    lastUsedAt: new Date().toISOString(),
    expiresAt: '2030-01-01T00:00:00Z',
    createdAt: new Date().toISOString()
  },
  {
    id: 'key_webcraft_hook_02',
    companyId: 'cmp_webcraft',
    name: 'Webhook Ingestion Hardened Secret',
    keyPrefix: 'wc_sec_hook',
    tokenHash: 'a1928471928374819283748192837481',
    rawKeyOnce: 'wc_sec_live_hook_8829104812739481029384710293847192837481',
    scopes: ['webhooks:listen'],
    rateLimitRpm: 1200,
    currentMinuteUsage: 0,
    status: 'ACTIVE',
    isHardenedSecret: true,
    description: 'Dedicated hardened secret for high-throughput webhook subscription listening',
    lastUsedAt: new Date().toISOString(),
    expiresAt: '2030-01-01T00:00:00Z',
    createdAt: new Date().toISOString()
  },
  {
    id: 'key_webcraft_camp_03',
    companyId: 'cmp_webcraft',
    name: 'Campaign Dispatch Hardened Secret',
    keyPrefix: 'wc_sec_camp',
    tokenHash: 'f4829182749182749182749182749182',
    rawKeyOnce: 'wc_sec_live_camp_3910284719283748192837419283748192837482',
    scopes: ['messages:send', 'templates:read'],
    rateLimitRpm: 400,
    currentMinuteUsage: 0,
    status: 'ACTIVE',
    isHardenedSecret: true,
    description: 'Scoped hardened token for bulk campaign queue ingestion',
    lastUsedAt: new Date().toISOString(),
    expiresAt: '2030-01-01T00:00:00Z',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_WABA_CONFIG: WABAConfig = {
  companyId: 'cmp_webcraft',
  wabaId: '392817492049182',
  phoneNumberId: '123255029949291',
  displayPhoneNumber: '+91 98765 43210',
  verifiedName: 'Raj Kirana Store',
  qualityRating: 'GREEN',
  metaTier: 'TIER_100K',
  accessTokenMasked: 'EAAfBRN2N4csBSlerzNfWSpbjIp0dh2ZA7EBfJ...',
  webhookVerifyToken: 'webcraft_verify_token_whatsapp',
  appSecretMasked: '4f29...91b8',
  appSecret: '4f29a88c71b9e0293847a192837491b8',
  appId: '2182826355974603',
  isConnected: true,
  webhookConnected: true,
  webhookConnectedAt: new Date().toISOString(),
  lastSyncedAt: new Date().toISOString(),
  callbackUrl: 'https://whatsappcloud-virid.vercel.app/api/webhook'
};

export const INITIAL_TEMPLATES: MetaTemplate[] = [
  {
    id: 'tpl_welcome_webcraft',
    companyId: 'cmp_webcraft',
    metaTemplateId: 'meta_tpl_wc_welcome',
    name: 'welcome_webcraft_client',
    whatsapp_template_name: 'welcome_webcraft_client',
    category: 'MARKETING',
    language: 'en_US',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerText: 'Welcome to Webcraft Solution!',
    bodyText: 'Hello {{1}}, thank you for partnering with Webcraft Solution. Your WhatsApp Business Cloud API CRM is now activated and ready to broadcast campaigns.',
    variablesCount: 1,
    sampleValues: ['Customer'],
    footerText: 'Webcraft Solution • WhatsApp Cloud CRM',
    buttons: [
      { type: 'URL', text: 'Open Dashboard', value: 'https://whatsappcloud-virid.vercel.app' },
      { type: 'QUICK_REPLY', text: 'Chat with Support' }
    ],
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: 'tpl_login_otp',
    companyId: 'cmp_webcraft',
    metaTemplateId: 'meta_tpl_otp_01',
    name: 'webcraft_login_verification',
    whatsapp_template_name: 'webcraft_login_verification',
    category: 'AUTHENTICATION',
    language: 'en_US',
    status: 'APPROVED',
    headerType: 'NONE',
    bodyText: 'Your Webcraft Solution verification code is {{1}}. Valid for 10 minutes. Please do not share this code with anyone.',
    variablesCount: 1,
    sampleValues: ['482910'],
    footerText: 'Security Team',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Copy OTP' }
    ],
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: 'tpl_service_alert',
    companyId: 'cmp_webcraft',
    metaTemplateId: 'meta_tpl_alert_01',
    name: 'service_notification_update',
    whatsapp_template_name: 'service_notification_update',
    category: 'UTILITY',
    language: 'en_US',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerText: 'Order & Status Update',
    bodyText: 'Dear {{1}}, your request #{{2}} has been successfully processed and updated.',
    variablesCount: 2,
    sampleValues: ['Client', 'REQ-9012'],
    footerText: 'Automated notification',
    buttons: [],
    lastSyncedAt: new Date().toISOString()
  }
];

export const INITIAL_GROUPS: ContactGroup[] = [
  {
    id: 'grp_enterprise',
    companyId: 'cmp_webcraft',
    name: 'Enterprise Clients',
    description: 'Key business partners and enterprise accounts',
    isDynamic: false,
    contactCount: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'grp_new_leads',
    companyId: 'cmp_webcraft',
    name: 'Inbound Leads',
    description: 'Prospective WhatsApp leads received via webhook',
    isDynamic: true,
    contactCount: 2,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'cnt_001',
    companyId: 'cmp_webcraft',
    phone: '+919876543210',
    name: 'Vraj Patel',
    email: 'vraj21712@gmail.com',
    country_code: 'IN',
    consentStatus: 'OPTED_IN',
    consentSource: 'MANUAL',
    consentTimestamp: new Date().toISOString(),
    groups: ['grp_enterprise'],
    tags: ['Owner', 'VIP', 'Enterprise'],
    customAttributes: { account_type: 'Enterprise', plan: 'Pro' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cnt_002',
    companyId: 'cmp_webcraft',
    phone: '+14155552671',
    name: 'Tech Inquiries',
    email: 'contact@webcraftsolution.com',
    country_code: 'US',
    consentStatus: 'OPTED_IN',
    consentSource: 'WEBSITE_FORM',
    consentTimestamp: new Date().toISOString(),
    groups: ['grp_new_leads'],
    tags: ['Lead', 'API'],
    customAttributes: { source: 'Website Webhook' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [];

export const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv_001',
    companyId: 'cmp_webcraft',
    contactId: 'cnt_001',
    contactPhone: '+919876543210',
    contactName: 'Vraj Patel',
    assignedAgentId: 'usr_owner',
    assignedAgentName: 'Rajvish Patel',
    status: 'OPEN',
    isBotHandled: false,
    unreadCount: 0,
    lastMessage: 'Webhook & Cloud API integration connected successfully.',
    lastMessageTime: 'just now',
    tags: ['VIP'],
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  conv_001: [
    {
      id: 'msg_001',
      conversationId: 'conv_001',
      companyId: 'cmp_webcraft',
      direction: 'OUTBOUND',
      deliveryStatus: 'read',
      senderType: 'BOT',
      content: 'Welcome to Webcraft Solution WhatsApp Cloud API Platform!',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      senderName: 'System Bot',
      senderId: 'usr_superadmin'
    },
    {
      id: 'msg_002',
      conversationId: 'conv_001',
      companyId: 'cmp_webcraft',
      direction: 'INBOUND',
      deliveryStatus: 'delivered',
      senderType: 'CUSTOMER',
      content: 'Webhook & Cloud API integration connected successfully.',
      timestamp: new Date().toISOString(),
      senderName: 'Vraj Patel'
    }
  ]
};

export const INITIAL_INTERNAL_NOTES: Record<string, InternalNote[]> = {
  conv_001: [
    {
      id: 'note_001',
      conversationId: 'conv_001',
      authorId: 'usr_owner',
      authorName: 'Rajvish Patel',
      content: 'Primary account setup and webhook verification active for whatsappcloud-virid.vercel.app.',
      createdAt: new Date().toISOString()
    }
  ]
};

export const INITIAL_BOT_RULES: BotAutomationRule[] = [
  {
    id: 'bot_001',
    companyId: 'cmp_webcraft',
    name: 'Greeting Auto-Responder',
    triggerType: 'CONTAINS',
    trigger_text: 'hi, hello, hey, start',
    response_text: 'Hello! Welcome to Webcraft Solution. How can we assist your business today with WhatsApp Cloud API?',
    keywords: ['hi', 'hello', 'hey', 'start'],
    caseSensitive: false,
    replyText: 'Hello! Welcome to Webcraft Solution. How can we assist your business today with WhatsApp Cloud API?',
    actionType: 'SEND_TEXT',
    priority: 10,
    hitCount: 0,
    isActive: true,
    status: 'active'
  },
  {
    id: 'bot_002',
    companyId: 'cmp_webcraft',
    name: 'Support Escalation Bot',
    triggerType: 'CONTAINS',
    trigger_text: 'support, help, agent, issue',
    response_text: 'Connecting you with a Webcraft Solution specialist right away. Please hold on!',
    keywords: ['support', 'help', 'agent', 'issue'],
    caseSensitive: false,
    replyText: 'Connecting you with a Webcraft Solution specialist right away. Please hold on!',
    actionType: 'HANDOFF_AGENT',
    priority: 5,
    hitCount: 0,
    isActive: true,
    status: 'active'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_001',
    companyId: 'cmp_webcraft',
    companyName: 'Webcraft Solution',
    category: 'WHATSAPP',
    action: 'INITIALIZATION',
    actorId: 'usr_superadmin',
    actorEmail: 'admin@webcraftsolution.com',
    actorRole: 'super_admin',
    details: 'Webcraft Solution organization initialized with webhook: https://whatsappcloud-virid.vercel.app/api/webhook',
    ipAddress: '127.0.0.1',
    timestamp: new Date().toISOString()
  }
];

export const INITIAL_BACKGROUND_JOBS: BackgroundJob[] = [];

export const INITIAL_APP_SETTINGS: AppSettings = {
  enableAgents: true,
  showOnlyAssignedChats: false,
  webhookCallbackUrl: 'https://whatsappcloud-virid.vercel.app/api/webhook',
  blacklistedPhoneNumbers: '+18005550000, +919800009999',
  projectName: 'Webcraft Solution',
  siteUrl: 'https://whatsappcloud-virid.vercel.app',
  metaAppId: '18920192039481',
  metaAppSecret: '4f29a88c71b9e0293847a192837491b8'
};

export const ADMIN_STATS = {
  users: 12,
  usersNewThisMonth: 3,
  payingClients: 8,
  payingClientsNewThisMonth: 2,
  mrr: 28000.00,
  arr: 336000.00
};

export const TENANT_STATS = {
  singleSendTemplates: 3,
  openRatePct: 98,
  templates: 3,
  approvedTemplates: 3,
  contacts: 2,
  newContactsThisMonth: 2,
  openChats: 1,
  resolvedConversations: 0,
  creditLimit: 25000
};

export const INITIAL_PERMISSION_MATRIX: PermissionMatrix = {
  super_admin: {
    canViewAllTenants: true,
    canImpersonate: true,
    canManagePlans: true,
    canAllocateCredits: true,
    canViewAuditLogs: true,
    canEditSystemSettings: true,
    canSuspendTenant: true
  },
  company_admin: {
    canManageAgents: true,
    canConfigureWaba: true,
    canManageApiKeys: true,
    canCreateCampaigns: true,
    canViewLedger: true,
    canManageTemplates: true,
    canManageBots: true,
    canViewAllChats: true,
    canExportContacts: true
  },
  agent: {
    canReplyChats: true,
    canViewAssignedOnly: false,
    canCreateInternalNotes: true,
    canReassignChat: true,
    canViewContacts: true
  }
};
