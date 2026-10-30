/**
 * Server-Side Meta WhatsApp Cloud API Service
 * Centralizes Graph API requests, versioning, error mapping, and security.
 * NEVER expose tokens, secrets, or raw Graph API requests directly to the client browser.
 */

import crypto from 'crypto';

export interface MetaConfig {
  graphApiVersion: string;
  baseUrl: string;
  accessToken: string;
  wabaId: string;
  phoneNumberId: string;
  appSecret: string;
  webhookVerifyToken: string;
}

export interface MetaApiErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    error_data?: any;
    fbtrace_id?: string;
  };
}

export interface MetaComponentParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  text?: string;
  image?: { link: string };
  document?: { link: string; filename?: string };
}

export interface MetaTemplateComponent {
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
}

export interface MetaTemplatePayload {
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  components: MetaTemplateComponent[];
}

export interface MetaTemplateResponseItem {
  id: string;
  name: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'PAUSED';
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  components: MetaTemplateComponent[];
  rejected_reason?: string;
}

export interface MetaTemplatesListResponse {
  data: MetaTemplateResponseItem[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
  };
}

export interface MetaSendResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string; // Real wamid
    message_status?: string;
  }>;
}

export interface MetaPhoneNumbersResponse {
  data: Array<{
    id: string;
    verified_name: string;
    display_phone_number: string;
    quality_rating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
    code_verification_status?: string;
    eligibility_for_api_business_global_search?: string;
    name_status?: string;
  }>;
}

let activeRuntimeMetaConfig: Partial<MetaConfig> = {};

export function updateRuntimeMetaConfig(newConfig: Partial<MetaConfig>): MetaConfig {
  activeRuntimeMetaConfig = {
    ...activeRuntimeMetaConfig,
    ...newConfig
  };
  return getMetaConfig();
}

export function getRuntimeMetaConfig(): Partial<MetaConfig> {
  return activeRuntimeMetaConfig;
}

/**
 * Retrieve server-side Meta configuration from environment variables or active runtime config
 */
export function getMetaConfig(overrides?: Partial<MetaConfig>): MetaConfig {
  const graphApiVersion = overrides?.graphApiVersion || activeRuntimeMetaConfig.graphApiVersion || process.env.META_GRAPH_API_VERSION || 'v22.0';
  const baseUrl = `https://graph.facebook.com/${graphApiVersion}`;

  return {
    graphApiVersion,
    baseUrl,
    accessToken: overrides?.accessToken || activeRuntimeMetaConfig.accessToken || process.env.WHATSAPP_ACCESS_TOKEN || '',
    wabaId: overrides?.wabaId || activeRuntimeMetaConfig.wabaId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    phoneNumberId: overrides?.phoneNumberId || activeRuntimeMetaConfig.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    appSecret: overrides?.appSecret || activeRuntimeMetaConfig.appSecret || process.env.META_APP_SECRET || '',
    webhookVerifyToken: overrides?.webhookVerifyToken || activeRuntimeMetaConfig.webhookVerifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'webcraft_verify_token_whatsapp',
  };
}

function getMetaObjectUrl(config: MetaConfig, objectId: string, path = ''): string {
  if (!/^\d+$/.test(objectId)) {
    throw new Error('Invalid Meta object ID.');
  }

  return `${config.baseUrl}/${objectId}${path}`;
}

/**
 * Map Meta Graph API error codes to human-readable explanations and guidance
 */
export function mapMetaError(errorData: MetaApiErrorResponse['error']): {
  code: number;
  message: string;
  recommendation: string;
} {
  const code = errorData.code;
  const msg = errorData.message || 'Unknown Meta Graph API error';

  switch (code) {
    case 190:
      return {
        code,
        message: 'Invalid or expired Meta WhatsApp Access Token.',
        recommendation: 'Generate a new permanent System User access token in Meta Business Manager and update WHATSAPP_ACCESS_TOKEN.',
      };
    case 100:
      return {
        code,
        message: `Invalid parameter supplied to Graph API: ${msg}`,
        recommendation: 'Verify the template name, language code, recipient phone format (E.164 without +), and component variable values.',
      };
    case 131030:
      return {
        code,
        message: 'Recipient phone number is not registered on WhatsApp.',
        recommendation: 'Verify the recipient mobile number or check their WhatsApp registration status.',
      };
    case 131047:
      return {
        code,
        message: 'Re-engagement message failed: 24-hour customer service window expired.',
        recommendation: 'Free-form messages can only be sent within 24 hours of user inbound message. Use an APPROVED template message instead.',
      };
    case 131056:
      return {
        code,
        message: 'Rate limit hit on WhatsApp Cloud API.',
        recommendation: 'Slow down sending throughput, implement exponential backoff, or check your tier in WhatsApp Business Account.',
      };
    case 132000:
      return {
        code,
        message: 'The template does not exist or has not been approved for this language.',
        recommendation: 'Synchronize templates from Meta and verify the template name and language match exactly.',
      };
    case 132001:
      return {
        code,
        message: 'Template variable count mismatch.',
        recommendation: 'Ensure all expected {{1}}, {{2}} template parameters are provided in the payload.',
      };
    default:
      return {
        code,
        message: msg,
        recommendation: 'Check Meta Cloud API status and your App permissions (whatsapp_business_management, whatsapp_business_messaging).',
      };
  }
}

export interface MetaVerificationResult {
  success: boolean;
  phoneNumber?: {
    id: string;
    verifiedName: string;
    displayPhoneNumber: string;
    qualityRating: string;
    codeVerificationStatus?: string;
  };
  waba?: {
    id: string;
    name: string;
    timezone?: string;
    currency?: string;
  };
  error?: string;
  errorCode?: number;
  recommendation?: string;
}

/**
 * Verify credentials with Meta Graph API in real-time
 */
export async function verifyMetaCredentials(
  config: MetaConfig
): Promise<MetaVerificationResult> {
  if (!config.accessToken) {
    return {
      success: false,
      error: 'Access token is required to connect to Meta Graph API.',
      recommendation: 'Please provide a valid permanent System User token from Meta Business Manager.',
    };
  }

  try {
    let phoneData: any = null;
    let wabaData: any = null;

    // 1. If Phone Number ID is provided, query it via Graph API
    if (config.phoneNumberId) {
      const phoneUrl = getMetaObjectUrl(config, config.phoneNumberId, '?fields=id,verified_name,display_phone_number,quality_rating,code_verification_status');
      const phoneRes = await fetch(phoneUrl, {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      });
      const phoneBody = await phoneRes.json();
      if (!phoneRes.ok) {
        const mapped = mapMetaError(phoneBody.error || { code: phoneRes.status, message: phoneRes.statusText, type: 'OAuthException' });
        return {
          success: false,
          errorCode: mapped.code,
          error: `Phone Number ID check failed: ${mapped.message}`,
          recommendation: mapped.recommendation,
        };
      }
      phoneData = {
        id: phoneBody.id,
        verifiedName: phoneBody.verified_name || 'Verified WhatsApp Business',
        displayPhoneNumber: phoneBody.display_phone_number || config.phoneNumberId,
        qualityRating: phoneBody.quality_rating || 'GREEN',
        codeVerificationStatus: phoneBody.code_verification_status || 'VERIFIED',
      };
    }

    // 2. If WABA ID is provided, query it via Graph API
    if (config.wabaId) {
      const wabaUrl = getMetaObjectUrl(config, config.wabaId, '?fields=id,name,timezone_id,currency');
      const wabaRes = await fetch(wabaUrl, {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      });
      const wabaBody = await wabaRes.json();
      if (wabaRes.ok) {
        wabaData = {
          id: wabaBody.id,
          name: wabaBody.name || 'WhatsApp Business Account',
          timezone: wabaBody.timezone_id || 'Asia/Kolkata',
          currency: wabaBody.currency || 'INR',
        };
      } else if (!config.phoneNumberId) {
        const mapped = mapMetaError(wabaBody.error || { code: wabaRes.status, message: wabaRes.statusText, type: 'OAuthException' });
        return {
          success: false,
          errorCode: mapped.code,
          error: `WABA ID check failed: ${mapped.message}`,
          recommendation: mapped.recommendation,
        };
      }
    }

    return {
      success: true,
      phoneNumber: phoneData,
      waba: wabaData,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to connect to Meta Graph API.',
      recommendation: 'Check server network connection and Meta status.',
    };
  }
}

/**
 * Register Phone Number with 6-digit PIN on WhatsApp Cloud API
 * Endpoint: POST /{PHONE_NUMBER_ID}/register
 */
export async function registerPhoneNumberWithPin(
  config: MetaConfig,
  pin: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!config.accessToken || !config.phoneNumberId) {
    return {
      success: false,
      error: 'Missing Meta Phone Number ID or Access Token in server environment.',
    };
  }

  const cleanPin = String(pin).replace(/\D/g, '').padStart(6, '0');
  if (cleanPin.length !== 6) {
    return {
      success: false,
      error: 'PIN must be a 6-digit numeric string.',
    };
  }

  try {
    const url = getMetaObjectUrl(config, config.phoneNumberId, '/register');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        pin: cleanPin,
      }),
    });

    const body = await response.json();
    if (!response.ok) {
      const mapped = mapMetaError(body.error || { code: response.status, message: response.statusText, type: 'OAuthException' });
      return {
        success: false,
        error: `${mapped.message} (${mapped.recommendation})`,
      };
    }

    return {
      success: true,
      data: body,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network failure registering phone number with Meta Cloud API.',
    };
  }
}

/**
 * Set or Request Verified Display Name on WhatsApp Cloud API
 * Endpoint: POST /{PHONE_NUMBER_ID}
 */
export async function updateVerifiedDisplayName(
  config: MetaConfig,
  newDisplayName: string,
  pin?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!config.accessToken || !config.phoneNumberId) {
    return {
      success: false,
      error: 'Missing Meta Phone Number ID or Access Token in server environment.',
    };
  }

  try {
    const url = getMetaObjectUrl(config, config.phoneNumberId);
    const payload: any = {
      messaging_product: 'whatsapp',
      verified_name: newDisplayName.trim(),
    };
    if (pin) {
      payload.pin = String(pin).replace(/\D/g, '').padStart(6, '0');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = await response.json();
    if (!response.ok) {
      const mapped = mapMetaError(body.error || { code: response.status, message: response.statusText, type: 'OAuthException' });
      return {
        success: false,
        error: `${mapped.message} (${mapped.recommendation})`,
      };
    }

    return {
      success: true,
      data: body,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network failure updating display name with Meta Cloud API.',
    };
  }
}

/**
 * Fetch actual message templates from Meta Graph API
 * Endpoint: GET /{WABA_ID}/message_templates
 */
export async function fetchTemplatesFromMeta(
  config: MetaConfig,
  cursorAfter?: string
): Promise<{ success: boolean; data?: MetaTemplateResponseItem[]; nextCursor?: string; error?: string }> {
  if (!config.accessToken || !config.wabaId) {
    return {
      success: false,
      error: 'Missing Meta WABA ID or Access Token in server environment.',
    };
  }

  try {
    const fields = 'id,name,status,category,language,components,rejected_reason';
    let url = getMetaObjectUrl(config, config.wabaId, `/message_templates?fields=${fields}&limit=100`);
    if (cursorAfter) {
      url += `&after=${encodeURIComponent(cursorAfter)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const body = await response.json();

    if (!response.ok) {
      const mapped = mapMetaError(body.error || { code: response.status, message: response.statusText, type: 'OAuthException' });
      return {
        success: false,
        error: `${mapped.message} (${mapped.recommendation})`,
      };
    }

    const resData: MetaTemplatesListResponse = body;
    const nextCursor = resData.paging?.cursors?.after;

    return {
      success: true,
      data: resData.data || [],
      nextCursor,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network failure connecting to Meta Graph API.',
    };
  }
}

/**
 * Create a new message template in Meta Graph API
 * Endpoint: POST /{WABA_ID}/message_templates
 */
export async function createTemplateInMeta(
  config: MetaConfig,
  templatePayload: MetaTemplatePayload
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!config.accessToken || !config.wabaId) {
    return {
      success: false,
      error: 'Missing Meta WABA ID or Access Token in server environment.',
    };
  }

  // Validate template name
  const nameRegex = /^[a-z0-9_]+$/;
  if (!nameRegex.test(templatePayload.name)) {
    return {
      success: false,
      error: 'Template name can only contain lowercase alphanumeric characters and underscores.',
    };
  }

  try {
    const url = getMetaObjectUrl(config, config.wabaId, '/message_templates');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templatePayload),
    });

    const body = await response.json();

    if (!response.ok) {
      const mapped = mapMetaError(body.error || { code: response.status, message: response.statusText, type: 'OAuthException' });
      return {
        success: false,
        error: `${mapped.message} (${mapped.recommendation})`,
      };
    }

    return {
      success: true,
      data: body,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network failure creating template in Meta Graph API.',
    };
  }
}

/**
 * Fetch phone numbers connected to the WABA
 * Endpoint: GET /{WABA_ID}/phone_numbers
 */
export async function fetchPhoneNumbersFromMeta(
  config: MetaConfig
): Promise<{ success: boolean; data?: MetaPhoneNumbersResponse['data']; error?: string }> {
  if (!config.accessToken || !config.wabaId) {
    return {
      success: false,
      error: 'Missing Meta WABA ID or Access Token in server environment.',
    };
  }

  try {
    const url = getMetaObjectUrl(config, config.wabaId, '/phone_numbers?fields=id,verified_name,display_phone_number,quality_rating,code_verification_status,name_status');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const body = await response.json();

    if (!response.ok) {
      const mapped = mapMetaError(body.error || { code: response.status, message: response.statusText, type: 'OAuthException' });
      return {
        success: false,
        error: `${mapped.message} (${mapped.recommendation})`,
      };
    }

    return {
      success: true,
      data: body.data || [],
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network failure fetching phone numbers from Meta.',
    };
  }
}

/**
 * Send WhatsApp Message
 * Endpoint: POST /{PHONE_NUMBER_ID}/messages
 */
export async function sendWhatsAppMessage(
  config: MetaConfig,
  payload: any
): Promise<{ success: boolean; wamid?: string; data?: any; error?: string; errorCode?: number }> {
  if (!config.accessToken || !config.phoneNumberId) {
    return {
      success: false,
      error: 'Missing Meta Phone Number ID or Access Token in server environment.',
    };
  }

  try {
    const url = getMetaObjectUrl(config, config.phoneNumberId, '/messages');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = await response.json();

    if (!response.ok) {
      const errDetail = body.error || { code: response.status, message: response.statusText, type: 'OAuthException' };
      const mapped = mapMetaError(errDetail);
      return {
        success: false,
        errorCode: errDetail.code,
        error: `${mapped.message} (${mapped.recommendation})`,
      };
    }

    const res: MetaSendResponse = body;
    const wamid = res.messages?.[0]?.id;

    return {
      success: true,
      wamid,
      data: res,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error dispatching message via Meta Cloud API.',
    };
  }
}

/**
 * Validate Meta Webhook Signature using HMAC-SHA256
 * Header: X-Hub-Signature-256: sha256=<hash>
 */
export function verifyWebhookSignature(
  rawBody: Buffer | string,
  signatureHeader: string | undefined,
  appSecret: string
): boolean {
  if (!appSecret) {
    // If no app secret is configured on the server, reject for safety in production
    console.warn('[Webhook] Warning: META_APP_SECRET is not configured on the server.');
    return false;
  }

  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  try {
    const signature = signatureHeader.substring(7); // remove "sha256="
    const hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('hex');

    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (err) {
    console.error('[Webhook] Signature verification error:', err);
    return false;
  }
}
