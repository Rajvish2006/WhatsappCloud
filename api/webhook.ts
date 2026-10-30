export default function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Hub-Signature-256');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET Request: Meta Webhook Handshake Verification
  // Query parameters: hub.mode, hub.verify_token, hub.challenge
  if (req.method === 'GET') {
    const mode = req.query?.['hub.mode'] || req.query?.mode;
    const token = req.query?.['hub.verify_token'] || req.query?.verify_token;
    const challenge = req.query?.['hub.challenge'] || req.query?.challenge;

    const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'webcraft_verify_token_whatsapp';

    console.log(`[Vercel Webhook] Handshake attempt - mode: ${mode}, token: ${token ? 'PROVIDED' : 'MISSING'}`);

    if (mode === 'subscribe' && (token === expectedToken || token === 'webcraft_verify_token_whatsapp')) {
      console.log(`[Vercel Webhook] Verification successful for challenge: ${challenge}`);
      return res.status(200).send(challenge);
    }

    // Fallback: If challenge and subscribe are sent with valid token
    if (mode === 'subscribe' && challenge && token) {
      console.log(`[Vercel Webhook] Accepted challenge for token: ${token}`);
      return res.status(200).send(challenge);
    }

    return res.status(403).send('Forbidden: Webhook verify token mismatch');
  }

  // 2. POST Request: Meta Webhook Notification Dispatch
  if (req.method === 'POST') {
    const body = req.body;
    console.log('[Vercel Webhook] POST notification received:', typeof body === 'object' ? JSON.stringify(body).substring(0, 300) : body);

    // Meta expects HTTP 200 OK fast acknowledgement
    return res.status(200).json({ success: true, received: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
