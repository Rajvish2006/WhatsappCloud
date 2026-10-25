/**
 * Client API utility to communicate with the full-stack server backend.
 * All Meta WhatsApp Cloud API credentials, access tokens, and secrets remain securely on the server.
 */

export interface WhatsAppServerConfig {
  isConfigured: boolean;
  graphApiVersion: string;
  wabaId: string;
  phoneNumberId: string;
  webhookVerifyTokenConfigured: boolean;
  appSecretConfigured: boolean;
  accessTokenConfigured: boolean;
  callbackUrl: string;
}

export interface ServerMetaTemplate {
  id: string;
  name: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'PAUSED';
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  components: Array<{
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';
    text?: string;
    example?: {
      header_text?: string[];
      body_text?: string[][];
    };
    buttons?: Array<{
      type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
      text: string;
      url?: string;
      phone_number?: string;
    }>;
  }>;
  rejected_reason?: string;
}

export interface WebhookEventRecord {
  id: string;
  type: 'VERIFICATION' | 'STATUS_UPDATE' | 'INBOUND_MESSAGE' | 'TEMPLATE_UPDATE' | 'UNSUPPORTED';
  timestamp: string;
  details: any;
  wamid?: string;
  status?: string;
  from?: string;
  signatureValid: boolean;
}

/**
 * Fetch server-side WhatsApp configuration metadata (safe for UI)
 */
export async function fetchWhatsAppServerConfig(): Promise<WhatsAppServerConfig> {
  const res = await fetch('/api/whatsapp/config');
  if (!res.ok) {
    throw new Error(`Failed to fetch WhatsApp server config: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch real message templates from Meta Graph API through server proxy
 */
export async function fetchServerTemplates(after?: string): Promise<{
  templates: ServerMetaTemplate[];
  nextCursor?: string;
}> {
  const url = after ? `/api/whatsapp/templates?after=${encodeURIComponent(after)}` : '/api/whatsapp/templates';
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch templates from Meta Graph API');
  }
  return data;
}

/**
 * Create a new message template in Meta Cloud API
 */
export async function createServerTemplate(templateData: {
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  components: any[];
}): Promise<any> {
  const res = await fetch('/api/whatsapp/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(templateData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create template in Meta Graph API');
  }
  return data;
}

/**
 * Fetch registered phone numbers for the WABA
 */
export async function fetchServerPhoneNumbers(): Promise<any[]> {
  const res = await fetch('/api/whatsapp/phone-numbers');
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch phone numbers from Meta');
  }
  return data.phoneNumbers || [];
}

/**
 * Send a single WhatsApp message via Cloud API
 */
export async function sendServerWhatsAppMessage(params: {
  to: string;
  type?: 'template' | 'text';
  text?: string;
  template?: {
    name: string;
    language: { code: string };
    components?: any[];
  };
}): Promise<{ success: boolean; wamid: string; data: any }> {
  const res = await fetch('/api/whatsapp/messages/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to send WhatsApp message');
  }
  return data;
}

/**
 * Dispatch batch campaign messages via Cloud API
 */
export async function sendServerCampaignBatch(params: {
  recipients: Array<{
    id?: string;
    contactId?: string;
    phone: string;
    variables?: Record<string, string>;
  }>;
  templateName: string;
  languageCode?: string;
}): Promise<{
  totalProcessed: number;
  sentCount: number;
  failedCount: number;
  results: Array<{
    recipientId: string;
    phone: string;
    success: boolean;
    wamid?: string;
    error?: string;
    errorCode?: number;
  }>;
}> {
  const res = await fetch('/api/whatsapp/campaigns/send-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to dispatch campaign batch');
  }
  return data;
}

/**
 * Fetch recent webhook events log for real-time observability
 */
export async function fetchServerWebhookEvents(): Promise<{
  total: number;
  events: WebhookEventRecord[];
}> {
  const res = await fetch('/api/whatsapp/webhook-events');
  if (!res.ok) {
    throw new Error('Failed to retrieve webhook events');
  }
  return res.json();
}

/**
 * Test verify token against backend verification logic
 */
export async function testServerVerifyToken(verifyToken: string): Promise<{
  match: boolean;
  configured: boolean;
  message: string;
}> {
  const res = await fetch('/api/whatsapp/test-handshake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verifyToken }),
  });
  return res.json();
}
