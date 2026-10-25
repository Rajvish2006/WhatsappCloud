import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Send, 
  Radio, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  MessageSquare, 
  Layers, 
  Terminal, 
  Check, 
  Copy,
  ExternalLink,
  Coins,
  Zap
} from 'lucide-react';

export const WhatsAppIntegration: React.FC = () => {
  const {
    wabaConfig,
    templates,
    updateWabaConfig,
    syncTemplatesFromMeta,
    simulateIncomingWebhook,
    sendTestOutboundMessage
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'templates' | 'webhooks'>('templates');

  // Test Outbound State
  const [testToPhone, setTestToPhone] = useState('+14155552671');
  const [testMessageText, setTestMessageText] = useState('Hello! This is a test message from OmniWABA Cloud API.');
  const [testOutboundCategory, setTestOutboundCategory] = useState<'UTILITY' | 'MARKETING'>('UTILITY');
  const [outboundStatus, setOutboundStatus] = useState<string | null>(null);

  // Webhook Simulator State
  const [simWebhookType, setSimWebhookType] = useState<'MESSAGE' | 'STATUS_UPDATE'>('MESSAGE');
  const [simCustomerPhone, setSimCustomerPhone] = useState('+14155559988');
  const [simCustomerName, setSimCustomerName] = useState('Alexander Wright');
  const [simCustomerText, setSimCustomerText] = useState('Hi! What is the pricing for your wholesale orders?');
  const [simMessageId, setSimMessageId] = useState('wamid.HBgLMTQxNTU1NTI2NzEVAgARGBI1R');
  const [simDeliveryStatus, setSimDeliveryStatus] = useState<'sent' | 'delivered' | 'read' | 'failed'>('delivered');
  const [simErrorCode, setSimErrorCode] = useState('131026');
  const [simValidHmac, setSimValidHmac] = useState(true);
  const [webhookLog, setWebhookLog] = useState<string | null>(null);

  const handleSyncClick = () => {
    setIsSyncing(true);
    syncTemplatesFromMeta();
    setTimeout(() => setIsSyncing(false), 900);
  };

  const handleSendTestOutbound = (e: React.FormEvent) => {
    e.preventDefault();
    const res = sendTestOutboundMessage(testToPhone, testMessageText, testOutboundCategory);
    if (res.success) {
      setOutboundStatus(`Success: Dispatched outbound message to ${testToPhone}. Consumed 1 ${testOutboundCategory} credit.`);
    } else {
      setOutboundStatus(`Failed: ${res.error}`);
    }
    setTimeout(() => setOutboundStatus(null), 6000);
  };

  const handleTriggerWebhook = () => {
    let payload: any = {};
    if (simWebhookType === 'MESSAGE') {
      payload = {
        fromPhone: simCustomerPhone,
        senderName: simCustomerName,
        text: simCustomerText
      };
    } else {
      payload = {
        wabaMessageId: simMessageId,
        status: simDeliveryStatus,
        errorCode: simDeliveryStatus === 'failed' ? simErrorCode : undefined
      };
    }

    const res = simulateIncomingWebhook(simWebhookType, payload, simValidHmac);
    setWebhookLog(res.log);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-green-500/10 text-green-400 border border-green-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              P0 Requirement
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Meta WhatsApp Cloud API Integration & Webhooks
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Token verification, Meta Graph API v21 synchronization, HMAC-SHA256 signature verification & error handling.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSyncClick}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing with Meta...' : 'Sync Meta Templates'}</span>
          </button>
        </div>
      </div>

      {/* Connectivity & Health Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">{wabaConfig.verifiedName}</h2>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Verified Official WABA
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Display: {wabaConfig.displayPhoneNumber} &bull; Phone ID: {wabaConfig.phoneNumberId}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block">Quality Rating</span>
              <strong className="text-emerald-400 font-bold">{wabaConfig.qualityRating} (High)</strong>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block">Messaging Tier</span>
              <strong className="text-indigo-400 font-bold">{wabaConfig.metaTier} / 24h</strong>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block">HMAC Signature</span>
              <strong className="text-emerald-400 font-bold">SHA-256 Active</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'templates'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Meta Message Templates ({templates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'webhooks'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Interactive Webhook Simulator & HMAC Validator</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'config'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Cloud API Credentials & Outbound Tester</span>
        </button>
      </div>

      {/* TAB 1: TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div key={tpl.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{tpl.name}</span>
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        tpl.category === 'MARKETING'
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                          : tpl.category === 'UTILITY'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}>
                        {tpl.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        tpl.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {tpl.status}
                      </span>
                    </div>
                  </div>

                  {tpl.rejectionReason && (
                    <div className="mt-2 p-2.5 rounded bg-rose-950/40 border border-rose-500/40 text-[11px] text-rose-300">
                      <strong>Meta Policy Rejection:</strong> {tpl.rejectionReason}
                    </div>
                  )}

                  {/* WhatsApp Preview Bubble */}
                  <div className="mt-3 p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs text-slate-200 font-sans space-y-1.5">
                    {tpl.headerText && (
                      <div className="font-bold text-white text-xs">{tpl.headerText}</div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{tpl.bodyText}</p>
                    {tpl.footerText && (
                      <div className="text-[10px] text-slate-400 pt-1">{tpl.footerText}</div>
                    )}
                  </div>

                  {/* Buttons preview */}
                  {tpl.buttons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tpl.buttons.map((b, i) => (
                        <div key={i} className="px-2.5 py-1 rounded bg-slate-800 text-[11px] font-semibold text-emerald-300 border border-slate-700">
                          {b.text} {b.type === 'URL' && '↗'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Language: {tpl.language} &bull; Variables: {tpl.variablesCount}</span>
                  <span>Synced: {new Date(tpl.lastSyncedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE WEBHOOK SIMULATOR */}
      {activeTab === 'webhooks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-5">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Webhook Simulator & HMAC Signature Validator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate inbound customer messages or delivery status callbacks sent by Meta Cloud API. Validates <code>X-Hub-Signature-256</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Webhook Event Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimWebhookType('MESSAGE')}
                    className={`p-2.5 rounded-lg border font-semibold flex items-center space-x-2 ${
                      simWebhookType === 'MESSAGE'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Inbound Customer Message</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimWebhookType('STATUS_UPDATE')}
                    className={`p-2.5 rounded-lg border font-semibold flex items-center space-x-2 ${
                      simWebhookType === 'STATUS_UPDATE'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    <span>Message Delivery Status</span>
                  </button>
                </div>
              </div>

              {simWebhookType === 'MESSAGE' ? (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1">Customer Phone Number (E.164)</label>
                    <input
                      type="text"
                      value={simCustomerPhone}
                      onChange={(e) => setSimCustomerPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={simCustomerName}
                      onChange={(e) => setSimCustomerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Customer Message Content</label>
                    <textarea
                      rows={3}
                      value={simCustomerText}
                      onChange={(e) => setSimCustomerText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1">Meta WAMID (Message ID)</label>
                    <input
                      type="text"
                      value={simMessageId}
                      onChange={(e) => setSimMessageId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Delivery Transition Status</label>
                    <select
                      value={simDeliveryStatus}
                      onChange={(e) => setSimDeliveryStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      <option value="sent">sent</option>
                      <option value="delivered">delivered</option>
                      <option value="read">read</option>
                      <option value="failed">failed (Triggers automatic credit refund!)</option>
                    </select>
                  </div>

                  {simDeliveryStatus === 'failed' && (
                    <div>
                      <label className="block text-slate-400 mb-1">Meta Error Code</label>
                      <select
                        value={simErrorCode}
                        onChange={(e) => setSimErrorCode(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                      >
                        <option value="131026">131026 — Message undeliverable</option>
                        <option value="130429">130429 — Rate limit hit</option>
                        <option value="131047">131047 — Re-engagement window expired</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* HMAC Signature Toggle */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Valid HMAC-SHA256 Signature</div>
                  <div className="text-[10px] text-slate-400">Toggle to simulate tampering or invalid webhook secret</div>
                </div>
                <input
                  type="checkbox"
                  checked={simValidHmac}
                  onChange={(e) => setSimValidHmac(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </div>

              <button
                onClick={handleTriggerWebhook}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition shadow-md shadow-emerald-950/50"
              >
                Dispatch Webhook Payload
              </button>
            </div>

            {/* Live Webhook Output & Payload Inspector */}
            <div className="space-y-3">
              <div className="font-bold text-xs text-slate-300">Meta Webhook Payload Inspector</div>
              <div className="p-4 bg-black/80 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-72">
                <pre>{JSON.stringify({
                  object: 'whatsapp_business_account',
                  entry: [{
                    id: wabaConfig.wabaId,
                    changes: [{
                      value: simWebhookType === 'MESSAGE' ? {
                        messaging_product: 'whatsapp',
                        metadata: { display_phone_number: wabaConfig.displayPhoneNumber, phone_number_id: wabaConfig.phoneNumberId },
                        contacts: [{ profile: { name: simCustomerName }, wa_id: simCustomerPhone.replace('+', '') }],
                        messages: [{ from: simCustomerPhone, id: `wamid.HBgL${Date.now()}`, timestamp: `${Math.floor(Date.now() / 1000)}`, text: { body: simCustomerText }, type: 'text' }]
                      } : {
                        messaging_product: 'whatsapp',
                        statuses: [{ id: simMessageId, status: simDeliveryStatus, timestamp: `${Math.floor(Date.now() / 1000)}`, errors: simDeliveryStatus === 'failed' ? [{ code: parseInt(simErrorCode), title: 'Delivery failed' }] : undefined }]
                      },
                      field: 'messages'
                    }]
                  }]
                }, null, 2)}</pre>
              </div>

              {webhookLog && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200">
                  <span className="text-emerald-400 font-bold block mb-1">Server Event Result:</span>
                  {webhookLog}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIG & DIRECT OUTBOUND */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 text-xs">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Send className="w-4 h-4 text-indigo-400" />
              <span>Direct Outbound Dispatch Test</span>
            </h2>

            <form onSubmit={handleSendTestOutbound} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Recipient Phone Number (E.164)</label>
                <input
                  type="text"
                  value={testToPhone}
                  onChange={(e) => setTestToPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Credit Deduction Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTestOutboundCategory('UTILITY')}
                    className={`p-2 rounded-lg border text-left font-semibold flex items-center space-x-2 ${
                      testOutboundCategory === 'UTILITY'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Utility (1 Credit)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTestOutboundCategory('MARKETING')}
                    className={`p-2 rounded-lg border text-left font-semibold flex items-center space-x-2 ${
                      testOutboundCategory === 'MARKETING'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Marketing (1 Credit)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Message Text</label>
                <textarea
                  rows={3}
                  value={testMessageText}
                  onChange={(e) => setTestMessageText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition"
              >
                Dispatch Test Message
              </button>

              {outboundStatus && (
                <div className={`p-3 rounded-lg text-xs font-medium ${
                  outboundStatus.startsWith('Success')
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
                }`}>
                  {outboundStatus}
                </div>
              )}
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3 text-xs">
            <h2 className="text-sm font-bold text-white">Meta Cloud API Production Credentials</h2>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">WABA Account ID</span>
                <span className="font-mono text-white font-semibold">{wabaConfig.wabaId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Phone Number ID</span>
                <span className="font-mono text-white font-semibold">{wabaConfig.phoneNumberId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">System User Token (Encrypted)</span>
                <span className="font-mono text-slate-300">{wabaConfig.accessTokenMasked}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Webhook Verify Token</span>
                <span className="font-mono text-slate-300">{wabaConfig.webhookVerifyToken}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Configured for Graph API v21.0. Webhook endpoint routes incoming delivery receipts directly to background batch workers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
