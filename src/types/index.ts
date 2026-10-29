export type UserRole = 'super_admin' | 'company_admin' | 'agent' | 'SUPER_ADMIN' | 'COMPANY_OWNER' | 'ADMIN' | 'AGENT';

export type CompanyStatus = 'active' | 'inactive' | 'suspended' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export type CreditCategory = 'MARKETING' | 'UTILITY';

export type CreditTransactionType = 
  | 'plan_allocation'
  | 'admin_added'
  | 'campaign_reserved'
  | 'campaign_released'
  | 'message_consumed'
  | 'adjustment'
  | 'refund'
  | 'ALLOCATION'
  | 'RESERVATION'
  | 'COMMIT'
  | 'REFUND'
  | 'ADJUSTMENT';

export interface CreditLedgerEntry {
  id: string;
  companyId: string;
  category: CreditCategory;
  type: CreditTransactionType;
  amount: number;             // Positive for credit, negative for debit
  beforeBalance: number;
  afterBalance: number;
  referenceType: string;
  referenceId: string;
  reason: string;
  idempotencyKey: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
}

export interface CreditWallet {
  companyId: string;
  marketingTotal: number;
  marketingReserved: number;
  marketingConsumed: number;
  utilityTotal: number;
  utilityReserved: number;
  utilityConsumed: number;
  lastReconciledAt: string;
}

export interface Company {
  id: string;
  company_uid: string;
  name: string;
  code: string;
  status: CompanyStatus;
  planId: string;
  planName?: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  mobile?: string;
  address?: string;
  timezone: string;
  currency: string;
  cached_credit_balance: number;
  wabaAccountId?: string;
  wabaId?: string;
  phoneNumberId?: string;
  accessToken?: string;
  webhookVerifyToken?: string;
  graphApiVersion?: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  qualityRating?: string;
  createdAt: string;
  suspensionReason?: string;
  appSecret?: string;
  appId?: string;
  webhookConnected?: boolean;
  webhookConnectedAt?: string;
  hardSecretToken?: string;
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  mobile?: string;
  role: 'super_admin' | 'company_admin' | 'agent';
  status?: 'active' | 'inactive' | 'blocked';
  isActive: boolean;
  avatar?: string;
  lastLoginAt?: string;
  isOnline?: boolean;
  activeChatCount?: number;
  maxChatCapacity?: number;
}

export interface PermissionMatrix {
  [role: string]: {
    [permission: string]: boolean;
  };
}

export interface TenantApiKey {
  id: string;
  companyId: string;
  name: string;
  keyPrefix: string;
  tokenHash: string;
  rawKeyOnce?: string;
  scopes: string[];
  rateLimitRpm: number;
  currentMinuteUsage: number;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  isHardenedSecret?: boolean;
  description?: string;
  lastUsedAt?: string;
  expiresAt: string;
  createdAt: string;
}

export interface WABAConfig {
  companyId: string;
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName: string;
  qualityRating: 'GREEN' | 'YELLOW' | 'RED';
  metaTier: 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | 'TIER_UNLIMITED';
  accessTokenMasked: string;
  webhookVerifyToken: string;
  appSecretMasked: string;
  appSecret?: string;
  appId?: string;
  accessToken?: string;
  graphApiVersion?: string;
  isConnected: boolean;
  webhookConnected?: boolean;
  webhookConnectedAt?: string;
  lastSyncedAt: string;
  callbackUrl?: string;
}

export interface MetaTemplate {
  id: string;
  companyId: string;
  metaTemplateId: string;
  name: string;
  whatsapp_template_name?: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'PAUSED' | 'approved' | 'rejected' | 'pending' | 'draft';
  rejectionReason?: string;
  headerType: 'NONE' | 'TEXT' | 'IMAGE' | 'DOCUMENT';
  headerText?: string;
  bodyText: string;
  variablesCount: number;
  sampleValues: string[];
  footerText?: string;
  buttons: Array<{ type: 'QUICK_REPLY' | 'URL' | 'CALL'; text: string; value?: string }>;
  lastSyncedAt: string;
}

export type ConsentStatus = 'OPTED_IN' | 'OPTED_OUT' | 'PENDING';

export interface Contact {
  id: string;
  companyId: string;
  phone: string;
  name: string;
  email?: string;
  country_code?: string;
  consentStatus: ConsentStatus;
  consentSource: 'WEBSITE_FORM' | 'INBOUND_MESSAGE' | 'CSV_IMPORT' | 'CHECKOUT' | 'MANUAL';
  consentTimestamp: string;
  tags: string[];
  groups: string[];
  customAttributes: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ContactGroup {
  id: string;
  companyId: string;
  name: string;
  description: string;
  contactCount: number;
  isDynamic: boolean;
  filterCriteria?: {
    tags?: string[];
    consentStatus?: ConsentStatus;
  };
  createdAt: string;
}

export type CampaignStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'queued' 
  | 'processing' 
  | 'paused' 
  | 'completed' 
  | 'partially_failed' 
  | 'cancelled' 
  | 'failed';

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  contactId: string;
  phone: string;
  name: string;
  variables: Record<string, string>;
  status: 'queued' | 'processing' | 'submitted' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled' | 'skipped';
  skipReason?: string;
  errorCode?: string;
  errorMessage?: string;
  wabaMessageId?: string;
  whatsapp_message_id?: string;
  idempotencyKey: string;
  retryCount: number;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface Campaign {
  id: string;
  companyId: string;
  name: string;
  category: CreditCategory;
  templateId: string;
  templateName: string;
  status: CampaignStatus;
  totalRecipients: number;
  recipient_count?: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  skippedCount: number;
  creditsReserved: number;
  reserved_credits?: number;
  creditsConsumed: number;
  consumed_credits?: number;
  creditsRefunded: number;
  released_credits?: number;
  batchSize: number;
  concurrency: number;
  sendRateMs: number;
  maxRetryAttempts: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  variableMapping: Record<string, string>;
  recipients: CampaignRecipient[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  companyId: string;
  direction: 'INBOUND' | 'OUTBOUND' | 'incoming' | 'outgoing';
  senderType: 'CUSTOMER' | 'AGENT' | 'BOT' | 'SYSTEM';
  senderName: string;
  senderId?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'audio' | 'none';
  templateId?: string;
  deliveryStatus: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  errorCode?: string;
  wabaMessageId?: string;
  whatsapp_message_id?: string;
  timestamp: string;
  isInternalNote?: boolean;
}

export interface ChatConversation {
  id: string;
  companyId: string;
  contactId: string;
  contactPhone: string;
  contactName: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  status: 'open' | 'pending' | 'closed' | 'OPEN' | 'PENDING' | 'RESOLVED';
  isBotHandled: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  tags: string[];
  createdAt: string;
}

export interface InternalNote {
  id: string;
  conversationId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface BotAutomationRule {
  id: string;
  companyId: string;
  priority: number;
  name: string;
  triggerType: 'EXACT' | 'CONTAINS' | 'STARTS_WITH' | 'REGEX';
  trigger_text?: string;
  response_text?: string;
  keywords: string[];
  caseSensitive: boolean;
  actionType: 'SEND_TEXT' | 'SEND_TEMPLATE' | 'HANDOFF_AGENT' | 'TAG_CONTACT';
  replyText?: string;
  templateId?: string;
  tagToAdd?: string;
  assignToAgentId?: string;
  isActive: boolean;
  status?: 'active' | 'inactive';
  hitCount: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug?: string;
  price?: number;
  monthlyPrice: number;
  billing_period?: 'monthly' | 'yearly' | 'custom';
  marketingCreditsQuota: number;
  utilityCreditsQuota: number;
  message_limit?: number;
  max_campaign_size?: number;
  contact_limit?: number;
  agent_limit?: number;
  agentSeatLimit: number;
  rateLimitRpm: number;
  features: string[] | Record<string, any>;
  status?: 'active' | 'inactive';
  overLimitAction: 'BLOCK' | 'GRACE_OVERAGE' | 'ALERT_ONLY';
}

export interface AuditLog {
  id: string;
  companyId: string;
  companyName: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  category: 'AUTH' | 'CREDIT' | 'CAMPAIGN' | 'API_CREDENTIAL' | 'IMPERSONATION' | 'COMPANY_LIFECYCLE' | 'WHATSAPP';
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface BackgroundJob {
  id: string;
  companyId: string;
  type: 'CAMPAIGN_DISPATCH' | 'WEBHOOK_EVENT_RETRY' | 'TEMPLATE_SYNC' | 'CREDIT_RECONCILIATION';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'RETRYING';
  progress: number;
  payloadDescription: string;
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AppSettings {
  enableAgents: boolean;
  showOnlyAssignedChats: boolean;
  webhookCallbackUrl: string;
  blacklistedPhoneNumbers: string;
  projectName: string;
  siteUrl: string;
  metaAppSecret?: string;
  metaAppId?: string;
}

export interface RegisterCompanyData {
  companyName: string;
  ownerName: string;
  email: string;
  mobile: string;
  address?: string;
  planId: string;
  rateLimitRpm: number;
  antiSpamEnabled: boolean;
  optOutKeywordsEnabled: boolean;
  blacklistedPhones?: string[];
  wabaMode: 'SANDBOX' | 'PRODUCTION';
}
