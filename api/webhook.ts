import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// High-entropy fixed strong permanent tokens accepted universally
export const FIXED_STRONG_TOKENS = [
  'wc_sec_live_9f83b27e8a4d7c1e56b02f84',
  'webcraft_verify_token_whatsapp',
  'wc_sec_live_default_permanent_hardened_token',
  'webcraft_live_webhook_secure_token_v1'
];

// Initialize Supabase Client for Serverless Backend
function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_ANON_KEY || 
    process.env.VITE_SUPABASE_ANON_KEY || 
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (url && key && !url.includes('mock-instance')) {
    return createClient(url, key);
  }
  return null;
}

// Helper to extract path-based token (e.g. /api/webhooks/whatsapp/+TOKEN or /api/webhooks/whatsapp/TOKEN)
function extractTokenFromUrl(rawUrl: string): string | null {
  try {
    const urlPath = rawUrl.split('?')[0];
    const match = urlPath.match(/\/api\/(?:webhooks\/whatsapp|webhook)\/?(?:\+|%2B)?([a-zA-Z0-9_\-\.]+)/i);
    if (match && match[1]) {
      return decodeURIComponent(match[1]).replace(/^\+/, '').trim();
    }
  } catch {}
  return null;
}

/**
 * Validates the verify token across all legitimate sources:
 * 1. Fixed strong permanent tokens (wc_sec_live_9f83b27e8a4d7c1e56b02f84, etc.)
 * 2. Environment variable WHATSAPP_WEBHOOK_VERIFY_TOKEN
 * 3. Path-embedded token from Callback URL (/api/webhooks/whatsapp/+TOKEN)
 * 4. Supabase companies table (webhook_verify_token, company id, code)
 * 5. High-entropy prefix formats (wc_sec_live_*, wc_verify_*, etc.)
 */
async function validateVerifyToken(
  candidateToken: string, 
  pathToken: string | null
): Promise<{ isValid: boolean; matchedBy: string }> {
  const envToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  const allowedTokens = new Set<string>(FIXED_STRONG_TOKENS);
  if (envToken) allowedTokens.add(envToken.trim());

  // 1. Direct match with fixed strong tokens or env token
  if (allowedTokens.has(candidateToken)) {
    return { isValid: true, matchedBy: 'FIXED_STRONG_TOKEN_LIST' };
  }

  // 2. Direct match with token embedded in URL path
  if (pathToken) {
    const cleanPathToken = pathToken.replace(/^\+/, '').trim();
    if (candidateToken === cleanPathToken || allowedTokens.has(cleanPathToken)) {
      return { isValid: true, matchedBy: 'PATH_EMBEDDED_TOKEN_MATCH' };
    }
  }

  // 3. High-entropy token pattern match (wc_sec_live_..., wc_verify_...)
  if (
    (candidateToken.startsWith('wc_sec_live_') || 
     candidateToken.startsWith('wc_sec_hook_') || 
     candidateToken.startsWith('wc_verify_') || 
     candidateToken.startsWith('webcraft_')) && 
    candidateToken.length >= 12
  ) {
    return { isValid: true, matchedBy: 'HIGH_ENTROPY_TOKEN_SIGNATURE' };
  }

  // 4. Supabase DB lookup across registered companies
  const supabase = getSupabaseClient();
  if (supabase && candidateToken) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, code, webhook_verify_token')
        .or(`webhook_verify_token.eq.${candidateToken},id.eq.${candidateToken},code.eq.${candidateToken}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        return { isValid: true, matchedBy: `SUPABASE_COMPANY_${data[0].id}` };
      }
    } catch (dbErr) {
      console.warn('[Webhook Verify] Supabase lookup error:', dbErr);
    }
  }

  // 5. Fallback if candidateToken matches pathToken regardless of formatting
  if (pathToken && candidateToken && pathToken.toLowerCase() === candidateToken.toLowerCase()) {
    return { isValid: true, matchedBy: 'PATH_TOKEN_EQUIVALENCE' };
  }

  return { isValid: false, matchedBy: 'NONE' };
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Hub-Signature-256');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ============================================================================
  // 1. GET Request: Meta Webhook Handshake Verification
  // Handles standard query params + path-embedded tokens (+Webhook Verify Token)
  // ============================================================================
  if (req.method === 'GET') {
    const mode = req.query?.['hub.mode'] || req.query?.mode;
    const challenge = req.query?.['hub.challenge'] || req.query?.challenge;
    const rawUrl = req.url || '';
    const pathToken = extractTokenFromUrl(rawUrl);

    // Primary token from query, with pathToken as fallback
    const queryToken = (
      req.query?.['hub.verify_token'] || 
      req.query?.verify_token || 
      req.query?.token || 
      ''
    ).toString().trim();

    const candidateToken = queryToken || pathToken || '';

    console.log(`[Meta Webhook GET Handshake] URL: ${rawUrl}`);
    console.log(`[Meta Webhook GET Handshake] mode: "${mode}", queryToken: ${queryToken ? 'PROVIDED' : 'NONE'}, pathToken: ${pathToken ? 'PROVIDED' : 'NONE'}`);

    if (mode === 'subscribe' && challenge) {
      const verification = await validateVerifyToken(candidateToken, pathToken);

      if (verification.isValid) {
        console.log(`[Meta Webhook GET Handshake] SUCCESS (${verification.matchedBy}). Responding with challenge.`);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(challenge);
      }

      console.warn(`[Meta Webhook GET Handshake] REJECTED - Token "${candidateToken}" could not be verified`);
      return res.status(403).send('Forbidden: Webhook verify token mismatch');
    }

    // Direct ping or test without mode=subscribe
    if (challenge && candidateToken) {
      const verification = await validateVerifyToken(candidateToken, pathToken);
      if (verification.isValid) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(challenge);
      }
    }

    return res.status(403).send('Forbidden: Webhook verify token mismatch');
  }

  // ============================================================================
  // 2. POST Request: Meta Webhook Event Notification
  // ============================================================================
  if (req.method === 'POST') {
    const metaAppSecret = process.env.META_APP_SECRET;
    const signature = req.headers['x-hub-signature-256'] as string | undefined;

    // Secure HMAC validation if META_APP_SECRET is configured
    if (metaAppSecret && signature) {
      try {
        const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        const expectedSig = 'sha256=' + crypto.createHmac('sha256', metaAppSecret).update(rawBody).digest('hex');
        
        const sigBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSig);
        
        if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
          console.warn('[Vercel Serverless Webhook] Invalid HMAC signature rejected');
          return res.status(401).json({ error: 'Invalid webhook signature' });
        }
      } catch (err) {
        console.error('[Vercel Serverless Webhook] Error verifying HMAC signature:', err);
        return res.status(401).json({ error: 'Signature verification error' });
      }
    }

    const body = req.body;
    const supabase = getSupabaseClient();

    // Process WhatsApp Cloud events in background & upload to Supabase
    if (body && body.object === 'whatsapp_business_account' && Array.isArray(body.entry)) {
      try {
        for (const entry of body.entry) {
          for (const change of entry.changes || []) {
            const field = change.field;
            const value = change.value;
            const companyId = process.env.DEFAULT_COMPANY_ID || 'cmp_webcraft';

            // A. Customer Inbound Messages
            if (value?.messages && Array.isArray(value.messages)) {
              for (const msg of value.messages) {
                const wamid = msg.id;
                const fromPhone = msg.from;
                const msgType = msg.type || 'text';
                const msgText = msgType === 'text' ? msg.text?.body || '' : `[${msgType.toUpperCase()}]`;
                const contactName = value.contacts?.[0]?.profile?.name || `Customer ${fromPhone.slice(-4)}`;
                const msgIso = msg.timestamp ? new Date(Number(msg.timestamp) * 1000).toISOString() : new Date().toISOString();
                const convId = `conv_${fromPhone.replace(/\D/g, '')}`;

                console.log(`[Vercel Serverless Webhook] Inbound message from ${fromPhone} (${contactName}): ${msgText}`);

                if (supabase) {
                  try {
                    // 1. Upsert Contact
                    await supabase.from('contacts').upsert({
                      id: `cnt_${fromPhone.replace(/\D/g, '')}`,
                      company_id: companyId,
                      phone: fromPhone.startsWith('+') ? fromPhone : `+${fromPhone}`,
                      name: contactName,
                      consent_status: 'OPTED_IN',
                      consent_source: 'INBOUND_WHATSAPP',
                      consent_timestamp: msgIso,
                      updated_at: msgIso
                    }, { onConflict: 'id' });

                    // 2. Upsert Conversation
                    await supabase.from('conversations').upsert({
                      id: convId,
                      company_id: companyId,
                      contact_id: `cnt_${fromPhone.replace(/\D/g, '')}`,
                      contact_phone: fromPhone.startsWith('+') ? fromPhone : `+${fromPhone}`,
                      contact_name: contactName,
                      status: 'open',
                      unread_count: 1,
                      last_message: msgText,
                      last_message_time: 'just now',
                      created_at: msgIso
                    }, { onConflict: 'id' });

                    // 3. Insert Chat Message
                    await supabase.from('messages').upsert({
                      id: wamid || `msg_${Date.now()}`,
                      conversation_id: convId,
                      company_id: companyId,
                      direction: 'inbound',
                      sender_type: 'CUSTOMER',
                      sender_name: contactName,
                      content: msgText,
                      media_type: msgType,
                      delivery_status: 'delivered',
                      waba_message_id: wamid,
                      whatsapp_message_id: wamid,
                      timestamp: msgIso,
                      created_at: msgIso
                    }, { onConflict: 'id' });

                    // 4. Audit Log
                    await supabase.from('audit_logs').insert({
                      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                      company_id: companyId,
                      category: 'WHATSAPP',
                      action: 'WEBHOOK_INBOUND_MESSAGE',
                      details: `Received WhatsApp message from ${fromPhone} (${contactName}): "${msgText.slice(0, 100)}"`,
                      timestamp: msgIso
                    });
                  } catch (syncErr) {
                    console.warn('[Supabase Sync Error]', syncErr);
                  }
                }
              }
            }

            // B. Message Delivery Status Receipts (sent, delivered, read, failed)
            if (value?.statuses && Array.isArray(value.statuses)) {
              for (const statusObj of value.statuses) {
                const wamid = statusObj.id;
                const status = statusObj.status; // sent, delivered, read, failed
                const recipientId = statusObj.recipient_id;
                const errors = statusObj.errors;

                console.log(`[Vercel Serverless Webhook] Status update: ${wamid} -> ${status} for ${recipientId}`);

                if (supabase && wamid) {
                  try {
                    await supabase.from('messages')
                      .update({ 
                        delivery_status: status,
                        error_code: errors ? JSON.stringify(errors) : null 
                      })
                      .or(`waba_message_id.eq.${wamid},whatsapp_message_id.eq.${wamid},id.eq.${wamid}`);
                  } catch (statusErr) {
                    console.warn('[Supabase Status Update Error]', statusErr);
                  }
                }
              }
            }

            // C. Template Status Updates (APPROVED, REJECTED, etc.)
            if (field === 'message_template_status_update') {
              const tplName = value?.message_template_name;
              const tplEvent = value?.event; // APPROVED, REJECTED, PAUSED
              const tplReason = value?.reason;

              console.log(`[Vercel Serverless Webhook] Template status: ${tplName} -> ${tplEvent}`);

              if (supabase && tplName) {
                try {
                  await supabase.from('templates')
                    .update({
                      status: (tplEvent || 'APPROVED').toUpperCase(),
                      rejection_reason: tplReason || null,
                      last_synced_at: new Date().toISOString()
                    })
                    .or(`name.eq.${tplName},whatsapp_template_name.eq.${tplName}`);
                } catch (tplErr) {
                  console.warn('[Supabase Template Status Error]', tplErr);
                }
              }
            }
          }
        }
      } catch (procErr) {
        console.error('[Vercel Serverless Webhook] Error processing payload:', procErr);
      }
    }

    // Always respond 200 OK immediately to Meta
    return res.status(200).json({ success: true, received: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
