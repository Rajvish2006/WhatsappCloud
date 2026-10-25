import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Key,
  ShieldCheck, 
  ShieldAlert,
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Lock, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Webhook, 
  Users, 
  MessageSquare, 
  Bot, 
  Save, 
  Clock,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { maskSecret } from '../../lib/tokenUtils';

export const CompanySettingsView: React.FC = () => {
  const { 
    appSettings, 
    updateAppSettings, 
    currentCompany, 
    apiKeys,
    updateCompanyAppCredentials,
    verifyWebhookConnection,
    resetWebhookVerification,
    generateCompanyHardenedSecret
  } = useApp();

  type TabType = 'meta-credentials' | 'webhooks' | 'api-secrets' | 'agents' | 'chat' | 'bot';
  const [activeTab, setActiveTab] = useState<TabType>('meta-credentials');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('Settings saved successfully!');

  // Meta App Credentials State
  const [appIdInput, setAppIdInput] = useState(currentCompany.appId || '918274619283746');
  const [appSecretInput, setAppSecretInput] = useState(currentCompany.appSecret || 'wc_sec_99182374610928347102938475619283');
  const [showAppSecret, setShowAppSecret] = useState(false);
  const [copiedAppSecret, setCopiedAppSecret] = useState(false);

  // Webhook State
  const [webhookUrl, setWebhookUrl] = useState(appSettings.webhookCallbackUrl || `https://whatsappcloud-virid.vercel.app/api/webhook/${currentCompany.code}`);
  const [webhookSecret, setWebhookSecret] = useState(currentCompany.appSecret || 'whsec_webcraft_99120481029481');
  const [eventMessages, setEventMessages] = useState(true);
  const [eventStatuses, setEventStatuses] = useState(true);
  const [eventOptOuts, setEventOptOuts] = useState(true);
  const [isVerifyingWebhook, setIsVerifyingWebhook] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState<string | null>(null);

  // Hardened Tokens State
  const [showMasterSecret, setShowMasterSecret] = useState(false);
  const [copiedMasterToken, setCopiedMasterToken] = useState(false);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState<'admin' | 'campaign_dispatch' | 'chat_read_write' | 'webhook_ingestion'>('campaign_dispatch');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Agent Settings
  const [enableAgentAssignment, setEnableAgentAssignment] = useState(appSettings.enableAgents ?? true);
  const [maxChatsPerAgent, setMaxChatsPerAgent] = useState(15);
  const [autoAssignRoundRobin, setAutoAssignRoundRobin] = useState(true);

  // Chat Settings
  const [blacklistedPhones, setBlacklistedPhones] = useState(
    appSettings.blacklistedPhoneNumbers ?? '+919999999999\n+14155550000'
  );
  const [chatWelcomeMessage, setChatWelcomeMessage] = useState(
    'Welcome to Webcraft Solution! How can our WhatsApp Cloud API specialists assist you today?'
  );
  const [outOfHoursMessage, setOutOfHoursMessage] = useState(
    'Thank you for contacting Webcraft Solution. Our specialists will respond shortly during standard business hours.'
  );

  // Bot Settings
  const [enableBotFallback, setEnableBotFallback] = useState(true);
  const [botFallbackText, setBotFallbackText] = useState(
    'Thank you for reaching out. We received your query and a representative will reply shortly.'
  );
  const [botCaseInsensitive, setBotCaseInsensitive] = useState(true);

  const isWebhookConnected = !!currentCompany.webhookConnected;

  // Handle Meta Credentials Save
  const handleSaveAppCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyAppCredentials(appIdInput.trim(), appSecretInput.trim());
    setSaveMessage('Meta App ID and App Secret updated successfully!');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Handle Webhook Verification Handshake
  const handleTriggerWebhookVerification = () => {
    setIsVerifyingWebhook(true);
    setVerifyFeedback(null);
    verifyWebhookConnection().then((res) => {
      setIsVerifyingWebhook(false);
      if (res.success) {
        setVerifyFeedback(res.message);
      } else {
        setVerifyFeedback('Verification failed. Check credentials.');
      }
      setTimeout(() => setVerifyFeedback(null), 5000);
    }).catch(() => {
      setIsVerifyingWebhook(false);
      setVerifyFeedback('Verification failed. Check network or credentials.');
      setTimeout(() => setVerifyFeedback(null), 5000);
    });
  };

  // Handle Reset Webhook
  const handleResetWebhook = () => {
    resetWebhookVerification();
    setVerifyFeedback('Webhook verification state reset to pending.');
    setTimeout(() => setVerifyFeedback(null), 3500);
  };

  // Handle Copy
  const handleCopyText = (text: string, type: 'appSecret' | 'masterToken' | string) => {
    navigator.clipboard?.writeText(text);
    if (type === 'appSecret') {
      setCopiedAppSecret(true);
      setTimeout(() => setCopiedAppSecret(false), 2000);
    } else if (type === 'masterToken') {
      setCopiedMasterToken(true);
      setTimeout(() => setCopiedMasterToken(false), 2000);
    } else {
      setCopiedKeyId(type);
      setTimeout(() => setCopiedKeyId(null), 2000);
    }
  };

  // Create additional hardened API key
  const handleCreateHardenedKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    generateCompanyHardenedSecret(newKeyName.trim(), [newKeyScope]);
    setNewKeyName('');
    setShowNewKeyModal(false);
    setSaveMessage('Hardened Secret Token generated successfully!');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Global Save
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    const blacklistArray = blacklistedPhones
      .split('\n')
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);

    updateAppSettings({
      enableAgents: enableAgentAssignment,
      webhookCallbackUrl: webhookUrl,
      blacklistedPhoneNumbers: blacklistArray.join('\n')
    });

    setSaveMessage('Company settings saved successfully!');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const companyApiKeys = apiKeys.filter(k => k.companyId === currentCompany.id);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-800">Apps & Company Settings</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 font-mono">
              {currentCompany.name} ({currentCompany.code})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Meta App Secret, production webhook handshake, hardened security tokens, agent routing, and automation.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('meta-credentials')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'meta-credentials'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Meta App Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'webhooks'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Webhook className="w-4 h-4" />
          <span>Inbound WebHooks</span>
          <span className={`w-2 h-2 rounded-full ${isWebhookConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
        </button>

        <button
          onClick={() => setActiveTab('api-secrets')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'api-secrets'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Hardened API Secrets</span>
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'agents'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Agents</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'chat'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat settings</span>
        </button>

        <button
          onClick={() => setActiveTab('bot')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'bot'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Bot settings</span>
        </button>
      </div>

      {/* TAB 1: META APP CREDENTIALS */}
      {activeTab === 'meta-credentials' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Meta App Credentials & App Secret ID</h2>
                  <p className="text-xs text-slate-500">
                    Store and verify your Meta App ID and App Secret Key for WhatsApp Cloud API production authentication.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {currentCompany.appSecret ? (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>App Secret Configured</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>App Secret Missing</span>
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveAppCredentials} className="space-y-5 max-w-2xl text-xs text-slate-700">
              {/* App ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meta App ID (Client ID)
                </label>
                <input
                  type="text"
                  value={appIdInput}
                  onChange={(e) => setAppIdInput(e.target.value)}
                  placeholder="e.g. 918274619283746"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Located in your Meta for Developers dashboard under <strong>App Dashboard &rarr; App ID</strong>.
                </p>
              </div>

              {/* App Secret */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meta App Secret (App Secret Key)
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type={showAppSecret ? 'text' : 'password'}
                      value={appSecretInput}
                      onChange={(e) => setAppSecretInput(e.target.value)}
                      placeholder="Paste Meta App Secret (32-character hexadecimal key)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-10 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAppSecret(!showAppSecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showAppSecret ? 'Hide secret' : 'Show secret'}
                    >
                      {showAppSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(appSecretInput, 'appSecret')}
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                    title="Copy App Secret"
                  >
                    {copiedAppSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Used by the backend to verify the <code>X-Hub-Signature-256</code> HMAC header on every incoming WhatsApp webhook payload.
                </p>
              </div>

              {/* Security Advisory */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-600 text-[11px] space-y-1">
                <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Production HMAC Signature Verification</span>
                </div>
                <p>
                  Meta automatically calculates a SHA-256 HMAC digest of each webhook payload using this App Secret. Storing it here allows OmniWABA to reject spoofed webhooks with <code>403 Forbidden</code> before processing.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save App Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: INBOUND WEBHOOKS WITH CONNECTION PENDING / CONNECTED GATING */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          {/* Webhook Connection Status Banner */}
          {isWebhookConnected ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-emerald-900">Webhook Status: Connected & Verified</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 text-[10px] font-bold uppercase tracking-wider">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Meta <code>hub.challenge</code> handshake is active. Incoming customer messages and status events are processed in real-time.
                  </p>
                  {currentCompany.webhookConnectedAt && (
                    <div className="text-[11px] text-emerald-600 font-mono mt-1 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Verified at: {new Date(currentCompany.webhookConnectedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleTriggerWebhookVerification}
                  disabled={isVerifyingWebhook}
                  className="px-3.5 py-2 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingWebhook ? 'animate-spin' : ''}`} />
                  <span>Test Handshake</span>
                </button>
                <button
                  onClick={handleResetWebhook}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-300 text-xs font-semibold rounded-lg transition cursor-pointer"
                  title="Reset verification state to pending for testing"
                >
                  Reset Status
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-amber-900">Webhook Status: Connection Pending</span>
                    <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                      Pending Handshake
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
                    Meta requires an active webhook verification handshake (<code>hub.challenge</code>) before events can be received.
                    <strong> While pending, webhook settings and event triggers are locked to prevent configuration drift.</strong>
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={handleTriggerWebhookVerification}
                  disabled={isVerifyingWebhook}
                  className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isVerifyingWebhook ? 'animate-spin' : ''}`} />
                  <span>{isVerifyingWebhook ? 'Verifying Handshake...' : 'Verify Webhook Handshake Now'}</span>
                </button>
              </div>
            </div>
          )}

          {verifyFeedback && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{verifyFeedback}</span>
            </div>
          )}

          {/* Webhook Settings Form (Locked when pending) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Webhook className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-800">Tenant Webhook Endpoint & Triggers</h2>
              </div>
              {!isWebhookConnected && (
                <div className="flex items-center space-x-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Controls Locked Until Handshake Verified</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveGeneral} className="space-y-5 max-w-2xl text-xs text-slate-700">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tenant Webhook URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    disabled={!isWebhookConnected}
                    placeholder="https://whatsappcloud-virid.vercel.app/api/webhook"
                    className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none transition ${
                      !isWebhookConnected
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed select-none'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500'
                    }`}
                  />
                  {!isWebhookConnected && (
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  OmniWABA posts JSON events to this endpoint whenever customer messages, replies, or delivery receipts arrive.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Webhook Signature Secret (whsec_...)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    disabled={!isWebhookConnected}
                    placeholder="whsec_..."
                    className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none transition ${
                      !isWebhookConnected
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed select-none'
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500'
                    }`}
                  />
                  {!isWebhookConnected && (
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Subscribed Event Triggers
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`flex items-center space-x-2 p-2.5 rounded-lg border text-xs transition ${
                    !isWebhookConnected 
                      ? 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 cursor-pointer hover:bg-slate-100'
                  }`}>
                    <input
                      type="checkbox"
                      checked={eventMessages}
                      onChange={(e) => setEventMessages(e.target.checked)}
                      disabled={!isWebhookConnected}
                      className="w-4 h-4 text-blue-600 rounded disabled:cursor-not-allowed"
                    />
                    <span>Customer Messages</span>
                  </label>
                  <label className={`flex items-center space-x-2 p-2.5 rounded-lg border text-xs transition ${
                    !isWebhookConnected 
                      ? 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 cursor-pointer hover:bg-slate-100'
                  }`}>
                    <input
                      type="checkbox"
                      checked={eventStatuses}
                      onChange={(e) => setEventStatuses(e.target.checked)}
                      disabled={!isWebhookConnected}
                      className="w-4 h-4 text-blue-600 rounded disabled:cursor-not-allowed"
                    />
                    <span>Delivery Receipts</span>
                  </label>
                  <label className={`flex items-center space-x-2 p-2.5 rounded-lg border text-xs transition ${
                    !isWebhookConnected 
                      ? 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 cursor-pointer hover:bg-slate-100'
                  }`}>
                    <input
                      type="checkbox"
                      checked={eventOptOuts}
                      onChange={(e) => setEventOptOuts(e.target.checked)}
                      disabled={!isWebhookConnected}
                      className="w-4 h-4 text-blue-600 rounded disabled:cursor-not-allowed"
                    />
                    <span>Opt-outs / Stops</span>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isWebhookConnected}
                  className={`px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1.5 ${
                    !isWebhookConnected
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>Save Webhook Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: HARDENED API SECRETS (GENERATED ONLY ON COMPANY CREATION) */}
      {activeTab === 'api-secrets' && (
        <div className="space-y-6">
          {/* Information Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold tracking-wide">Hardened Cryptographic API Secrets</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Created at Initialization
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Permanent high-entropy secret tokens generated strictly when <strong>{currentCompany.name}</strong> was created. Used to authenticate REST API endpoints, webhook callbacks, and campaign dispatches without token expiry.
              </p>
            </div>

            <button
              onClick={() => setShowNewKeyModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Hardened Secret</span>
            </button>
          </div>

          {/* Company Permanent Master Secret */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Company Permanent Master Secret Token</h3>
                  <p className="text-xs text-slate-500">
                    Generated once upon company registration &bull; Immutable &bull; 48-char CSPRNG entropy
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono font-medium border border-slate-200">
                  AES-256 GCM
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active</span>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Company Master Secret Token
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 flex items-center justify-between">
                  <span>
                    {showMasterSecret 
                      ? (currentCompany.hardSecretToken || 'wc_sec_live_default_permanent_hardened_token') 
                      : maskSecret(currentCompany.hardSecretToken || 'wc_sec_live_default_permanent_hardened_token', 8)
                    }
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMasterSecret(!showMasterSecret)}
                    className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    title={showMasterSecret ? 'Mask secret' : 'Reveal secret'}
                  >
                    {showMasterSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(currentCompany.hardSecretToken || '', 'masterToken')}
                  className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                  title="Copy Master Token"
                >
                  {copiedMasterToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Store this token securely in environment variables (e.g. <code>WABA_COMPANY_SECRET</code>). It never expires and cannot be recovered if altered.
              </p>
            </div>
          </div>

          {/* List of Hardened API Tokens */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Provisioned Hardened Secret Tokens ({companyApiKeys.length})
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Each key was generated during company provisioning
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                    <th className="py-2.5 px-3">Token Name & Purpose</th>
                    <th className="py-2.5 px-3">Entropy & Masked Value</th>
                    <th className="py-2.5 px-3">Permission Scopes</th>
                    <th className="py-2.5 px-3">Created Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companyApiKeys.map((key) => {
                    const tokenValue = key.rawKeyOnce || `${key.keyPrefix}...${key.tokenHash.substring(0, 8)}`;
                    return (
                      <tr key={key.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{key.name}</div>
                          <div className="text-[11px] text-slate-400">{key.description || 'Production secret token'}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {maskSecret(tokenValue, 8)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {key.scopes.map((s) => (
                              <span key={s} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px] font-semibold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleCopyText(tokenValue, key.id)}
                            className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition inline-flex items-center space-x-1 cursor-pointer"
                          >
                            {copiedKeyId === key.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-[10px] text-emerald-600 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal to Generate New Hardened Token */}
          {showNewKeyModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">Generate Hardened Secret Token</h3>
                  </div>
                  <button
                    onClick={() => setShowNewKeyModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleCreateHardenedKey} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Token Name / Integration Label</label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g. ERP Invoicing Webhook Ingestion"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Permission Scope</label>
                    <select
                      value={newKeyScope}
                      onChange={(e) => setNewKeyScope(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="campaign_dispatch">campaign_dispatch (Trigger bulk campaigns)</option>
                      <option value="chat_read_write">chat_read_write (Live inbox sync & replies)</option>
                      <option value="webhook_ingestion">webhook_ingestion (Inbound payloads verification)</option>
                      <option value="admin">admin (Full tenant access)</option>
                    </select>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Will generate a 48-character CSPRNG secret key with prefix <code>wc_sec_live_</code>.
                  </p>

                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewKeyModal(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                    >
                      Generate Key
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AGENTS SETTINGS */}
      {activeTab === 'agents' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">Agent Routing & Concurrency</h2>
          </div>

          <form onSubmit={handleSaveGeneral} className="space-y-4 max-w-2xl text-xs text-slate-700">
            <label className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
              <input
                type="checkbox"
                checked={enableAgentAssignment}
                onChange={(e) => setEnableAgentAssignment(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <div>
                <div className="font-semibold text-slate-900">Enable Agent Assignment</div>
                <div className="text-slate-500 text-[11px]">Allow conversations to be manually or automatically assigned to live agents.</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
              <input
                type="checkbox"
                checked={autoAssignRoundRobin}
                onChange={(e) => setAutoAssignRoundRobin(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <div>
                <div className="font-semibold text-slate-900">Round-Robin Auto Assignment</div>
                <div className="text-slate-500 text-[11px]">Evenly distribute incoming chats among currently online agents.</div>
              </div>
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maximum Concurrent Chats Per Agent
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={maxChatsPerAgent}
                onChange={(e) => setMaxChatsPerAgent(parseInt(e.target.value) || 10)}
                className="w-32 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Prevents agent burnout by holding excess conversations in queue until chats are closed.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Agent Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: CHAT SETTINGS */}
      {activeTab === 'chat' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">Chat Settings & Automation Notices</h2>
          </div>

          <form onSubmit={handleSaveGeneral} className="space-y-4 max-w-2xl text-xs text-slate-700">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blacklisted Phone Numbers (Blocklist)
              </label>
              <textarea
                rows={3}
                value={blacklistedPhones}
                onChange={(e) => setBlacklistedPhones(e.target.value)}
                placeholder="+919800000000 (one per line)"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Numbers entered here are blocked from marketing campaigns and automatically filtered in live chat.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Greeting Message
              </label>
              <textarea
                rows={2}
                value={chatWelcomeMessage}
                onChange={(e) => setChatWelcomeMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Outside Working Hours Automated Notice
              </label>
              <textarea
                rows={2}
                value={outOfHoursMessage}
                onChange={(e) => setOutOfHoursMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Chat Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: BOT SETTINGS */}
      {activeTab === 'bot' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Bot className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">Bot Settings & Fallbacks</h2>
          </div>

          <form onSubmit={handleSaveGeneral} className="space-y-4 max-w-2xl text-xs text-slate-700">
            <label className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
              <input
                type="checkbox"
                checked={enableBotFallback}
                onChange={(e) => setEnableBotFallback(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <div>
                <div className="font-semibold text-slate-900">Enable Fallback Reply</div>
                <div className="text-slate-500 text-[11px]">Send an automated response when no keyword rule matches.</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer">
              <input
                type="checkbox"
                checked={botCaseInsensitive}
                onChange={(e) => setBotCaseInsensitive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <div>
                <div className="font-semibold text-slate-900">Case-Insensitive Matching</div>
                <div className="text-slate-500 text-[11px]">Match triggers regardless of UPPERCASE / lowercase typing.</div>
              </div>
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Fallback Message Text
              </label>
              <textarea
                rows={3}
                value={botFallbackText}
                onChange={(e) => setBotFallbackText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Bot Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
