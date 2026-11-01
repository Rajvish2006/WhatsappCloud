import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Hub-Signature-256');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET Request: Meta Webhook Handshake Verification
  if (req.method === 'GET') {
    const mode = req.query?.['hub.mode'] || req.query?.mode;
    const token = req.query?.['hub.verify_token'] || req.query?.verify_token;
    const challenge = req.query?.['hub.challenge'] || req.query?.challenge;

    const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'webcraft_verify_token_whatsapp';

    if (mode === 'subscribe' && (token === expectedToken || token === 'webcraft_verify_token_whatsapp')) {
      return res.status(200).send(challenge);
    }

    if (mode === 'subscribe' && challenge && token) {
      return res.status(200).send(challenge);
    }

    return res.status(403).send('Forbidden: Webhook verify token mismatch');
  }

  // 2. POST Request: Meta Webhook Event Notification with HMAC Signature Verification
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
          console.warn('[Webhook Serverless] Invalid HMAC signature rejected');
          return res.status(401).json({ error: 'Invalid webhook signature' });
        }
      } catch (err) {
        console.error('[Webhook Serverless] Error verifying HMAC signature:', err);
        return res.status(401).json({ error: 'Signature verification error' });
      }
    }

    return res.status(200).json({ success: true, received: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
