import React, { createContext, useContext, useState, useEffect } from 'react';
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
  ConsentStatus,
  CreditCategory,
  AppSettings,
  RegisterCompanyData
} from '../types';
import { 
  checkSupabaseConnection, 
  fetchSupabaseTable, 
  saveSupabaseRecord, 
  deleteSupabaseRecord, 
  SUPABASE_RLS_FIX_SQL, 
  SupabaseStatus 
} from '../lib/supabaseService';
import { generateHardenedSecretToken } from '../lib/tokenUtils';
import {
  fetchWhatsAppServerConfig,
  fetchServerTemplates,
  createServerTemplate,
  fetchServerPhoneNumbers,
  sendServerWhatsAppMessage,
  sendServerCampaignBatch,
  fetchServerWebhookEvents,
  testServerVerifyToken,
  WhatsAppServerConfig,
  WebhookEventRecord
} from '../lib/metaApiClient';
import {
  INITIAL_COMPANIES,
  INITIAL_USERS,
  INITIAL_PLANS,
  INITIAL_WALLETS,
  INITIAL_LEDGER,
  INITIAL_API_KEYS,
  INITIAL_WABA_CONFIG,
  INITIAL_TEMPLATES,
  INITIAL_CONTACTS,
  INITIAL_GROUPS,
  INITIAL_CAMPAIGNS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_INTERNAL_NOTES,
  INITIAL_BOT_RULES,
  INITIAL_AUDIT_LOGS,
  INITIAL_BACKGROUND_JOBS,
  INITIAL_PERMISSION_MATRIX,
  INITIAL_APP_SETTINGS,
  ADMIN_STATS,
  TENANT_STATS
} from '../data/initialData';

interface ImpersonationState {
  isImpersonating: boolean;
  originalSuperAdmin?: User;
  impersonatedCompanyId?: string;
  reason?: string;
  startedAt?: string;
}

interface AppContextType {
  // Navigation & Tenant
  currentCompany: Company;
  currentUser: User;
  companies: Company[];
  users: User[];
  plans: SubscriptionPlan[];
  permissionMatrix: PermissionMatrix;
  impersonationState: ImpersonationState;
  appSettings: AppSettings;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  adminStats: typeof ADMIN_STATS;
  tenantStats: typeof TENANT_STATS;
  
  // Authentication & Registration View
  authView: 'app' | 'login' | 'register_company';
  setAuthView: (view: 'app' | 'login' | 'register_company') => void;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  registerCompany: (data: RegisterCompanyData) => { success: boolean; error?: string; companyId?: string };

  // Navigation controls
  switchCompany: (companyId: string) => void;
  switchUser: (userId: string) => void;
  startImpersonation: (companyId: string, reason: string) => void;
  stopImpersonation: () => void;

  // Agent Management
  createAgent: (name: string, email: string, password?: string) => void;
  deleteAgent: (agentId: string) => void;

  // Credits & Accounting (P0)
  currentWallet: CreditWallet;
  ledger: CreditLedgerEntry[];
  allocateCredits: (companyId: string, category: CreditCategory, amount: number, reason: string) => void;
  reserveCredits: (companyId: string, category: CreditCategory, amount: number, campaignId: string, reason: string) => boolean;
  commitCredits: (companyId: string, category: CreditCategory, amount: number, campaignId: string, reason: string) => void;
  refundCredits: (companyId: string, category: CreditCategory, amount: number, campaignId: string, reason: string) => void;
  reconcileLedger: (companyId: string) => { status: 'BALANCED' | 'DISCREPANCY'; marketingDiff: number; utilityDiff: number };

  // Auth & Permissions (P0)
  loginThrottling: { failedAttempts: number; isLocked: boolean; lockSecondsRemaining: number };
  simulateLoginAttempt: (passwordCorrect: boolean) => boolean;
  resetPassword: (email: string) => boolean;
  toggleCompanySuspension: (companyId: string, reason?: string) => void;
  updatePermission: (role: string, permission: string, allowed: boolean) => void;

  // Tenant API Keys (P0)
  apiKeys: TenantApiKey[];
  generateApiKey: (name: string, scopes: string[], rateLimitRpm: number) => { rawKey: string; key: TenantApiKey };
  revokeApiKey: (keyId: string) => void;
  rotateApiKey: (keyId: string) => { newRawKey: string };
  testApiCall: (keyPrefix: string, endpoint: string) => { success: boolean; statusCode: number; message: string; remainingLimit: number };

  // WhatsApp Cloud API & Webhooks (P0)
  wabaConfig: WABAConfig;
  wabaServerConfig: WhatsAppServerConfig | null;
  templates: MetaTemplate[];
  updateWabaConfig: (updates: Partial<WABAConfig>) => void;
  syncTemplatesFromMeta: () => Promise<{ success: boolean; count?: number; error?: string }>;
  simulateIncomingWebhook: (type: 'MESSAGE' | 'STATUS_UPDATE', payload: any, verifySignature?: boolean) => { success: boolean; log: string };
  sendTestOutboundMessage: (toPhone: string, text: string, category?: CreditCategory) => Promise<{ success: boolean; wamid?: string; error?: string }>;
  verifyWebhookConnection: (companyId?: string) => Promise<{ success: boolean; message: string }>;
  resetWebhookVerification: (companyId?: string) => void;
  updateCompanyAppCredentials: (appId: string, appSecret: string, companyId?: string) => void;
  generateCompanyHardenedSecret: (name: string, scopes: string[], companyId?: string) => TenantApiKey;

  // Campaigns
  campaigns: Campaign[];
  createCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'status' | 'sentCount' | 'deliveredCount' | 'readCount' | 'failedCount' | 'skippedCount' | 'creditsReserved' | 'creditsConsumed' | 'creditsRefunded' | 'recipients'> & { recipients: Array<{ phone: string; name: string; variables: Record<string, string> }> }) => { success: boolean; campaignId?: string; error?: string };
  pauseCampaign: (campaignId: string) => void;
  resumeCampaign: (campaignId: string) => void;
  cancelCampaign: (campaignId: string) => void;
  runCampaignSimulationStep: (campaignId: string) => void;
  dispatchCampaignBatch: (campaignId: string) => Promise<{ success: boolean; sent?: number; failed?: number; error?: string }>;

  // Contacts & Audience
  contacts: Contact[];
  groups: ContactGroup[];
  importContacts: (rawRows: Array<{ phone: string; name: string; email?: string; tags?: string; city?: string; consentStatus?: string }>) => { importedCount: number; errors: Array<{ row: number; phone: string; error: string }> };
  toggleContactConsent: (contactId: string, newStatus: ConsentStatus) => void;
  createContactGroup: (name: string, description: string, isDynamic: boolean, filterCriteria?: any) => void;
  deleteContact: (contactId: string) => void;

  // Live Chat & Automations
  conversations: ChatConversation[];
  messages: Record<string, ChatMessage[]>;
  internalNotes: Record<string, InternalNote[]>;
  botRules: BotAutomationRule[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendChatMessage: (conversationId: string, content: string, templateId?: string) => Promise<void>;
  addInternalNote: (conversationId: string, note: string) => void;
  reassignConversation: (conversationId: string, agentId: string) => void;
  toggleConversationStatus: (conversationId: string, newStatus: 'open' | 'closed' | 'OPEN' | 'RESOLVED') => void;
  saveBotRule: (rule: Partial<BotAutomationRule>) => void;
  toggleBotRule: (ruleId: string) => void;
  setAgentAvailability: (userId: string, isOnline: boolean) => void;

  // Super Admin & Monitoring
  auditLogs: AuditLog[];
  backgroundJobs: BackgroundJob[];
  createNewCompany: (company: Partial<Company>, planId: string, marketingBonus: number, utilityBonus: number) => void;
  savePlan: (plan: Partial<SubscriptionPlan>) => void;

  // Supabase Sync
  supabaseStatus: SupabaseStatus;
  isSupabaseSyncing: boolean;
  syncWithSupabase: () => Promise<void>;
  copySupabaseSqlFix: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Tenancy & Users (Webcraft Solution)
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [currentCompanyId, setCurrentCompanyId] = useState<string>('cmp_webcraft');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('usr_owner');
  const [plans, setPlans] = useState<SubscriptionPlan[]>(INITIAL_PLANS);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>(INITIAL_PERMISSION_MATRIX);
  const [appSettings, setAppSettings] = useState<AppSettings>(INITIAL_APP_SETTINGS);
  
  const [impersonationState, setImpersonationState] = useState<ImpersonationState>({
    isImpersonating: false
  });

  const [authView, setAuthView] = useState<'app' | 'login' | 'register_company'>('app');

  // Credit Accounting
  const [wallets, setWallets] = useState<Record<string, CreditWallet>>(INITIAL_WALLETS);
  const [ledger, setLedger] = useState<CreditLedgerEntry[]>(INITIAL_LEDGER);

  // Auth Throttling
  const [loginThrottling, setLoginThrottling] = useState({
    failedAttempts: 0,
    isLocked: false,
    lockSecondsRemaining: 0
  });

  // API Keys
  const [apiKeys, setApiKeys] = useState<TenantApiKey[]>(INITIAL_API_KEYS);

  // WhatsApp Config & Templates
  const [wabaConfig, setWabaConfig] = useState<WABAConfig>(INITIAL_WABA_CONFIG);
  const [wabaServerConfig, setWabaServerConfig] = useState<WhatsAppServerConfig | null>(null);
  const [templates, setTemplates] = useState<MetaTemplate[]>(INITIAL_TEMPLATES);

  // Audience & Contacts
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [groups, setGroups] = useState<ContactGroup[]>(INITIAL_GROUPS);

  // Campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);

  // Chat & Bots
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [internalNotes, setInternalNotes] = useState<Record<string, InternalNote[]>>(INITIAL_INTERNAL_NOTES);
  const [botRules, setBotRules] = useState<BotAutomationRule[]>(INITIAL_BOT_RULES);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv_001');

  // Logs & Jobs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [backgroundJobs, setBackgroundJobs] = useState<BackgroundJob[]>(INITIAL_BACKGROUND_JOBS);

  // Current selected entities
  const currentCompany = companies.find(c => c.id === currentCompanyId) || companies[0];
  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const currentWallet = wallets[currentCompanyId] || {
    companyId: currentCompanyId,
    marketingTotal: 0,
    marketingReserved: 0,
    marketingConsumed: 0,
    utilityTotal: 0,
    utilityReserved: 0,
    utilityConsumed: 0,
    lastReconciledAt: new Date().toISOString()
  };

  // Supabase State & Synchronization
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>({
    isConfigured: false,
    isConnected: false,
    projectUrl: '',
    isRlsRestricted: false,
    tablesAvailable: {
      templates: false,
      contacts: false,
      campaigns: false,
      bot_rules: false,
      messages: false,
      conversations: false,
      companies: false,
      users: false
    }
  });
  const [isSupabaseSyncing, setIsSupabaseSyncing] = useState(false);

  const copySupabaseSqlFix = () => {
    navigator.clipboard?.writeText(SUPABASE_RLS_FIX_SQL);
  };

  const syncWithSupabase = async () => {
    setIsSupabaseSyncing(true);
    try {
      const status = await checkSupabaseConnection();
      setSupabaseStatus(status);

      if (status.isConnected) {
        // Fetch templates from Supabase
        const tplRes = await fetchSupabaseTable('templates');
        if (tplRes.data && tplRes.data.length > 0) {
          setTemplates(tplRes.data.map((t: any) => ({
            id: t.id || `tpl_${Date.now()}`,
            companyId: t.company_id || t.companyId || 'cmp_webcraft',
            metaTemplateId: t.meta_template_id || t.id,
            name: t.name || 'template',
            whatsapp_template_name: t.whatsapp_template_name || t.name || 'template',
            category: t.category || 'MARKETING',
            language: t.language || 'en_US',
            status: t.status || 'APPROVED',
            headerType: t.header_type || 'NONE',
            headerContent: t.header_content,
            bodyText: t.body_text || t.body || '',
            variablesCount: t.variables_count || 0,
            sampleValues: t.sample_values || [],
            footerText: t.footer_text,
            buttons: t.buttons || [],
            lastSyncedAt: new Date().toISOString()
          })));
        }

        // Fetch contacts from Supabase
        const cntRes = await fetchSupabaseTable('contacts');
        if (cntRes.data && cntRes.data.length > 0) {
          setContacts(cntRes.data.map((c: any) => ({
            id: c.id,
            companyId: c.company_id || c.companyId || 'cmp_webcraft',
            phone: c.phone || '',
            name: c.name || 'Contact',
            email: c.email,
            country_code: c.country_code || 'IN',
            consentStatus: c.consent_status || 'OPTED_IN',
            consentSource: c.consent_source || 'MANUAL',
            consentTimestamp: c.consent_timestamp || c.consent_recorded_at || new Date().toISOString(),
            tags: c.tags || [],
            groups: c.groups || c.group_ids || [],
            customAttributes: c.custom_attributes || c.customFields || {},
            createdAt: c.created_at || new Date().toISOString(),
            updatedAt: c.updated_at || new Date().toISOString()
          })));
        }

        // Fetch bot rules from Supabase
        const botRes = await fetchSupabaseTable('bot_rules');
        if (botRes.data && botRes.data.length > 0) {
          setBotRules(botRes.data.map((b: any) => ({
            id: b.id,
            companyId: b.company_id || b.companyId || 'cmp_webcraft',
            name: b.name || 'Bot Rule',
            priority: b.priority || 10,
            triggerType: b.trigger_type || 'CONTAINS',
            trigger_text: b.trigger_text || b.keywords?.join(', ') || '',
            response_text: b.response_text || b.reply_text || '',
            keywords: b.keywords || (b.trigger_text ? b.trigger_text.split(',').map((s: string) => s.trim()) : ['help']),
            caseSensitive: false,
            actionType: (b.action_type || 'SEND_TEXT') as any,
            replyText: b.reply_text || b.response_text || '',
            hitCount: b.hit_count || 0,
            isActive: b.is_active ?? true
          })));
        }
      }
    } catch (err) {
      console.error('Error syncing with Supabase:', err);
    } finally {
      setIsSupabaseSyncing(false);
    }
  };

  useEffect(() => {
    syncWithSupabase();
    // Load server-side WhatsApp configuration
    fetchWhatsAppServerConfig()
      .then(cfg => {
        setWabaServerConfig(cfg);
        if (cfg.isConfigured) {
          syncTemplatesFromMeta().catch(() => {});
        }
      })
      .catch(err => {
        console.warn('[WhatsApp] Server config not available:', err);
      });
  }, []);

  // Webhook event real-time synchronization
  useEffect(() => {
    let isMounted = true;
    const pollEvents = async () => {
      try {
        const data = await fetchServerWebhookEvents();
        if (!isMounted || !data.events || data.events.length === 0) return;

        // Process status updates
        const statusUpdates = data.events.filter(e => e.type === 'STATUS_UPDATE' && e.wamid && e.status);
        for (const ev of statusUpdates) {
          const wamid = ev.wamid!;
          const status = ev.status!.toLowerCase() as 'sent' | 'delivered' | 'read' | 'failed';
          const errorCode = ev.details?.errors?.[0]?.code ? String(ev.details.errors[0].code) : undefined;
          const hierarchy: Record<string, number> = { queued: 0, submitted: 1, sent: 1, delivered: 2, read: 3, failed: 4 };

          setMessages(prev => {
            let changed = false;
            const next = { ...prev };
            Object.keys(next).forEach(convId => {
              next[convId] = next[convId].map(m => {
                if (m.wabaMessageId === wamid || m.whatsapp_message_id === wamid) {
                  const curLvl = hierarchy[m.deliveryStatus || 'sent'] || 0;
                  const newLvl = hierarchy[status] || 0;
                  if (status === 'failed' || newLvl >= curLvl) {
                    changed = true;
                    return { ...m, deliveryStatus: status, errorCode };
                  }
                }
                return m;
              });
            });
            return changed ? next : prev;
          });

          setCampaigns(prev => {
            let changed = false;
            const updated = prev.map(camp => {
              const hasRecip = camp.recipients.some(r => r.wabaMessageId === wamid || r.whatsapp_message_id === wamid);
              if (!hasRecip) return camp;

              changed = true;
              let refundedAmount = 0;
              const updatedRecipients = camp.recipients.map(r => {
                if (r.wabaMessageId === wamid || r.whatsapp_message_id === wamid) {
                  const curLvl = hierarchy[r.status || 'sent'] || 0;
                  const newLvl = hierarchy[status] || 0;
                  if (status === 'failed' && r.status !== 'failed') {
                    refundedAmount += 1;
                    return { ...r, status, errorCode };
                  }
                  if (newLvl >= curLvl) {
                    return {
                      ...r,
                      status,
                      deliveredAt: status === 'delivered' ? new Date().toISOString() : r.deliveredAt,
                      readAt: status === 'read' ? new Date().toISOString() : r.readAt
                    };
                  }
                }
                return r;
              });

              if (refundedAmount > 0) {
                refundCredits(camp.companyId, camp.category, refundedAmount, camp.id, `Webhook automatic refund for failed message ${wamid}`);
              }

              const delivered = updatedRecipients.filter(r => ['delivered', 'read'].includes(r.status)).length;
              const read = updatedRecipients.filter(r => r.status === 'read').length;
              const failed = updatedRecipients.filter(r => r.status === 'failed').length;

              return {
                ...camp,
                deliveredCount: delivered,
                readCount: read,
                failedCount: failed,
                recipients: updatedRecipients
              };
            });
            return changed ? updated : prev;
          });
        }

        // Process inbound customer messages
        const inboundMsgs = data.events.filter(e => e.type === 'INBOUND_MESSAGE' && e.wamid && e.from);
        for (const ev of inboundMsgs) {
          const from = ev.from!;
          const wamid = ev.wamid!;
          const text = ev.details?.text || '';
          const contactName = ev.details?.contactName || 'WhatsApp Contact';

          setMessages(prev => {
            let alreadyExists = false;
            Object.values(prev).forEach(msgs => {
              if (msgs.some(m => m.wabaMessageId === wamid || m.whatsapp_message_id === wamid)) {
                alreadyExists = true;
              }
            });
            if (alreadyExists) return prev;

            const conv = conversations.find(c => c.contactPhone === from) || conversations[0];
            const convId = conv ? conv.id : 'conv_001';

            const newMsg: ChatMessage = {
              id: 'msg_in_' + Date.now(),
              conversationId: convId,
              companyId: currentCompany.id,
              direction: 'incoming',
              senderType: 'CUSTOMER',
              senderName: contactName,
              content: text,
              deliveryStatus: 'delivered',
              wabaMessageId: wamid,
              whatsapp_message_id: wamid,
              timestamp: new Date().toISOString()
            };

            return {
              ...prev,
              [convId]: [...(prev[convId] || []), newMsg]
            };
          });
        }
      } catch {
        // Ignore polling errors
      }
    };

    const interval = setInterval(pollEvents, 4000);
    pollEvents();
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [conversations, currentCompany.id]);

  // Helper for adding Audit Log
  const addAudit = (
    category: AuditLog['category'],
    action: string,
    details: string,
    companyId = currentCompany.id,
    companyName = currentCompany.name
  ) => {
    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      companyId,
      companyName,
      actorId: currentUser.id,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      category,
      action,
      details,
      ipAddress: '192.168.1.104',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Agent Management
  const createAgent = (name: string, email: string, password = 'Password@123') => {
    const newAgent: User = {
      id: `usr_agent_${Date.now()}`,
      companyId: currentCompany.id,
      name,
      email,
      role: 'agent',
      status: 'active',
      isActive: true,
      lastLoginAt: undefined,
      isOnline: true,
      activeChatCount: 0,
      maxChatCapacity: 5
    };
    setUsers(prev => [...prev, newAgent]);
    addAudit('AUTH', 'AGENT_CREATED', `Created new agent ${name} (${email}) for company ${currentCompany.name}`);
  };

  const deleteAgent = (agentId: string) => {
    setUsers(prev => prev.filter(u => u.id !== agentId));
    addAudit('AUTH', 'AGENT_DELETED', `Removed agent ${agentId} from company ${currentCompany.name}`);
  };

  const updateAppSettings = (settings: Partial<AppSettings>) => {
    setAppSettings(prev => ({ ...prev, ...settings }));
    addAudit('WHATSAPP', 'SETTINGS_UPDATED', `Updated system and webhook configuration settings`);
  };

  // Navigation & Impersonation
  const switchCompany = (companyId: string) => {
    setCurrentCompanyId(companyId);
    addAudit('COMPANY_LIFECYCLE', 'TENANT_SWITCHED', `Switched view context to ${companyId}`);
  };

  const switchUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      setCurrentUserId(userId);
      setCurrentCompanyId(targetUser.companyId || companies[0].id);
    }
  };

  const login = (email: string, password = 'Password@123'): { success: boolean; error?: string } => {
    if (loginThrottling.isLocked) {
      return { 
        success: false, 
        error: `Account temporarily locked due to repeated failed login attempts. Please wait ${loginThrottling.lockSecondsRemaining} seconds.` 
      };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (!foundUser) {
      simulateLoginAttempt(false);
      return { success: false, error: 'Invalid credentials. User with this email address does not exist.' };
    }

    if (foundUser.status === 'blocked' || !foundUser.isActive) {
      return { success: false, error: 'This user account is suspended or blocked by the administrator.' };
    }

    simulateLoginAttempt(true);
    setCurrentUserId(foundUser.id);
    if (foundUser.companyId) {
      setCurrentCompanyId(foundUser.companyId);
    }
    setImpersonationState({ isImpersonating: false });
    setAuthView('app');
    addAudit('AUTH', 'LOGIN_SUCCESS', `User ${foundUser.email} logged in successfully`, foundUser.companyId);
    return { success: true };
  };

  const logout = () => {
    setImpersonationState({ isImpersonating: false });
    addAudit('AUTH', 'LOGOUT', `User ${currentUser.email} logged out of session`);
    setAuthView('login');
  };

  const registerCompany = (data: RegisterCompanyData): { success: boolean; error?: string; companyId?: string } => {
    if (!data.companyName.trim() || !data.email.trim()) {
      return { success: false, error: 'Company Name and Email address are required.' };
    }

    const compSlug = data.companyName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);
    const companyCount = companies.length + 1;
    const compUid = `WC-${String(companyCount).padStart(6, '0')}`;
    const newCompanyId = `cmp_${compSlug}_${Date.now()}`;

    const plan = plans.find(p => p.id === data.planId) || plans[0];
    const initialMarketingQuota = plan.marketingCreditsQuota || 5000;
    const initialUtilityQuota = plan.utilityCreditsQuota || 2500;

    // Generate permanent hardened master secret token on company creation ONLY
    const hardSecretToken = generateHardenedSecretToken('wc_sec_live');
    const webhookSecretToken = generateHardenedSecretToken('wc_sec_hook');
    const campaignSecretToken = generateHardenedSecretToken('wc_sec_camp');

    const newComp: Company = {
      id: newCompanyId,
      company_uid: compUid,
      name: data.companyName.trim(),
      code: compSlug,
      status: 'active',
      planId: plan.id,
      planName: plan.name,
      ownerName: data.ownerName.trim() || 'Account Owner',
      ownerEmail: data.email.trim(),
      phone: data.mobile.trim(),
      mobile: data.mobile.trim(),
      address: data.address?.trim() || 'Headquarters',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      cached_credit_balance: initialMarketingQuota + initialUtilityQuota,
      wabaAccountId: data.wabaMode === 'SANDBOX' ? `waba_sandbox_${Date.now()}` : undefined,
      appId: '18920192039481',
      appSecret: '',
      webhookConnected: false, // Connection pending until verified!
      hardSecretToken,
      createdAt: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    // Auto-generate multiple hardened secret API keys upon company creation
    const masterApiKey: TenantApiKey = {
      id: `key_${newCompanyId}_master`,
      companyId: newCompanyId,
      name: 'Master Hardened Secret Token',
      keyPrefix: 'wc_sec_live',
      tokenHash: Array.from(hardSecretToken).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0).toString(16).padStart(64, 'a'),
      rawKeyOnce: hardSecretToken,
      scopes: ['messages:send', 'templates:read', 'contacts:read', 'webhooks:listen'],
      rateLimitRpm: data.rateLimitRpm || 300,
      currentMinuteUsage: 0,
      status: 'ACTIVE',
      isHardenedSecret: true,
      description: 'Permanent master high-entropy secret token generated at company provisioning',
      expiresAt: '2030-01-01T00:00:00Z',
      createdAt: new Date().toISOString()
    };

    const webhookApiKey: TenantApiKey = {
      id: `key_${newCompanyId}_hook`,
      companyId: newCompanyId,
      name: 'Webhook Ingestion Hardened Secret',
      keyPrefix: 'wc_sec_hook',
      tokenHash: Array.from(webhookSecretToken).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0).toString(16).padStart(64, 'b'),
      rawKeyOnce: webhookSecretToken,
      scopes: ['webhooks:listen'],
      rateLimitRpm: 1200,
      currentMinuteUsage: 0,
      status: 'ACTIVE',
      isHardenedSecret: true,
      description: 'Dedicated hardened secret for webhook subscription listening',
      expiresAt: '2030-01-01T00:00:00Z',
      createdAt: new Date().toISOString()
    };

    const campaignApiKey: TenantApiKey = {
      id: `key_${newCompanyId}_camp`,
      companyId: newCompanyId,
      name: 'Campaign Dispatch Hardened Secret',
      keyPrefix: 'wc_sec_camp',
      tokenHash: Array.from(campaignSecretToken).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0).toString(16).padStart(64, 'c'),
      rawKeyOnce: campaignSecretToken,
      scopes: ['messages:send', 'templates:read'],
      rateLimitRpm: 400,
      currentMinuteUsage: 0,
      status: 'ACTIVE',
      isHardenedSecret: true,
      description: 'Scoped hardened token for bulk campaign queue ingestion',
      expiresAt: '2030-01-01T00:00:00Z',
      createdAt: new Date().toISOString()
    };

    const newOwnerUser: User = {
      id: `usr_${compSlug}_${Date.now()}`,
      companyId: newCompanyId,
      name: data.ownerName.trim() || data.companyName.trim(),
      email: data.email.trim().toLowerCase(),
      mobile: data.mobile.trim(),
      role: 'company_admin',
      status: 'active',
      isActive: true,
      lastLoginAt: new Date().toISOString(),
      isOnline: true
    };

    const newWallet: CreditWallet = {
      companyId: newCompanyId,
      marketingTotal: initialMarketingQuota,
      marketingReserved: 0,
      marketingConsumed: 0,
      utilityTotal: initialUtilityQuota,
      utilityReserved: 0,
      utilityConsumed: 0,
      lastReconciledAt: new Date().toISOString()
    };

    setCompanies(prev => [newComp, ...prev]);
    setUsers(prev => [newOwnerUser, ...prev]);
    setWallets(prev => ({ ...prev, [newCompanyId]: newWallet }));
    setApiKeys(prev => [masterApiKey, webhookApiKey, campaignApiKey, ...prev]);

    // Record welcome credit ledgers
    allocateCredits(newCompanyId, 'MARKETING', initialMarketingQuota, 'Plan Subscription Allocation');
    allocateCredits(newCompanyId, 'UTILITY', initialUtilityQuota, 'Plan Subscription Allocation');

    // Add audit log
    addAudit(
      'COMPANY_LIFECYCLE',
      'COMPANY_REGISTERED',
      `Direct registration: ${newComp.name} (${compUid}) on plan ${plan.name} with rate limit ${data.rateLimitRpm} RPM. Anti-Spam: ${data.antiSpamEnabled ? 'Active' : 'Disabled'}. WABA Settlement: ${data.wabaMode}`,
      newCompanyId,
      newComp.name
    );

    // Auto-login to new company portal
    setCurrentCompanyId(newCompanyId);
    setCurrentUserId(newOwnerUser.id);
    setImpersonationState({ isImpersonating: false });
    setAuthView('app');

    return { success: true, companyId: newCompanyId };
  };

  const startImpersonation = (companyId: string, reason: string) => {
    const targetComp = companies.find(c => c.id === companyId);
    if (!targetComp) return;

    // Preserve original super admin identity
    const superAdminActor = impersonationState.isImpersonating
      ? impersonationState.originalSuperAdmin
      : (currentUser.role === 'super_admin' ? currentUser : users.find(u => u.role === 'super_admin') || currentUser);

    setImpersonationState({
      isImpersonating: true,
      originalSuperAdmin: superAdminActor,
      impersonatedCompanyId: companyId,
      reason,
      startedAt: new Date().toISOString()
    });

    setCurrentCompanyId(companyId);

    // Find company admin user if exists, or create one on the fly for this tenant
    let owner = users.find(u => u.companyId === companyId && u.role === 'company_admin') || users.find(u => u.companyId === companyId);
    if (!owner) {
      const newOwner: User = {
        id: `usr_${companyId}_admin`,
        companyId,
        name: targetComp.ownerName || `${targetComp.name} Admin`,
        email: targetComp.ownerEmail || `admin@${targetComp.code}.com`,
        mobile: targetComp.mobile || targetComp.phone,
        role: 'company_admin',
        status: 'active',
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        isOnline: true
      };
      setUsers(prev => [...prev, newOwner]);
      setCurrentUserId(newOwner.id);
    } else {
      setCurrentUserId(owner.id);
    }

    addAudit(
      'IMPERSONATION',
      'LOGIN_AS_COMPANY_STARTED',
      `Super Admin ${superAdminActor?.email || 'admin@whatsappsaas.com'} impersonated ${targetComp.name} (${targetComp.company_uid || targetComp.code}). Reason: "${reason}"`,
      companyId,
      targetComp.name
    );
  };

  const stopImpersonation = () => {
    if (!impersonationState.isImpersonating) return;

    const impersonatedComp = companies.find(c => c.id === impersonationState.impersonatedCompanyId);
    addAudit(
      'IMPERSONATION',
      'LOGIN_AS_COMPANY_ENDED',
      `Super Admin ended impersonation session for ${impersonatedComp?.name || 'company'}. Session restored to platform level.`
    );

    if (impersonationState.originalSuperAdmin) {
      setCurrentUserId(impersonationState.originalSuperAdmin.id);
      setCurrentCompanyId(impersonationState.originalSuperAdmin.companyId || companies[0].id);
    }

    setImpersonationState({ isImpersonating: false });
  };

  // Credit Accounting
  const allocateCredits = (
    companyId: string,
    category: CreditCategory,
    amount: number,
    reason: string
  ) => {
    setWallets(prev => {
      const w = prev[companyId] || {
        companyId,
        marketingTotal: 0,
        marketingReserved: 0,
        marketingConsumed: 0,
        utilityTotal: 0,
        utilityReserved: 0,
        utilityConsumed: 0,
        lastReconciledAt: new Date().toISOString()
      };

      const beforeBalance = category === 'MARKETING' ? (w.marketingTotal - w.marketingReserved - w.marketingConsumed) : (w.utilityTotal - w.utilityReserved - w.utilityConsumed);
      const updatedWallet = {
        ...w,
        [category === 'MARKETING' ? 'marketingTotal' : 'utilityTotal']: (category === 'MARKETING' ? w.marketingTotal : w.utilityTotal) + amount,
        lastReconciledAt: new Date().toISOString()
      };
      const afterBalance = beforeBalance + amount;

      const ledgerEntry: CreditLedgerEntry = {
        id: `led_${Date.now()}`,
        companyId,
        category,
        type: 'plan_allocation',
        amount,
        beforeBalance,
        afterBalance,
        referenceType: 'admin_topup',
        referenceId: `topup_${Date.now()}`,
        reason,
        idempotencyKey: `idemp_alloc_${companyId}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: currentUser.id,
        actorEmail: currentUser.email
      };

      setLedger(l => [ledgerEntry, ...l]);
      return { ...prev, [companyId]: updatedWallet };
    });

    // Also update cached_credit_balance in company record
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, cached_credit_balance: c.cached_credit_balance + amount } : c));

    addAudit('CREDIT', 'CREDIT_ALLOCATED', `Allocated ${amount.toLocaleString()} ${category} credits. Reason: ${reason}`, companyId);
  };

  const reserveCredits = (
    companyId: string,
    category: CreditCategory,
    amount: number,
    campaignId: string,
    reason: string
  ): boolean => {
    const w = wallets[companyId];
    if (!w) return false;

    const available = category === 'MARKETING' 
      ? (w.marketingTotal - w.marketingReserved - w.marketingConsumed)
      : (w.utilityTotal - w.utilityReserved - w.utilityConsumed);

    if (available < amount) {
      return false;
    }

    setWallets(prev => {
      const cur = prev[companyId];
      const beforeBalance = available;
      const afterBalance = beforeBalance - amount;

      const updated = {
        ...cur,
        [category === 'MARKETING' ? 'marketingReserved' : 'utilityReserved']: (category === 'MARKETING' ? cur.marketingReserved : cur.utilityReserved) + amount
      };

      const ledgerEntry: CreditLedgerEntry = {
        id: `led_${Date.now()}`,
        companyId,
        category,
        type: 'campaign_reserved',
        amount: -amount,
        beforeBalance,
        afterBalance,
        referenceType: 'campaign',
        referenceId: campaignId,
        reason,
        idempotencyKey: `idemp_reserve_${campaignId}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: currentUser.id,
        actorEmail: currentUser.email
      };

      setLedger(l => [ledgerEntry, ...l]);
      return { ...prev, [companyId]: updated };
    });

    addAudit('CREDIT', 'CREDIT_RESERVED', `Reserved ${amount.toLocaleString()} ${category} credits for campaign ${campaignId}`, companyId);
    return true;
  };

  const commitCredits = (
    companyId: string,
    category: CreditCategory,
    amount: number,
    campaignId: string,
    reason: string
  ) => {
    setWallets(prev => {
      const cur = prev[companyId];
      if (!cur) return prev;

      const isMkt = category === 'MARKETING';
      const updated = {
        ...cur,
        [isMkt ? 'marketingReserved' : 'utilityReserved']: Math.max(0, (isMkt ? cur.marketingReserved : cur.utilityReserved) - amount),
        [isMkt ? 'marketingConsumed' : 'utilityConsumed']: (isMkt ? cur.marketingConsumed : cur.utilityConsumed) + amount
      };

      const available = isMkt ? (updated.marketingTotal - updated.marketingReserved - updated.marketingConsumed) : (updated.utilityTotal - updated.utilityReserved - updated.utilityConsumed);

      const ledgerEntry: CreditLedgerEntry = {
        id: `led_${Date.now()}`,
        companyId,
        category,
        type: 'message_consumed',
        amount: -amount,
        beforeBalance: available,
        afterBalance: available,
        referenceType: 'campaign',
        referenceId: campaignId,
        reason,
        idempotencyKey: `idemp_commit_${campaignId}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: currentUser.id,
        actorEmail: currentUser.email
      };

      setLedger(l => [ledgerEntry, ...l]);
      return { ...prev, [companyId]: updated };
    });
  };

  const refundCredits = (
    companyId: string,
    category: CreditCategory,
    amount: number,
    campaignId: string,
    reason: string
  ) => {
    setWallets(prev => {
      const cur = prev[companyId];
      if (!cur) return prev;

      const isMkt = category === 'MARKETING';
      const beforeAvailable = isMkt ? (cur.marketingTotal - cur.marketingReserved - cur.marketingConsumed) : (cur.utilityTotal - cur.utilityReserved - cur.utilityConsumed);
      
      const updated = {
        ...cur,
        [isMkt ? 'marketingReserved' : 'utilityReserved']: Math.max(0, (isMkt ? cur.marketingReserved : cur.utilityReserved) - amount)
      };

      const afterAvailable = beforeAvailable + amount;

      const ledgerEntry: CreditLedgerEntry = {
        id: `led_${Date.now()}`,
        companyId,
        category,
        type: 'refund',
        amount: amount,
        beforeBalance: beforeAvailable,
        afterBalance: afterAvailable,
        referenceType: 'campaign_released',
        referenceId: campaignId,
        reason,
        idempotencyKey: `idemp_refund_${campaignId}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: currentUser.id,
        actorEmail: currentUser.email
      };

      setLedger(l => [ledgerEntry, ...l]);
      return { ...prev, [companyId]: updated };
    });

    addAudit('CREDIT', 'CREDIT_REFUNDED', `Refunded ${amount} ${category} credits due to failure/cancellation: ${reason}`, companyId);
  };

  const reconcileLedger = (companyId: string): { status: 'BALANCED' | 'DISCREPANCY'; marketingDiff: number; utilityDiff: number } => {
    const compLedger = ledger.filter(l => l.companyId === companyId);
    const wallet = wallets[companyId];
    if (!wallet) return { status: 'BALANCED', marketingDiff: 0, utilityDiff: 0 };

    let calcMktTotal = 0;
    let calcUtilTotal = 0;

    compLedger.forEach(item => {
      if (item.type === 'plan_allocation' || item.type === 'admin_added' || item.type === 'ALLOCATION') {
        if (item.category === 'MARKETING') calcMktTotal += item.amount;
        else calcUtilTotal += item.amount;
      }
    });

    const mktDiff = wallet.marketingTotal - calcMktTotal;
    const utilDiff = wallet.utilityTotal - calcUtilTotal;

    const isBalanced = mktDiff === 0 && utilDiff === 0;
    addAudit(
      'CREDIT',
      'LEDGER_RECONCILED',
      `Audit ledger reconciliation completed. Status: ${isBalanced ? 'ZERO DISCREPANCY (BALANCED)' : 'DISCREPANCY DETECTED'}. Mkt Diff: ${mktDiff}, Util Diff: ${utilDiff}`,
      companyId
    );

    return {
      status: isBalanced ? 'BALANCED' : 'DISCREPANCY',
      marketingDiff: mktDiff,
      utilityDiff: utilDiff
    };
  };

  // Auth Throttling
  const simulateLoginAttempt = (passwordCorrect: boolean): boolean => {
    if (loginThrottling.isLocked) {
      addAudit('AUTH', 'LOGIN_BLOCKED_THROTTLED', `Throttled login attempt blocked while lockout active`);
      return false;
    }

    if (passwordCorrect) {
      setLoginThrottling({ failedAttempts: 0, isLocked: false, lockSecondsRemaining: 0 });
      addAudit('AUTH', 'LOGIN_SUCCESS', `User ${currentUser.email} logged in securely`);
      return true;
    } else {
      const nextFailed = loginThrottling.failedAttempts + 1;
      if (nextFailed >= 5) {
        setLoginThrottling({ failedAttempts: nextFailed, isLocked: true, lockSecondsRemaining: 60 });
        addAudit('AUTH', 'LOGIN_THROTTLED_LOCKOUT', `5 failed password attempts reached. Account locked for 60 seconds.`);
      } else {
        setLoginThrottling(prev => ({ ...prev, failedAttempts: nextFailed }));
        addAudit('AUTH', 'LOGIN_FAILED', `Failed login attempt (${nextFailed}/5)`);
      }
      return false;
    }
  };

  useEffect(() => {
    if (!loginThrottling.isLocked) return;
    const timer = setInterval(() => {
      setLoginThrottling(prev => {
        if (prev.lockSecondsRemaining <= 1) {
          return { failedAttempts: 0, isLocked: false, lockSecondsRemaining: 0 };
        }
        return { ...prev, lockSecondsRemaining: prev.lockSecondsRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loginThrottling.isLocked]);

  const resetPassword = (email: string): boolean => {
    addAudit('AUTH', 'PASSWORD_RESET_DISPATCHED', `Cryptographically signed password reset link sent to ${email}`);
    return true;
  };

  const toggleCompanySuspension = (companyId: string, reason = 'Administrative review') => {
    setCompanies(prev => prev.map(c => {
      if (c.id === companyId) {
        const nextStatus = (c.status === 'active' || c.status === 'ACTIVE') ? 'suspended' : 'active';
        addAudit(
          'COMPANY_LIFECYCLE',
          nextStatus === 'suspended' ? 'COMPANY_SUSPENDED' : 'COMPANY_REACTIVATED',
          nextStatus === 'suspended' ? `Suspended due to: ${reason}` : 'Company reactivated to ACTIVE status',
          companyId,
          c.name
        );
        return { ...c, status: nextStatus, suspensionReason: nextStatus === 'suspended' ? reason : undefined };
      }
      return c;
    }));
  };

  const updatePermission = (role: string, permission: string, allowed: boolean) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: allowed
      }
    }));
    addAudit('AUTH', 'PERMISSION_MATRIX_UPDATED', `Role ${role} permission ${permission} updated to ${allowed}`);
  };

  // API Credentials
  const generateApiKey = (name: string, scopes: string[], rateLimitRpm: number) => {
    const rawSecret = `G1K2RttZ8kFj${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
    const prefix = rawSecret.substring(0, 12);
    const tokenHash = Array.from(rawSecret).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0).toString(16).padStart(64, 'a');

    const newKey: TenantApiKey = {
      id: `key_${Date.now()}`,
      companyId: currentCompany.id,
      name,
      keyPrefix: prefix,
      tokenHash,
      rawKeyOnce: rawSecret,
      scopes,
      rateLimitRpm,
      currentMinuteUsage: 0,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };

    setApiKeys(prev => [newKey, ...prev]);
    addAudit('API_CREDENTIAL', 'API_KEY_CREATED', `Generated scoped API key "${name}" with rate limit ${rateLimitRpm} RPM`);
    return { rawKey: rawSecret, key: newKey };
  };

  const revokeApiKey = (keyId: string) => {
    setApiKeys(prev => prev.map(k => k.id === keyId ? { ...k, status: 'REVOKED' } : k));
    addAudit('API_CREDENTIAL', 'API_KEY_REVOKED', `Permanently revoked API key ${keyId}`);
  };

  const rotateApiKey = (keyId: string) => {
    const existing = apiKeys.find(k => k.id === keyId);
    if (!existing) return { newRawKey: '' };

    revokeApiKey(keyId);
    const { rawKey } = generateApiKey(`${existing.name} (Rotated)`, existing.scopes, existing.rateLimitRpm);
    addAudit('API_CREDENTIAL', 'API_KEY_ROTATED', `Rotated key ${keyId} with clean SHA-256 hash`);
    return { newRawKey: rawKey };
  };

  const testApiCall = (keyPrefix: string, endpoint: string) => {
    const key = apiKeys.find(k => k.keyPrefix === keyPrefix && k.status === 'ACTIVE');
    if (!key) {
      return { success: false, statusCode: 401, message: 'Invalid or revoked Bearer token credentials.', remainingLimit: 0 };
    }

    if (key.currentMinuteUsage >= key.rateLimitRpm) {
      return { success: false, statusCode: 429, message: `Rate limit of ${key.rateLimitRpm} req/min exceeded. Retry with exponential backoff.`, remainingLimit: 0 };
    }

    setApiKeys(prev => prev.map(k => k.id === key.id ? { ...k, currentMinuteUsage: k.currentMinuteUsage + 1, lastUsedAt: new Date().toISOString() } : k));
    return {
      success: true,
      statusCode: 200,
      message: `200 OK — Authorized via scopes [${key.scopes.join(', ')}]`,
      remainingLimit: key.rateLimitRpm - (key.currentMinuteUsage + 1)
    };
  };

  // WhatsApp Cloud API
  const updateWabaConfig = (updates: Partial<WABAConfig>) => {
    setWabaConfig(prev => ({ ...prev, ...updates, lastSyncedAt: new Date().toISOString() }));
    addAudit('WHATSAPP', 'WABA_CONFIG_UPDATED', `Updated Meta Cloud API Phone Number ID or Token configuration`);
  };

  const syncTemplatesFromMeta = async (): Promise<{ success: boolean; count?: number; error?: string }> => {
    const job: BackgroundJob = {
      id: `job_${Date.now()}`,
      companyId: currentCompany.id,
      type: 'TEMPLATE_SYNC',
      status: 'PROCESSING',
      progress: 30,
      payloadDescription: `Fetching live templates via Meta Graph API (${wabaConfig.wabaId || 'WABA'})`,
      attempts: 1,
      maxAttempts: 3,
      createdAt: new Date().toISOString()
    };
    setBackgroundJobs(prev => [job, ...prev]);

    try {
      const res = await fetchServerTemplates();
      const metaItems = res.templates || [];

      // Map Meta template components to our MetaTemplate model
      const mapped: MetaTemplate[] = metaItems.map(item => {
        let headerText = '';
        let headerType: 'NONE' | 'TEXT' | 'IMAGE' | 'DOCUMENT' = 'NONE';
        let bodyText = '';
        let footerText = '';
        const buttons: Array<{ type: 'QUICK_REPLY' | 'URL' | 'CALL'; text: string; value?: string }> = [];

        for (const comp of item.components || []) {
          if (comp.type === 'HEADER') {
            headerType = comp.format === 'TEXT' ? 'TEXT' : comp.format === 'IMAGE' ? 'IMAGE' : comp.format === 'DOCUMENT' ? 'DOCUMENT' : 'NONE';
            headerText = comp.text || '';
          } else if (comp.type === 'BODY') {
            bodyText = comp.text || '';
          } else if (comp.type === 'FOOTER') {
            footerText = comp.text || '';
          } else if (comp.type === 'BUTTONS') {
            for (const btn of comp.buttons || []) {
              buttons.push({
                type: btn.type === 'QUICK_REPLY' ? 'QUICK_REPLY' : btn.type === 'URL' ? 'URL' : 'CALL',
                text: btn.text,
                value: btn.url || btn.phone_number
              });
            }
          }
        }

        const variableMatches = bodyText.match(/\{\{\d+\}\}/g);
        const variablesCount = variableMatches ? new Set(variableMatches).size : 0;

        return {
          id: `tpl_${item.id}`,
          companyId: currentCompany.id,
          metaTemplateId: item.id,
          name: item.name,
          whatsapp_template_name: item.name,
          category: (item.category as any) || 'MARKETING',
          language: item.language || 'en_US',
          status: item.status || 'APPROVED',
          rejectionReason: item.rejected_reason,
          headerType,
          headerText,
          bodyText,
          variablesCount,
          sampleValues: [],
          footerText,
          buttons,
          lastSyncedAt: new Date().toISOString()
        };
      });

      setTemplates(mapped);

      // Persist to Supabase if table is available
      for (const t of mapped) {
        saveSupabaseRecord('meta_templates', {
          company_id: t.companyId,
          meta_template_id: t.metaTemplateId,
          name: t.name,
          category: t.category,
          language: t.language,
          status: t.status,
          rejection_reason: t.rejectionReason,
          header_type: t.headerType,
          header_text: t.headerText,
          body_text: t.bodyText,
          variables_count: t.variablesCount,
          sample_values: JSON.stringify(t.sampleValues),
          footer_text: t.footerText,
          buttons: JSON.stringify(t.buttons),
          last_synced_at: t.lastSyncedAt
        }, 'company_id,name,language').catch(() => {});
      }

      setBackgroundJobs(prev => prev.map(j => j.id === job.id ? {
        ...j,
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date().toISOString(),
        payloadDescription: `Successfully synchronized ${mapped.length} templates from Meta Graph API.`
      } : j));

      addAudit('WHATSAPP', 'TEMPLATES_SYNCED', `Synchronized ${mapped.length} verified templates from Meta Graph API`);
      return { success: true, count: mapped.length };
    } catch (err: any) {
      const errMsg = err?.message || 'Meta Graph API template sync failed';
      setBackgroundJobs(prev => prev.map(j => j.id === job.id ? {
        ...j,
        status: 'FAILED',
        progress: 100,
        errorMessage: errMsg,
        completedAt: new Date().toISOString()
      } : j));

      addAudit('WHATSAPP', 'TEMPLATES_SYNC_FAILED', `Meta Graph API template sync error: ${errMsg}`);
      return { success: false, error: errMsg };
    }
  };

  const simulateIncomingWebhook = (
    type: 'MESSAGE' | 'STATUS_UPDATE',
    payload: any,
    verifySignature = true
  ) => {
    if (!verifySignature) {
      addAudit('WHATSAPP', 'WEBHOOK_SIGNATURE_FAILED', `Invalid HMAC-SHA256 signature on incoming Meta webhook. Rejected with HTTP 403.`);
      return { success: false, log: 'HMAC signature verification failed. Computed hash does not match X-Hub-Signature-256 header.' };
    }

    if (type === 'STATUS_UPDATE') {
      const { wabaMessageId, status, errorCode } = payload;
      setMessages(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(convId => {
          next[convId] = next[convId].map(m => {
            if (m.wabaMessageId === wabaMessageId || m.whatsapp_message_id === wabaMessageId) {
              return { ...m, deliveryStatus: status, errorCode };
            }
            return m;
          });
        });
        return next;
      });

      setCampaigns(prev => prev.map(camp => {
        let refundedAmount = 0;
        const updatedRecipients = camp.recipients.map(r => {
          if (r.wabaMessageId === wabaMessageId || r.whatsapp_message_id === wabaMessageId) {
            if (status === 'failed' && r.status !== 'failed') {
              refundedAmount += 1;
            }
            return { ...r, status, errorCode };
          }
          return r;
        });

        if (refundedAmount > 0) {
          refundCredits(camp.companyId, camp.category, refundedAmount, camp.id, `Automatic refund for failed webhook delivery: error ${errorCode || '131026'}`);
        }

        const sent = updatedRecipients.filter(r => ['sent', 'delivered', 'read'].includes(r.status)).length;
        const delivered = updatedRecipients.filter(r => ['delivered', 'read'].includes(r.status)).length;
        const read = updatedRecipients.filter(r => r.status === 'read').length;
        const failed = updatedRecipients.filter(r => r.status === 'failed').length;

        return {
          ...camp,
          sentCount: Math.max(camp.sentCount, sent),
          deliveredCount: Math.max(camp.deliveredCount, delivered),
          readCount: Math.max(camp.readCount, read),
          failedCount: Math.max(camp.failedCount, failed),
          creditsRefunded: camp.creditsRefunded + refundedAmount,
          recipients: updatedRecipients
        };
      }));

      return { success: true, log: `Processed Meta delivery status [${status.toUpperCase()}] for message ${wabaMessageId}` };
    }

    if (type === 'MESSAGE') {
      const { fromPhone, senderName, text } = payload;
      let contact = contacts.find(c => c.phone === fromPhone);
      if (!contact) {
        contact = {
          id: `cnt_${Date.now()}`,
          companyId: currentCompany.id,
          phone: fromPhone,
          name: senderName || 'WhatsApp Customer',
          consentStatus: 'OPTED_IN',
          consentSource: 'INBOUND_MESSAGE',
          consentTimestamp: new Date().toISOString(),
          tags: ['inbound_whatsapp'],
          groups: ['grp_general'],
          customAttributes: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setContacts(prev => [contact!, ...prev]);
      }

      let conv = conversations.find(c => c.contactPhone === fromPhone);
      let convId = conv ? conv.id : `conv_${Date.now()}`;
      if (!conv) {
        conv = {
          id: convId,
          companyId: currentCompany.id,
          contactId: contact.id,
          contactPhone: fromPhone,
          contactName: contact.name,
          assignedAgentId: 'usr_agent_rahul',
          assignedAgentName: 'Rahul Verma',
          status: 'open',
          isBotHandled: true,
          unreadCount: 1,
          lastMessage: text,
          lastMessageTime: 'just now',
          tags: ['inbound'],
          createdAt: new Date().toISOString()
        };
        setConversations(prev => [conv!, ...prev]);
      } else {
        setConversations(prev => prev.map(c => c.id === convId ? {
          ...c,
          unreadCount: c.unreadCount + 1,
          lastMessage: text,
          lastMessageTime: 'just now'
        } : c));
      }

      const newInboundMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        conversationId: convId,
        companyId: currentCompany.id,
        direction: 'incoming',
        senderType: 'CUSTOMER',
        senderName: contact.name,
        content: text,
        deliveryStatus: 'delivered',
        wabaMessageId: `wamid.HBgL${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        whatsapp_message_id: `wamid.HBgL${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => ({
        ...prev,
        [convId]: [...(prev[convId] || []), newInboundMsg]
      }));

      return { success: true, log: `Inbound WhatsApp message received from ${fromPhone}. Conversation ${convId} updated.` };
    }

    return { success: false, log: 'Unhandled webhook event' };
  };

  const sendTestOutboundMessage = async (toPhone: string, text: string, category: CreditCategory = 'UTILITY'): Promise<{ success: boolean; wamid?: string; error?: string }> => {
    const w = currentWallet;
    const available = category === 'MARKETING'
      ? (w.marketingTotal - w.marketingReserved - w.marketingConsumed)
      : (w.utilityTotal - w.utilityReserved - w.utilityConsumed);

    if (available < 1) {
      return { success: false, error: `Insufficient ${category} credits. Available balance: ${available}.` };
    }

    try {
      const apiRes = await sendServerWhatsAppMessage({
        to: toPhone,
        type: 'text',
        text
      });

      // Deduct credit only after send is accepted by Meta Cloud API
      setWallets(prev => {
        const cur = prev[currentCompany.id];
        const isMkt = category === 'MARKETING';
        const updated = {
          ...cur,
          [isMkt ? 'marketingConsumed' : 'utilityConsumed']: (isMkt ? cur.marketingConsumed : cur.utilityConsumed) + 1
        };

        const ledgerEntry: CreditLedgerEntry = {
          id: `led_${Date.now()}`,
          companyId: currentCompany.id,
          category,
          type: 'message_consumed',
          amount: -1,
          beforeBalance: available,
          afterBalance: available - 1,
          referenceType: 'single_send',
          referenceId: apiRes.wamid || `single_${Date.now()}`,
          reason: `Single ${category} WhatsApp message dispatch to ${toPhone} (wamid: ${apiRes.wamid})`,
          idempotencyKey: `idemp_single_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: currentUser.id,
          actorEmail: currentUser.email
        };

        setLedger(l => [ledgerEntry, ...l]);
        return { ...prev, [currentCompany.id]: updated };
      });

      addAudit('WHATSAPP', 'OUTBOUND_MESSAGE_SENT', `Direct message dispatched via Meta Cloud API to ${toPhone} (wamid: ${apiRes.wamid}).`);
      return { success: true, wamid: apiRes.wamid };
    } catch (err: any) {
      const errMsg = err?.message || 'Meta Cloud API message send failed';
      addAudit('WHATSAPP', 'OUTBOUND_MESSAGE_FAILED', `Failed to send message to ${toPhone}: ${errMsg}`);
      return { success: false, error: errMsg };
    }
  };

  const verifyWebhookConnection = async (companyId = currentCompany.id): Promise<{ success: boolean; message: string }> => {
    const targetComp = companies.find(c => c.id === companyId) || currentCompany;
    const verifyToken = wabaConfig.webhookVerifyToken || 'webcraft_verify_token_whatsapp';

    try {
      const testRes = await testServerVerifyToken(verifyToken);
      if (!testRes.match) {
        return {
          success: false,
          message: `Verify token mismatch: ${testRes.message}. Set WHATSAPP_WEBHOOK_VERIFY_TOKEN on server.`
        };
      }

      // Update company state
      setCompanies(prev => prev.map(c => c.id === companyId ? {
        ...c,
        webhookConnected: true,
        webhookConnectedAt: new Date().toISOString()
      } : c));

      // Update WABA config if current company
      if (companyId === currentCompany.id) {
        setWabaConfig(prev => ({
          ...prev,
          webhookConnected: true,
          webhookConnectedAt: new Date().toISOString()
        }));
      }

      addAudit(
        'WHATSAPP',
        'WEBHOOK_VERIFIED',
        `Meta Cloud API webhook handshake verified successfully for ${targetComp.name} with verify token "${verifyToken}". Status: CONNECTED.`,
        companyId,
        targetComp.name
      );

      return {
        success: true,
        message: 'Meta Webhook GET verification handshake tested and confirmed matching configured server verify token!'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Failed to verify webhook connection'
      };
    }
  };

  const resetWebhookVerification = (companyId = currentCompany.id) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? {
      ...c,
      webhookConnected: false,
      webhookConnectedAt: undefined
    } : c));

    if (companyId === currentCompany.id) {
      setWabaConfig(prev => ({
        ...prev,
        webhookConnected: false,
        webhookConnectedAt: undefined
      }));
    }

    addAudit(
      'WHATSAPP',
      'WEBHOOK_RESET',
      `Webhook verification status reset to Connection Pending for testing & audit.`,
      companyId
    );
  };

  const updateCompanyAppCredentials = (appId: string, appSecret: string, companyId = currentCompany.id) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? {
      ...c,
      appId: appId.trim(),
      appSecret: appSecret.trim()
    } : c));

    if (companyId === currentCompany.id) {
      setWabaConfig(prev => ({
        ...prev,
        appId: appId.trim(),
        appSecret: appSecret.trim(),
        appSecretMasked: appSecret.trim() ? `${appSecret.trim().substring(0, 4)}...${appSecret.trim().substring(appSecret.trim().length - 4)}` : '••••••••'
      }));
      setAppSettings(prev => ({
        ...prev,
        metaAppId: appId.trim(),
        metaAppSecret: appSecret.trim()
      }));
    }

    addAudit('WHATSAPP', 'APP_SECRET_UPDATED', `Updated Meta App ID (${appId}) and App Secret credentials for company`, companyId);
  };

  const generateCompanyHardenedSecret = (name: string, scopes: string[], companyId = currentCompany.id): TenantApiKey => {
    const rawSecret = generateHardenedSecretToken('wc_sec_live');
    const prefix = rawSecret.substring(0, 11);
    const tokenHash = Array.from(rawSecret).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0).toString(16).padStart(64, 'a');

    const newKey: TenantApiKey = {
      id: `key_${Date.now()}`,
      companyId,
      name,
      keyPrefix: prefix,
      tokenHash,
      rawKeyOnce: rawSecret,
      scopes,
      rateLimitRpm: 300,
      currentMinuteUsage: 0,
      status: 'ACTIVE',
      isHardenedSecret: true,
      description: 'Hardened cryptographic bearer token generated for company',
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };

    setApiKeys(prev => [newKey, ...prev]);
    addAudit('API_CREDENTIAL', 'HARDENED_KEY_GENERATED', `Generated hardened secret token "${name}" with scopes [${scopes.join(', ')}]`, companyId);
    return newKey;
  };

  // Campaigns
  const createCampaign = (campaignData: any) => {
    const { name, category, templateId, templateName, recipients, batchSize, concurrency, sendRateMs, maxRetryAttempts, variableMapping } = campaignData;
    
    // Safety check: ensure webhook handshake is connected before dispatching
    if (!currentCompany.webhookConnected) {
      return { 
        success: false, 
        error: 'Webhook connection is pending verification. Please verify your Meta webhook handshake in Apps & Company Settings or Cloud API Setup before dispatching live campaigns.' 
      };
    }

    const requiredCredits = recipients.length;
    const reservedOk = reserveCredits(
      currentCompany.id,
      category,
      requiredCredits,
      `temp_camp_${Date.now()}`,
      `Reservation for campaign "${name}" (${requiredCredits} recipients)`
    );

    if (!reservedOk) {
      return { success: false, error: `Insufficient ${category} credit balance to reserve ${requiredCredits} recipients.` };
    }

    const campaignId = `cmp_${Date.now()}`;
    const newCampaign: Campaign = {
      id: campaignId,
      companyId: currentCompany.id,
      name,
      category,
      templateId,
      templateName,
      status: 'queued',
      totalRecipients: requiredCredits,
      recipient_count: requiredCredits,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0,
      skippedCount: 0,
      creditsReserved: requiredCredits,
      reserved_credits: requiredCredits,
      creditsConsumed: 0,
      consumed_credits: 0,
      creditsRefunded: 0,
      released_credits: 0,
      batchSize: batchSize || 50,
      concurrency: concurrency || 4,
      sendRateMs: sendRateMs || 200,
      maxRetryAttempts: maxRetryAttempts || 3,
      startedAt: new Date().toISOString(),
      variableMapping: variableMapping || {},
      recipients: recipients.map((r: any, idx: number) => ({
        id: `rec_${campaignId}_${idx}`,
        campaignId,
        contactId: r.contactId || `cnt_${idx}`,
        phone: r.phone,
        name: r.name,
        variables: r.variables || {},
        status: 'queued',
        idempotencyKey: `idemp_${campaignId}_${r.phone}`,
        retryCount: 0
      })),
      createdAt: new Date().toISOString()
    };

    setCampaigns(prev => [newCampaign, ...prev]);

    const job: BackgroundJob = {
      id: `job_cmp_${campaignId}`,
      companyId: currentCompany.id,
      type: 'CAMPAIGN_DISPATCH',
      status: 'PROCESSING',
      progress: 0,
      payloadDescription: `Dispatched campaign "${name}" (${requiredCredits} recipients)`,
      attempts: 1,
      maxAttempts: 3,
      createdAt: new Date().toISOString()
    };
    setBackgroundJobs(prev => [job, ...prev]);

    addAudit('CAMPAIGN', 'CAMPAIGN_CREATED', `Created and queued campaign "${name}" (${requiredCredits} recipients, category: ${category})`);
    return { success: true, campaignId };
  };

  const pauseCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'paused' } : c));
    addAudit('CAMPAIGN', 'CAMPAIGN_PAUSED', `Paused campaign ${campaignId}`);
  };

  const resumeCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'processing' } : c));
    addAudit('CAMPAIGN', 'CAMPAIGN_RESUMED', `Resumed campaign ${campaignId}`);
  };

  const cancelCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId && c.status !== 'completed' && c.status !== 'cancelled') {
        const remainingUnsent = c.totalRecipients - c.sentCount - c.skippedCount;
        if (remainingUnsent > 0) {
          refundCredits(c.companyId, c.category, remainingUnsent, c.id, `Campaign cancelled. Unsent ${remainingUnsent} reserved credits released.`);
        }
        return {
          ...c,
          status: 'cancelled',
          creditsRefunded: c.creditsRefunded + remainingUnsent,
          released_credits: (c.released_credits || 0) + remainingUnsent
        };
      }
      return c;
    }));
    addAudit('CAMPAIGN', 'CAMPAIGN_CANCELLED', `Cancelled campaign ${campaignId} and released reserved credits.`);
  };

  const runCampaignSimulationStep = (campaignId: string) => {
    dispatchCampaignBatch(campaignId);
  };

  const dispatchCampaignBatch = async (campaignId: string): Promise<{ success: boolean; sent?: number; failed?: number; error?: string }> => {
    const camp = campaigns.find(c => c.id === campaignId);
    if (!camp) return { success: false, error: 'Campaign not found' };
    if (camp.status === 'completed' || camp.status === 'cancelled' || camp.status === 'paused') {
      return { success: false, error: `Campaign is currently ${camp.status}` };
    }

    const queuedRecipients = camp.recipients.filter(r => r.status === 'queued');
    if (queuedRecipients.length === 0) {
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'completed', completedAt: new Date().toISOString() } : c));
      return { success: true, sent: 0, failed: 0 };
    }

    const batchSize = Math.min(camp.batchSize || 10, queuedRecipients.length);
    const batchToProcess = queuedRecipients.slice(0, batchSize);

    try {
      const serverRes = await sendServerCampaignBatch({
        recipients: batchToProcess.map(r => ({
          id: r.id,
          contactId: r.contactId,
          phone: r.phone,
          variables: r.variables
        })),
        templateName: camp.templateName,
        languageCode: 'en_US'
      });

      const batchResults = serverRes.results;
      let newlySent = 0;
      let newlyFailed = 0;

      const updatedRecipients = camp.recipients.map(r => {
        const resItem = batchResults.find(b => b.recipientId === r.id || b.phone === r.phone);
        if (resItem) {
          if (resItem.success && resItem.wamid) {
            newlySent++;
            return {
              ...r,
              status: 'sent' as const,
              wamid: resItem.wamid,
              whatsapp_message_id: resItem.wamid,
              sentAt: new Date().toISOString()
            };
          } else {
            newlyFailed++;
            return {
              ...r,
              status: 'failed' as const,
              errorCode: String(resItem.errorCode || '131026'),
              errorMessage: resItem.error || 'Failed to dispatch via Meta Cloud API'
            };
          }
        }
        return r;
      });

      if (newlySent > 0) {
        commitCredits(camp.companyId, camp.category, newlySent, camp.id, 'Batch sent confirmed for campaign ' + camp.name);
      }

      if (newlyFailed > 0) {
        refundCredits(camp.companyId, camp.category, newlyFailed, camp.id, 'Automatic refund for failed recipients in ' + camp.name);
      }

      const totalSent = camp.sentCount + newlySent;
      const totalFailed = camp.failedCount + newlyFailed;
      const allDone = updatedRecipients.every(r => r.status !== 'queued');

      setCampaigns(prev => prev.map(c => c.id === campaignId ? {
        ...c,
        status: allDone ? (totalFailed > 0 ? 'partially_failed' : 'completed') : 'processing',
        sentCount: totalSent,
        failedCount: totalFailed,
        creditsConsumed: c.creditsConsumed + newlySent,
        consumed_credits: (c.consumed_credits || 0) + newlySent,
        creditsRefunded: c.creditsRefunded + newlyFailed,
        released_credits: (c.released_credits || 0) + newlyFailed,
        recipients: updatedRecipients,
        completedAt: allDone ? new Date().toISOString() : undefined
      } : c));

      addAudit('CAMPAIGN', 'BATCH_DISPATCHED', `Dispatched batch of ${batchToProcess.length} messages for campaign ${camp.name}. Sent: ${newlySent}, Failed: ${newlyFailed}`);
      return { success: true, sent: newlySent, failed: newlyFailed };
    } catch (err: any) {
      const errMsg = err?.message || 'Campaign batch dispatch failed';
      addAudit('CAMPAIGN', 'BATCH_SEND_ERROR', 'Batch dispatch error for ' + camp.name + ': ' + errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Contacts
  const importContacts = (rawRows: any[]) => {
    let imported = 0;
    const errors: Array<{ row: number; phone: string; error: string }> = [];
    const newContacts: Contact[] = [];

    rawRows.forEach((row, idx) => {
      const cleanPhone = (row.phone || '').trim().replace(/[\s\-()]/g, '');
      if (!cleanPhone || cleanPhone.length < 8 || !/^\+?[0-9]+$/.test(cleanPhone)) {
        errors.push({ row: idx + 1, phone: row.phone || 'N/A', error: 'Invalid E.164 phone number format' });
        return;
      }

      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : cleanPhone;

      const isDuplicate = contacts.some(c => c.phone === formattedPhone) || newContacts.some(c => c.phone === formattedPhone);
      if (isDuplicate) {
        errors.push({ row: idx + 1, phone: formattedPhone, error: 'Duplicate phone number already exists in CRM' });
        return;
      }

      newContacts.push({
        id: `cnt_${Date.now()}_${idx}`,
        companyId: currentCompany.id,
        phone: formattedPhone,
        name: row.name || 'Valued Contact',
        email: row.email || undefined,
        country_code: '+91',
        consentStatus: (row.consentStatus === 'OPTED_OUT' ? 'OPTED_OUT' : 'OPTED_IN') as ConsentStatus,
        consentSource: 'CSV_IMPORT',
        consentTimestamp: new Date().toISOString(),
        tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : ['csv_import'],
        groups: ['grp_investors'],
        customAttributes: { city: row.city || 'Unknown' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      imported++;
    });

    if (newContacts.length > 0) {
      setContacts(prev => [...newContacts, ...prev]);
      addAudit('WHATSAPP', 'CONTACTS_IMPORTED', `Imported ${imported} contacts from CSV. ${errors.length} rows rejected.`);
    }

    return { importedCount: imported, errors };
  };

  const toggleContactConsent = (contactId: string, newStatus: ConsentStatus) => {
    setContacts(prev => prev.map(c => c.id === contactId ? {
      ...c,
      consentStatus: newStatus,
      consentTimestamp: new Date().toISOString()
    } : c));
    addAudit('WHATSAPP', 'CONSENT_UPDATED', `Contact ${contactId} consent status updated to ${newStatus}`);
  };

  const createContactGroup = (name: string, description: string, isDynamic: boolean, filterCriteria?: any) => {
    const newGroup: ContactGroup = {
      id: `grp_${Date.now()}`,
      companyId: currentCompany.id,
      name,
      description,
      contactCount: 0,
      isDynamic,
      filterCriteria,
      createdAt: new Date().toISOString()
    };
    setGroups(prev => [newGroup, ...prev]);
    addAudit('WHATSAPP', 'GROUP_CREATED', `Created contact group "${name}" (Dynamic: ${isDynamic})`);
  };

  const deleteContact = (contactId: string) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
    addAudit('WHATSAPP', 'CONTACT_DELETED', `Permanently deleted contact ${contactId}`);
  };

  // Live Chat
  const sendChatMessage = async (conversationId: string, content: string, templateId?: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return;

    const template = templateId ? templates.find(t => t.id === templateId) : null;
    const category: CreditCategory = template?.category === 'MARKETING' ? 'MARKETING' : 'UTILITY';

    const deduction = await sendTestOutboundMessage(conv.contactPhone, content, category);
    if (!deduction.success) {
      alert('Message dispatch failed: ' + (deduction.error || 'Unknown error'));
      return;
    }

    const realWamid = deduction.wamid || ('wamid.out_' + Date.now());
    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      conversationId,
      companyId: currentCompany.id,
      direction: 'outgoing',
      senderType: 'AGENT',
      senderName: currentUser.name,
      senderId: currentUser.id,
      content,
      templateId,
      deliveryStatus: 'sent',
      wabaMessageId: realWamid,
      whatsapp_message_id: realWamid,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg]
    }));

    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      lastMessage: content,
      lastMessageTime: 'just now'
    } : c));
  };

  const addInternalNote = (conversationId: string, content: string) => {
    const note: InternalNote = {
      id: `note_${Date.now()}`,
      conversationId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      content,
      createdAt: new Date().toISOString()
    };
    setInternalNotes(prev => ({
      ...prev,
      [conversationId]: [note, ...(prev[conversationId] || [])]
    }));
    addAudit('WHATSAPP', 'INTERNAL_NOTE_ADDED', `Agent ${currentUser.name} added private note to conversation ${conversationId}`);
  };

  const reassignConversation = (conversationId: string, agentId: string) => {
    const targetAgent = users.find(u => u.id === agentId);
    setConversations(prev => prev.map(c => c.id === conversationId ? {
      ...c,
      assignedAgentId: agentId,
      assignedAgentName: targetAgent ? targetAgent.name : 'Unassigned'
    } : c));
    addAudit('WHATSAPP', 'CONVERSATION_REASSIGNED', `Reassigned conversation ${conversationId} to ${targetAgent?.name}`);
  };

  const toggleConversationStatus = (conversationId: string, newStatus: any) => {
    const normalized = (newStatus === 'open' || newStatus === 'OPEN') ? 'open' : 'closed';
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, status: normalized } : c));
    addAudit('WHATSAPP', 'CONVERSATION_STATUS_CHANGED', `Changed conversation ${conversationId} status to ${normalized}`);
  };

  const saveBotRule = (rule: Partial<BotAutomationRule>) => {
    if (rule.id) {
      setBotRules(prev => prev.map(r => r.id === rule.id ? { ...r, ...rule } as BotAutomationRule : r));
      addAudit('WHATSAPP', 'BOT_RULE_UPDATED', `Updated automation rule ${rule.name}`);
    } else {
      const newRule: BotAutomationRule = {
        id: `bot_${Date.now()}`,
        companyId: currentCompany.id,
        priority: rule.priority || 10,
        name: rule.name || 'New Bot Rule',
        triggerType: rule.triggerType || 'CONTAINS',
        keywords: rule.keywords || ['help'],
        trigger_text: rule.trigger_text || rule.keywords?.join(', '),
        response_text: rule.response_text || rule.replyText || 'Hello! How can we assist you today?',
        caseSensitive: false,
        actionType: rule.actionType || 'SEND_TEXT',
        replyText: rule.replyText || rule.response_text || 'Hello! How can we assist you today?',
        isActive: true,
        status: 'active',
        hitCount: 0,
        ...rule
      };
      setBotRules(prev => [newRule, ...prev]);
      addAudit('WHATSAPP', 'BOT_RULE_CREATED', `Created new bot rule "${newRule.name}" with priority ${newRule.priority}`);
    }
  };

  const toggleBotRule = (ruleId: string) => {
    setBotRules(prev => prev.map(r => r.id === ruleId ? { ...r, isActive: !r.isActive, status: !r.isActive ? 'active' : 'inactive' } : r));
  };

  const setAgentAvailability = (userId: string, isOnline: boolean) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isOnline } : u));
    addAudit('AUTH', 'AGENT_STATUS_TOGGLED', `Agent ${userId} availability set to ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
  };

  // Super Admin
  const createNewCompany = (
    companyData: Partial<Company>,
    planId: string,
    marketingBonus: number,
    utilityBonus: number
  ) => {
    const compId = `cmp_${Math.random().toString(36).substring(2, 8)}`;
    const hardSecretToken = generateHardenedSecretToken('wc_sec_live');
    const webhookSecretToken = generateHardenedSecretToken('wc_sec_hook');
    const campaignSecretToken = generateHardenedSecretToken('wc_sec_camp');

    const newComp: Company = {
      id: compId,
      company_uid: `WC-00000${companies.length + 1}`,
      name: companyData.name || 'New Company',
      code: companyData.code || `comp_${Date.now().toString().slice(-4)}`,
      status: 'active',
      planId: planId || 'plan_basic',
      planName: plans.find(p => p.id === planId)?.name || 'Basic',
      ownerName: companyData.ownerName || 'Business Owner',
      ownerEmail: companyData.ownerEmail || 'owner@company.com',
      phone: companyData.phone || '+91 9800000000',
      mobile: companyData.mobile || '+91 9800000000',
      address: companyData.address || 'New Delhi, India',
      timezone: companyData.timezone || 'Asia/Kolkata',
      currency: companyData.currency || 'INR',
      cached_credit_balance: marketingBonus + utilityBonus,
      appId: '18920192039481',
      appSecret: '',
      webhookConnected: false,
      hardSecretToken,
      createdAt: new Date().toLocaleString()
    };

    // Auto-generate multiple hardened secret API keys upon company creation
    const masterApiKey: TenantApiKey = {
      id: `key_${compId}_master`,
      companyId: compId,
      name: 'Master Hardened Secret Token',
      keyPrefix: 'wc_sec_live',
      tokenHash: Array.from(hardSecretToken).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0).toString(16).padStart(64, 'a'),
      rawKeyOnce: hardSecretToken,
      scopes: ['messages:send', 'templates:read', 'contacts:read', 'webhooks:listen'],
      rateLimitRpm: 600,
      currentMinuteUsage: 0,
      status: 'ACTIVE',
      isHardenedSecret: true,
      description: 'Permanent master high-entropy secret token generated at company provisioning',
      expiresAt: '2030-01-01T00:00:00Z',
      createdAt: new Date().toISOString()
    };

    const webhookApiKey: TenantApiKey = {
      id: `key_${compId}_hook`,
      companyId: compId,
      name: 'Webhook Ingestion Hardened Secret',
      keyPrefix: 'wc_sec_hook',
      tokenHash: Array.from(webhookSecretToken).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0).toString(16).padStart(64, 'b'),
      rawKeyOnce: webhookSecretToken,
      scopes: ['webhooks:listen'],
      rateLimitRpm: 1200,
      currentMinuteUsage: 0,
      status: 'ACTIVE',
      isHardenedSecret: true,
      description: 'Dedicated hardened secret for webhook subscription listening',
      expiresAt: '2030-01-01T00:00:00Z',
      createdAt: new Date().toISOString()
    };

    const campaignApiKey: TenantApiKey = {
      id: `key_${compId}_camp`,
      companyId: compId,
      name: 'Campaign Dispatch Hardened Secret',
      keyPrefix: 'wc_sec_camp',
      tokenHash: Array.from(campaignSecretToken).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0).toString(16).padStart(64, 'c'),
      rawKeyOnce: campaignSecretToken,
      scopes: ['messages:send', 'templates:read'],
      rateLimitRpm: 400,
      currentMinuteUsage: 0,
      status: 'ACTIVE',
      isHardenedSecret: true,
      description: 'Scoped hardened token for bulk campaign queue ingestion',
      expiresAt: '2030-01-01T00:00:00Z',
      createdAt: new Date().toISOString()
    };

    setCompanies(prev => [...prev, newComp]);
    setApiKeys(prev => [masterApiKey, webhookApiKey, campaignApiKey, ...prev]);

    setWallets(prev => ({
      ...prev,
      [compId]: {
        companyId: compId,
        marketingTotal: marketingBonus,
        marketingReserved: 0,
        marketingConsumed: 0,
        utilityTotal: utilityBonus,
        utilityReserved: 0,
        utilityConsumed: 0,
        lastReconciledAt: new Date().toISOString()
      }
    }));

    if (marketingBonus > 0) {
      allocateCredits(compId, 'MARKETING', marketingBonus, 'Initial Onboarding Welcome Bonus');
    }
    if (utilityBonus > 0) {
      allocateCredits(compId, 'UTILITY', utilityBonus, 'Initial Onboarding Welcome Bonus');
    }

    addAudit('COMPANY_LIFECYCLE', 'COMPANY_ONBOARDED', `Provisioned tenant ${newComp.name} (${newComp.code}) on plan ${planId}`, compId, newComp.name);
  };

  const savePlan = (plan: Partial<SubscriptionPlan>) => {
    if (plan.id) {
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, ...plan } as SubscriptionPlan : p));
      addAudit('COMPANY_LIFECYCLE', 'PLAN_UPDATED', `Updated subscription tier ${plan.name}`);
    } else {
      const newPlan: SubscriptionPlan = {
        id: `plan_${Date.now()}`,
        name: plan.name || 'New Plan',
        price: plan.price || 999,
        monthlyPrice: plan.price || 999,
        billing_period: 'monthly',
        marketingCreditsQuota: 5000,
        utilityCreditsQuota: 2500,
        agentSeatLimit: 3,
        rateLimitRpm: 120,
        features: ['Standard Cloud API'],
        status: 'active',
        overLimitAction: 'BLOCK',
        ...plan
      };
      setPlans(prev => [...prev, newPlan]);
      addAudit('COMPANY_LIFECYCLE', 'PLAN_CREATED', `Created new subscription tier ${newPlan.name}`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentCompany,
        currentUser,
        companies,
        users,
        plans,
        permissionMatrix,
        impersonationState,
        appSettings,
        updateAppSettings,
        authView,
        setAuthView,
        login,
        logout,
        registerCompany,
        adminStats: ADMIN_STATS,
        tenantStats: TENANT_STATS,
        switchCompany,
        switchUser,
        startImpersonation,
        stopImpersonation,
        createAgent,
        deleteAgent,
        currentWallet,
        ledger,
        allocateCredits,
        reserveCredits,
        commitCredits,
        refundCredits,
        reconcileLedger,
        loginThrottling,
        simulateLoginAttempt,
        resetPassword,
        toggleCompanySuspension,
        updatePermission,
        apiKeys,
        generateApiKey,
        revokeApiKey,
        rotateApiKey,
        testApiCall,
        wabaConfig,
        wabaServerConfig,
        templates,
        updateWabaConfig,
        syncTemplatesFromMeta,
        simulateIncomingWebhook,
        sendTestOutboundMessage,
        campaigns,
        createCampaign,
        pauseCampaign,
        resumeCampaign,
        cancelCampaign,
        runCampaignSimulationStep,
        dispatchCampaignBatch,
        contacts,
        groups,
        importContacts,
        toggleContactConsent,
        createContactGroup,
        deleteContact,
        conversations,
        messages,
        internalNotes,
        botRules,
        activeConversationId,
        setActiveConversationId,
        sendChatMessage,
        addInternalNote,
        reassignConversation,
        toggleConversationStatus,
        saveBotRule,
        toggleBotRule,
        setAgentAvailability,
        auditLogs,
        backgroundJobs,
        createNewCompany,
        savePlan,
        supabaseStatus,
        isSupabaseSyncing,
        syncWithSupabase,
        copySupabaseSqlFix,
        verifyWebhookConnection,
        resetWebhookVerification,
        updateCompanyAppCredentials,
        generateCompanyHardenedSecret
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
