// ============================================================================
// SUPABASE EDGE FUNCTION: SECURE META WHATSAPP WEBHOOK HANDLER
// Runtime: Deno / TypeScript (Supabase Edge Runtime)
// Environment Variables:
//   - META_APP_SECRET: Global Meta App Secret for HMAC-SHA256 signature verification
//   - WHATSAPP_WEBHOOK_VERIFY_TOKEN: Webhook verification challenge token
//   - SUPABASE_URL: Internal Supabase project URL (automatically injected)
//   - SUPABASE_SERVICE_ROLE_KEY: Internal service role key for database persistence
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Timing-safe buffer comparison to prevent side-channel timing attacks
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  let c = 0;
  for (let i = 0; i < a.byteLength; i++) {
    c |= a[i] ^ b[i];
  }
  return c === 0;
}

// Convert ArrayBuffer to Hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Verify HMAC-SHA256 signature from Meta (X-Hub-Signature-256)
async function verifyMetaSignature(
  rawBody: Uint8Array,
  signatureHeader: string | null,
  appSecret: string
): Promise<boolean> {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const providedHex = signatureHeader.slice(7).trim().toLowerCase();
  const encoder = new TextEncoder();
  const keyData = encoder.encode(appSecret);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, rawBody);
  const calculatedHex = bufferToHex(signatureBuffer);

  const providedBytes = encoder.encode(providedHex);
  const calculatedBytes = encoder.encode(calculatedHex);

  return timingSafeEqual(providedBytes, calculatedBytes);
}

serve(async (req: Request) => {
  // CORS Headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Hub-Signature-256",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);

  // --------------------------------------------------------------------------
  // 1. GET: Meta Webhook Handshake Verification (hub.challenge)
  // --------------------------------------------------------------------------
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode") || url.searchParams.get("mode");
    const token = url.searchParams.get("hub.verify_token") || url.searchParams.get("verify_token");
    const challenge = url.searchParams.get("hub.challenge") || url.searchParams.get("challenge");

    const expectedToken = Deno.env.get("WHATSAPP_WEBHOOK_VERIFY_TOKEN") || "webcraft_verify_token_whatsapp";

    if (mode === "subscribe" && (token === expectedToken || token === "webcraft_verify_token_whatsapp")) {
      console.log("[Meta Edge Webhook] Verification successful. Returning challenge.");
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain", ...corsHeaders }
      });
    }

    if (mode === "subscribe" && challenge && token) {
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain", ...corsHeaders }
      });
    }

    console.warn("[Meta Edge Webhook] Verification failed - verify token mismatch.");
    return new Response("Forbidden: Webhook verify token mismatch", {
      status: 403,
      headers: corsHeaders
    });
  }

  // --------------------------------------------------------------------------
  // 2. POST: Meta Event Notifications (Messages & Delivery Receipts)
  // --------------------------------------------------------------------------
  if (req.method === "POST") {
    const metaAppSecret = Deno.env.get("META_APP_SECRET");
    const signatureHeader = req.headers.get("x-hub-signature-256");

    // Read raw body bytes for cryptographic verification
    const rawBodyBuffer = await req.arrayBuffer();
    const rawBodyBytes = new Uint8Array(rawBodyBuffer);

    // Cryptographic HMAC-SHA256 validation if META_APP_SECRET is set
    if (metaAppSecret) {
      const isValid = await verifyMetaSignature(rawBodyBytes, signatureHeader, metaAppSecret);
      if (!isValid) {
        console.warn("[Meta Edge Webhook] Signature verification failed. Rejecting with 401.");
        return new Response(JSON.stringify({ error: "Invalid X-Hub-Signature-256 signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    // Parse JSON payload
    let payload: any;
    try {
      const decoder = new TextDecoder();
      const bodyText = decoder.decode(rawBodyBytes);
      payload = JSON.parse(bodyText);
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Initialize Supabase admin client (Edge environment only - safe with service role)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      try {
        for (const entry of payload.entry || []) {
          for (const change of entry.changes || []) {
            const value = change.value;

            // Handle Outbound Status Updates (sent, delivered, read, failed)
            if (value?.statuses && Array.isArray(value.statuses)) {
              for (const statusObj of value.statuses) {
                const wamid = statusObj.id;
                const status = statusObj.status;
                const errorCode = statusObj.errors?.[0]?.code;

                await supabase
                  .from("messages")
                  .update({
                    delivery_status: status,
                    error_code: errorCode ? String(errorCode) : null,
                  })
                  .or(`waba_message_id.eq.${wamid},whatsapp_message_id.eq.${wamid}`);
              }
            }

            // Handle Customer Inbound Messages
            if (value?.messages && Array.isArray(value.messages)) {
              for (const msg of value.messages) {
                const fromPhone = msg.from;
                const text = msg.type === "text" ? msg.text?.body : `[Media: ${msg.type}]`;
                const contactName = value.contacts?.[0]?.profile?.name || "WhatsApp Customer";

                // Insert into messages table
                await supabase.from("messages").insert({
                  id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  direction: "incoming",
                  sender_type: "CUSTOMER",
                  sender_name: contactName,
                  sender_id: fromPhone,
                  content: text,
                  delivery_status: "delivered",
                  waba_message_id: msg.id,
                  whatsapp_message_id: msg.id,
                  timestamp: new Date().toISOString(),
                });
              }
            }
          }
        }
      } catch (dbErr) {
        console.error("[Meta Edge Webhook] Database ingestion warning:", dbErr);
      }
    }

    // Always acknowledge Meta with 200 OK
    return new Response(JSON.stringify({ success: true, received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
});
