import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import {
  getMetaConfig,
  fetchTemplatesFromMeta,
  createTemplateInMeta,
  fetchPhoneNumbersFromMeta,
  sendWhatsAppMessage,
  verifyWebhookSignature,
} from './src/server/metaCloudApi';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

// Store raw body for webhook HMAC signature verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// In-memory observability buffer for recent webhook events (last 100)
interface WebhookEventLog {
  id: string;
  type: 'VERIFICATION' | 'STATUS_UPDATE' | 'INBOUND_MESSAGE' | 'TEMPLATE_UPDATE' | 'UNSUPPORTED';
  timestamp: string;
  details: any;
  wamid?: string;
  status?: string;
  from?: string;
  signatureValid: boolean;
}

const webhookEventsBuffer: WebhookEventLog[] = [];

function recordWebhookEvent(event: Omit<WebhookEventLog, 'id' | 'timestamp'>) {
  const item: WebhookEventLog = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...event,
  };
  webhookEventsBuffer.unshift(item);
  if (webhookEventsBuffer.length > 100) {
    webhookEventsBuffer.pop();
  }
  return item;
}

// ============================================================================
// META WHATSAPP WEBHOOK ROUTES
// Exact Path: /api/webhooks/whatsapp
// ============================================================================

/**
 * GET /api/webhooks/whatsapp
 * Meta Webhook Handshake Verification
 * Query params: hub.mode, hub.verify_token, hub.challenge
 */
app.get('/api/webhooks/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const config = getMetaConfig();
  const expectedToken = config.webhookVerifyToken;

  console.log(`[Webhook Verification] hub.mode: ${mode}, hub.verify_token received: ${token ? 'PROVIDED' : 'MISSING'}`);

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[Webhook Verification] SUCCESS - challenge confirmed');
    recordWebhookEvent({
      type: 'VERIFICATION',
      details: { mode, status: 'SUCCESS', challengeProvided: Boolean(challenge) },
      signatureValid: true,
    });
    return res.status(200).send(challenge);
  }

  console.warn('[Webhook Verification] FAILED - Token mismatch or invalid mode');
  recordWebhookEvent({
    type: 'VERIFICATION',
    details: { mode, status: 'FAILED_MISMATCH', reason: 'Verify token mismatch' },
    signatureValid: false,
  });
  return res.status(403).send('Forbidden: Webhook verify token mismatch');
});

/**
 * POST /api/webhooks/whatsapp
 * Meta Webhook Event Processing
 * Header: X-Hub-Signature-256
 */
app.post('/api/webhooks/whatsapp', (req: any, res: Response) => {
  const signature = req.headers['x-hub-signature-256'] as string | undefined;
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
  const config = getMetaConfig();

  // Signature validation (if META_APP_SECRET is configured)
  let signatureValid = true;
  if (config.appSecret) {
    signatureValid = verifyWebhookSignature(rawBody, signature, config.appSecret);
    if (!signatureValid) {
      console.warn('[Webhook POST] Invalid HMAC-SHA256 signature rejected with 401');
      recordWebhookEvent({
        type: 'UNSUPPORTED',
        details: { error: 'Invalid HMAC signature', headerPresent: Boolean(signature) },
        signatureValid: false,
      });
      return res.status(401).json({ error: 'Invalid X-Hub-Signature-256' });
    }
  }

  // Acknowledge Meta immediately with 200 OK
  res.status(200).json({ success: true, received: true });

  const body = req.body;
  if (!body || body.object !== 'whatsapp_business_account') {
    recordWebhookEvent({
      type: 'UNSUPPORTED',
      details: { message: 'Non-WhatsApp or empty payload', bodyPreview: body },
      signatureValid,
    });
    return;
  }

  try {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const field = change.field;
        const value = change.value;

        // 1. Template Status Updates (e.g. APPROVED, REJECTED, PAUSED)
        if (field === 'message_template_status_update') {
          console.log(`[Webhook] Template status change: ${value.message_template_name} -> ${value.event}`);
          recordWebhookEvent({
            type: 'TEMPLATE_UPDATE',
            details: {
              templateId: value.message_template_id,
              templateName: value.message_template_name,
              event: value.event,
              reason: value.reason,
            },
            signatureValid,
          });
          continue;
        }

        // 2. Outgoing Message Delivery Statuses (sent, delivered, read, failed)
        if (value?.statuses && Array.isArray(value.statuses)) {
          for (const statusObj of value.statuses) {
            const wamid = statusObj.id;
            const status = statusObj.status; // 'sent' | 'delivered' | 'read' | 'failed'
            const recipientId = statusObj.recipient_id;
            const timestamp = statusObj.timestamp;
            const errors = statusObj.errors;

            console.log(`[Webhook] Status update: ${wamid} -> [${status.toUpperCase()}] for recipient ${recipientId}`);
            recordWebhookEvent({
              type: 'STATUS_UPDATE',
              wamid,
              status,
              from: recipientId,
              details: {
                timestamp,
                errors: errors || null,
              },
              signatureValid,
            });
          }
        }

        // 3. Customer Inbound Messages
        if (value?.messages && Array.isArray(value.messages)) {
          for (const msg of value.messages) {
            const wamid = msg.id;
            const from = msg.from;
            const type = msg.type;
            const text = type === 'text' ? msg.text?.body : `[Media/Interactive: ${type}]`;
            const contactName = value.contacts?.[0]?.profile?.name || 'WhatsApp Contact';

            console.log(`[Webhook] Inbound message from ${from} (${contactName}): ${text}`);
            recordWebhookEvent({
              type: 'INBOUND_MESSAGE',
              wamid,
              from,
              details: {
                contactName,
                type,
                text,
                timestamp: msg.timestamp,
              },
              signatureValid,
            });
          }
        }
      }
    }
  } catch (err: any) {
    console.error('[Webhook] Error processing payload in background:', err);
  }
});

// ============================================================================
// WHATSAPP GRAPH API PROXY ROUTES
// ============================================================================

/**
 * GET /api/whatsapp/config
 * Returns active configuration metadata safely without leaking secrets
 */
app.get('/api/whatsapp/config', (_req: Request, res: Response) => {
  const config = getMetaConfig();
  const isConfigured = Boolean(config.accessToken && config.wabaId && config.phoneNumberId);

  res.json({
    isConfigured,
    graphApiVersion: config.graphApiVersion,
    wabaId: config.wabaId || 'Not Configured',
    phoneNumberId: config.phoneNumberId || 'Not Configured',
    webhookVerifyTokenConfigured: Boolean(config.webhookVerifyToken),
    appSecretConfigured: Boolean(config.appSecret),
    accessTokenConfigured: Boolean(config.accessToken),
    callbackUrl: `/api/webhooks/whatsapp`,
  });
});

/**
 * GET /api/whatsapp/templates
 * Fetches actual message templates from Meta Graph API
 */
app.get('/api/whatsapp/templates', async (req: Request, res: Response) => {
  const cursorAfter = req.query.after as string | undefined;
  const config = getMetaConfig();

  const result = await fetchTemplatesFromMeta(config, cursorAfter);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    templates: result.data || [],
    nextCursor: result.nextCursor,
  });
});

/**
 * POST /api/whatsapp/templates
 * Creates a message template in Meta Graph API
 */
app.post('/api/whatsapp/templates', async (req: Request, res: Response) => {
  const { name, category, language, components } = req.body;
  if (!name || !category || !language || !components) {
    return res.status(400).json({ error: 'Missing required template fields (name, category, language, components)' });
  }

  const config = getMetaConfig();
  const result = await createTemplateInMeta(config, { name, category, language, components });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json(result.data);
});

/**
 * GET /api/whatsapp/phone-numbers
 * Fetches registered phone numbers for the WABA
 */
app.get('/api/whatsapp/phone-numbers', async (_req: Request, res: Response) => {
  const config = getMetaConfig();
  const result = await fetchPhoneNumbersFromMeta(config);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ phoneNumbers: result.data || [] });
});

/**
 * POST /api/whatsapp/messages/send
 * Dispatches a single message via Cloud API
 */
app.post('/api/whatsapp/messages/send', async (req: Request, res: Response) => {
  const { to, type, template, text } = req.body;
  if (!to) {
    return res.status(400).json({ error: 'Recipient phone number (to) is required.' });
  }

  const cleanPhone = String(to).replace(/[^0-9]/g, '');
  const config = getMetaConfig();

  let payload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
  };

  if (type === 'template') {
    if (!template?.name) {
      return res.status(400).json({ error: 'Template name is required for template message type.' });
    }
    payload.type = 'template';
    payload.template = template;
  } else {
    payload.type = 'text';
    payload.text = {
      preview_url: false,
      body: text || '',
    };
  }

  const result = await sendWhatsAppMessage(config, payload);
  if (!result.success) {
    return res.status(400).json({
      error: result.error,
      errorCode: result.errorCode,
    });
  }

  res.json({
    success: true,
    wamid: result.wamid,
    data: result.data,
  });
});

/**
 * POST /api/whatsapp/campaigns/send-batch
 * Batch sends campaign recipients using Cloud API
 */
app.post('/api/whatsapp/campaigns/send-batch', async (req: Request, res: Response) => {
  const { recipients, templateName, languageCode, componentsGenerator } = req.body;
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'Recipients array is required.' });
  }

  const config = getMetaConfig();
  const results: Array<{
    recipientId: string;
    phone: string;
    success: boolean;
    wamid?: string;
    error?: string;
    errorCode?: number;
  }> = [];

  for (const item of recipients) {
    const cleanPhone = String(item.phone).replace(/[^0-9]/g, '');

    // Build parameters for template
    const parameters: Array<{ type: 'text'; text: string }> = [];
    if (item.variables) {
      Object.keys(item.variables)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((key) => {
          parameters.push({
            type: 'text',
            text: String(item.variables[key]),
          });
        });
    }

    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode || 'en_US',
        },
        components:
          parameters.length > 0
            ? [
                {
                  type: 'body',
                  parameters,
                },
              ]
            : undefined,
      },
    };

    const sendRes = await sendWhatsAppMessage(config, payload);
    results.push({
      recipientId: item.id || item.contactId,
      phone: item.phone,
      success: sendRes.success,
      wamid: sendRes.wamid,
      error: sendRes.error,
      errorCode: sendRes.errorCode,
    });
  }

  res.json({
    totalProcessed: results.length,
    sentCount: results.filter((r) => r.success).length,
    failedCount: results.filter((r) => !r.success).length,
    results,
  });
});

/**
 * GET /api/whatsapp/webhook-events
 * Returns the recent webhook event log for debugging and verification
 */
app.get('/api/whatsapp/webhook-events', (_req: Request, res: Response) => {
  res.json({
    total: webhookEventsBuffer.length,
    events: webhookEventsBuffer,
  });
});

/**
 * POST /api/whatsapp/test-handshake
 * Diagnostic route to verify the local webhook verification logic
 */
app.post('/api/whatsapp/test-handshake', (req: Request, res: Response) => {
  const { verifyToken } = req.body;
  const config = getMetaConfig();

  const isMatch = verifyToken === config.webhookVerifyToken;
  res.json({
    match: isMatch,
    configured: Boolean(config.webhookVerifyToken),
    message: isMatch
      ? 'Verify token matched server configuration successfully!'
      : 'Supplied verify token does NOT match server WHATSAPP_WEBHOOK_VERIFY_TOKEN.',
  });
});

// ============================================================================
// SERVER SETUP & VITE MOUNTING
// ============================================================================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`🚀 Webcraft WhatsApp Cloud API Server listening on http://${HOST}:${PORT}`);
    console.log(`📡 Meta Webhook Endpoint: http://${HOST}:${PORT}/api/webhooks/whatsapp`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
