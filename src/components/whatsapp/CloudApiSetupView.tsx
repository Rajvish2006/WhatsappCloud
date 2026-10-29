import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Smartphone, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw, 
  Send, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  Key,
  Eye,
  EyeOff,
  Lock,
  Database,
  Sparkles,
  Server,
  Radio,
  FileCode,
  ArrowRight,
  Info
} from 'lucide-react';
import { verifyWhatsAppMetaConnection } from '../../lib/metaApiClient';

export const CloudApiSetupView: React.FC = () => {
  const { 
    currentCompany, 
    wabaConfig, 
    syncTemplatesFromMeta, 
    sendTestOutboundMessage,
    verifyWebhookConnection,
    resetWebhookVerification,
    saveCentralizedMetaCredentials,
    supabaseStatus
  } = useApp();

  // Centralized Credentials State
  const [accessToken, setAccessToken] = useState(
    currentCompany.accessToken || 
    (wabaConfig.accessTokenMasked && !wabaConfig.accessTokenMasked.includes('sample') ? wabaConfig.accessTokenMasked : '')
  );
  const [phoneNumberId, setPhoneNumberId] = useState(currentCompany.phoneNumberId || wabaConfig.phoneNumberId || '102938475618293');
  const [wabaId, setWabaId] = useState(currentCompany.wabaId || wabaConfig.wabaId || '108920192837461');
  const [appId, setAppId] = useState(currentCompany.appId || '18920192039481');
  const [appSecret, setAppSecret] = useState(currentCompany.appSecret || '4f29a88c71b9e0293847a192837491b8');
  const [webhookVerifyToken, setWebhookVerifyToken] = useState(
    currentCompany.webhookVerifyToken || wabaConfig.webhookVerifyToken || 'webcraft_verify_token_whatsapp'
  );
  const [graphApiVersion, setGraphApiVersion] = useState(currentCompany.graphApiVersion || wabaConfig.graphApiVersion || 'v22.0');

  // UI Visibility Toggles
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showAppSecret, setShowAppSecret] = useState(false);
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [copiedVerify, setCopiedVerify] = useState(false);

  // Quick Extract Tool State
  const [showExtractTool, setShowExtractTool] = useState(false);
  const [rawExtractText, setRawExtractText] = useState('');
  const [extractFeedback, setExtractFeedback] = useState<string | null>(null);

  // Live Meta Graph API Verification State
  const [isVerifyingMeta, setIsVerifyingMeta] = useState(false);
  const [metaVerificationResult, setMetaVerificationResult] = useState<any>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  // Save State
  const [isSaving, setIsSaving] = useState(false);
  const [saveBanner, setSaveBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Webhook Verification
  const [isVerifyingWebhook, setIsVerifyingWebhook] = useState(false);
  const [handshakeMessage, setHandshakeMessage] = useState<string | null>(null);

  // Templates Sync
  const [isSyncingTemplates, setIsSyncingTemplates] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Test Outbound Message
  const [testPhone, setTestPhone] = useState('+919876543210');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // URLs
  const prodCallbackUrl = `https://whatsappcloud-virid.vercel.app/api/webhook`;
  const localCallbackUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/whatsapp` 
    : '/api/webhooks/whatsapp';

  const handleCopy = (text: string, type: 'callback' | 'verify') => {
    navigator.clipboard?.writeText(text);
    if (type === 'callback') {
      setCopiedCallback(true);
      setTimeout(() => setCopiedCallback(false), 2000);
    } else {
      setCopiedVerify(true);
      setTimeout(() => setCopiedVerify(false), 2000);
    }
  };

  const generateRandomVerifyToken = () => {
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newToken = `wc_verify_${randomHex}`;
    setWebhookVerifyToken(newToken);
  };

  // Smart Parser to extract Meta details from text, JSON, or cURL
  const handleAutoExtractDetails = () => {
    setExtractFeedback(null);
    if (!rawExtractText.trim()) {
      setExtractFeedback('Please paste your Meta configuration, JSON payload, or cURL snippet first.');
      return;
    }

    const text = rawExtractText;
    const extracted: string[] = [];

    // 1. Extract Access Token (EAAG... or Bearer token)
    const tokenMatch = text.match(/EAAG[a-zA-Z0-9_-]+/i) || text.match(/Bearer\s+([a-zA-Z0-9_\-\.]+)/i);
    if (tokenMatch) {
      const foundToken = tokenMatch[1] || tokenMatch[0];
      setAccessToken(foundToken);
      extracted.push('Access Token');
    }

    // 2. Extract Phone Number ID (15 digits usually after phone_number_id or in URL)
    const phoneIdMatch = 
      text.match(/"phone_number_id"\s*:\s*["']?(\d{10,20})["']?/i) ||
      text.match(/phone_number_id[=:]\s*["']?(\d{10,20})["']?/i) ||
      text.match(/graph\.facebook\.com\/[^/]+\/(\d{14,17})\/messages/i) ||
      text.match(/"id"\s*:\s*["']?(\d{14,17})["']?/i);
    if (phoneIdMatch) {
      setPhoneNumberId(phoneIdMatch[1]);
      extracted.push('Phone Number ID');
    }

    // 3. Extract WABA ID
    const wabaIdMatch = 
      text.match(/"waba_id"\s*:\s*["']?(\d{10,20})["']?/i) ||
      text.match(/"whatsapp_business_account_id"\s*:\s*["']?(\d{10,20})["']?/i) ||
      text.match(/waba_id[=:]\s*["']?(\d{10,20})["']?/i) ||
      text.match(/business_account_id[=:]\s*["']?(\d{10,20})["']?/i);
    if (wabaIdMatch) {
      setWabaId(wabaIdMatch[1]);
      extracted.push('WABA ID');
    }

    // 4. Extract App ID
    const appIdMatch = 
      text.match(/"app_id"\s*:\s*["']?(\d{10,20})["']?/i) ||
      text.match(/app_id[=:]\s*["']?(\d{10,20})["']?/i);
    if (appIdMatch) {
      setAppId(appIdMatch[1]);
      extracted.push('App ID');
    }

    // 5. Extract App Secret (32 hex characters)
    const secretMatch = 
      text.match(/"app_secret"\s*:\s*["']?([a-f0-9]{32})["']?/i) ||
      text.match(/app_secret[=:]\s*["']?([a-f0-9]{32})["']?/i);
    if (secretMatch) {
      setAppSecret(secretMatch[1]);
      extracted.push('App Secret');
    }

    // 6. Extract Verify Token
    const verifyMatch = 
      text.match(/"webhook_verify_token"\s*:\s*["']?([^"',\s]+)["']?/i) ||
      text.match(/verify_token[=:]\s*["']?([^"',\s]+)["']?/i);
    if (verifyMatch) {
      setWebhookVerifyToken(verifyMatch[1]);
      extracted.push('Verify Token');
    }

    if (extracted.length > 0) {
      setExtractFeedback(`Successfully extracted and filled: ${extracted.join(', ')}! Review and save.`);
    } else {
      setExtractFeedback('Could not detect recognizable Meta tokens or IDs. Please paste the full JSON or cURL block.');
    }
  };

  // Test & Verify live with Meta Graph API
  const handleVerifyWithMeta = async () => {
    const cleanToken = accessToken.trim();
    if (!cleanToken || cleanToken.includes('sample_permanent_token')) {
      setMetaError('Meta Permanent Access Token is required to test the Graph API. Please paste your token starting with EAAG... above.');
      return;
    }

    if (!phoneNumberId.trim() && !wabaId.trim()) {
      setMetaError('Please enter a Phone Number ID or WABA ID to test against Meta Graph API.');
      return;
    }

    setIsVerifyingMeta(true);
    setMetaError(null);
    setMetaVerificationResult(null);

    try {
      const res = await verifyWhatsAppMetaConnection({
        accessToken: cleanToken,
        phoneNumberId: phoneNumberId.trim(),
        wabaId: wabaId.trim(),
        graphApiVersion
      });

      if (res.success) {
        setMetaVerificationResult(res);
      } else {
        const errorText = res.error || 'Meta Graph API returned an error.';
        const recText = res.recommendation ? ` (${res.recommendation})` : '';
        setMetaError(`${errorText}${recText}`);
      }
    } catch (err: any) {
      setMetaError(err?.message || 'Network failure connecting to Meta Graph API.');
    } finally {
      setIsVerifyingMeta(false);
    }
  };

  // Centralized Save Handler (Syncs to Supabase & Backend server)
  const handleSaveAllCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveBanner(null);

    try {
      const res = await saveCentralizedMetaCredentials({
        accessToken: accessToken.trim(),
        phoneNumberId: phoneNumberId.trim(),
        wabaId: wabaId.trim(),
        appId: appId.trim(),
        appSecret: appSecret.trim(),
        webhookVerifyToken: webhookVerifyToken.trim(),
        graphApiVersion
      });

      if (res.success) {
        setSaveBanner({
          message: res.message,
          type: 'success'
        });
        if (res.verifiedData) {
          setMetaVerificationResult(res.verifiedData);
        }
      } else {
        setSaveBanner({
          message: res.error || 'Failed to save credentials.',
          type: 'error'
        });
      }
    } catch (err: any) {
      setSaveBanner({
        message: err?.message || 'Error saving credentials.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveBanner(null), 8000);
    }
  };

  // Webhook Handshake Verification
  const handleVerifyHandshake = async () => {
    setIsVerifyingWebhook(true);
    setHandshakeMessage(null);
    try {
      const res = await verifyWebhookConnection();
      setHandshakeMessage(res.message);
    } catch (err: any) {
      setHandshakeMessage('Webhook handshake verification failed. Check verify token.');
    } finally {
      setIsVerifyingWebhook(false);
      setTimeout(() => setHandshakeMessage(null), 6000);
    }
  };

  // Sync Templates from Meta
  const handleSyncTemplates = async () => {
    setIsSyncingTemplates(true);
    setSyncStatus(null);
    try {
      await syncTemplatesFromMeta();
      setSyncStatus('Message templates synchronized with Meta Cloud API.');
    } catch (err: any) {
      setSyncStatus(`Sync notice: ${err?.message || 'Templates synchronized.'}`);
    } finally {
      setIsSyncingTemplates(false);
      setTimeout(() => setSyncStatus(null), 6000);
    }
  };

  // Send Test Outbound Message
  const handleTestPing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingTest(true);
    setTestResult('Dispatching message through Meta WhatsApp Cloud API...');
    try {
      const res = await sendTestOutboundMessage(testPhone, 'Test ping from Webcraft Solution WhatsApp Cloud API Setup', 'UTILITY');
      if (res.success) {
        setTestResult(`Success! Message dispatched to ${testPhone}. WAMID: ${(res as any).wamid || 'Confirmed'}. Consumed 1 Utility credit.`);
      } else {
        setTestResult(`Send failed: ${res.error}`);
      }
    } catch (err: any) {
      setTestResult(`Error: ${err?.message || 'Send failed'}`);
    } finally {
      setIsSendingTest(false);
      setTimeout(() => setTestResult(null), 8000);
    }
  };

  const isConnected = !!currentCompany.webhookConnected || !!wabaConfig.isConnected;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Centralized Meta API Forum
            </span>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              WhatsApp Cloud API & Meta Graph Configuration
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure, verify with Meta Graph API, and synchronize all credentials directly to your centralized Supabase server.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowExtractTool(!showExtractTool)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{showExtractTool ? 'Hide Extract Helper' : 'Quick Extract Meta Details'}</span>
          </button>

          <a
            href="https://developers.facebook.com/apps/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Meta App Dashboard</span>
          </a>
        </div>
      </div>

      {/* Save / Feedback Banner */}
      {saveBanner && (
        <div className={`p-4 rounded-xl text-xs flex items-start space-x-3 transition ${
          saveBanner.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {saveBanner.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-bold">{saveBanner.type === 'success' ? 'Centralized Sync Complete' : 'Configuration Notice'}</div>
            <p className="mt-0.5">{saveBanner.message}</p>
          </div>
        </div>
      )}

      {/* QUICK EXTRACT TOOL (EXPANDABLE) */}
      {showExtractTool && (
        <div className="bg-indigo-950/20 border border-indigo-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Smart Details Extractor for Meta API</span>
            </div>
            <span className="text-[11px] text-indigo-700 font-medium">
              Paste your Meta Graph API JSON, cURL snippet, or Business Manager details
            </span>
          </div>

          <textarea
            rows={4}
            value={rawExtractText}
            onChange={(e) => setRawExtractText(e.target.value)}
            placeholder={`Paste raw text here, for example:\ncurl -X POST "https://graph.facebook.com/v22.0/102938475618293/messages" \\\n-H "Authorization: Bearer EAAG9x82l10..." \\\n-d '{"messaging_product":"whatsapp"}'`}
            className="w-full bg-white border border-indigo-200 rounded-lg p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
          />

          <div className="flex items-center justify-between">
            <div className="text-[11px] text-indigo-800 font-medium">
              {extractFeedback || 'Extracts: Access Token (EAAG...), Phone ID, WABA ID, App ID, App Secret, and Verify Token.'}
            </div>
            <button
              type="button"
              onClick={handleAutoExtractDetails}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Extract & Auto-Fill Form
            </button>
          </div>
        </div>
      )}

      {/* Status & Connection Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status 1: Meta Connection */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meta API Status</span>
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-lg font-bold text-slate-800">
              {isConnected ? 'Connected' : 'Connection Pending'}
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
              isConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isConnected ? 'Verified' : 'Action Required'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {wabaConfig.verifiedName || 'Webcraft WhatsApp Business'}
          </p>
        </div>

        {/* Status 2: Supabase Server */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supabase Storage</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-lg font-bold text-slate-800">
              {supabaseStatus.isConnected ? 'Synchronized' : 'Local Fallback'}
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
              supabaseStatus.isConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {supabaseStatus.isConnected ? 'Cloud DB' : 'In-Memory'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {supabaseStatus.projectUrl ? 'Target: companies table' : 'Connected to Workspace'}
          </p>
        </div>

        {/* Status 3: Active Phone Number */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number ID</span>
            <Smartphone className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-sm font-mono font-bold text-slate-800 truncate max-w-[150px]">
              {phoneNumberId || 'Not Configured'}
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              {graphApiVersion}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Quality: <strong className="text-emerald-600 uppercase font-semibold">{wabaConfig.qualityRating || 'GREEN'}</strong>
          </p>
        </div>

        {/* Status 4: Webhook Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Webhook Handshake</span>
            <Radio className={`w-4 h-4 ${currentCompany.webhookConnected ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-sm font-bold text-slate-800">
              {currentCompany.webhookConnected ? 'Handshake Active' : 'Unverified'}
            </div>
            <button
              onClick={handleVerifyHandshake}
              disabled={isVerifyingWebhook}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer"
            >
              {isVerifyingWebhook ? 'Checking...' : 'Test Webhook'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            HMAC-SHA256 signature guard
          </p>
        </div>
      </div>

      {/* Main Grid: Centralized Credential Forum & Live Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): The Unified Credential Forum */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSaveAllCredentials} className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Centralized Meta Cloud API Credential Forum</h3>
                  <p className="text-[11px] text-slate-500">All required parameters unified in one secure place with Supabase persistence.</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleVerifyWithMeta}
                  disabled={isVerifyingMeta}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingMeta ? 'animate-spin text-blue-600' : ''}`} />
                  <span>{isVerifyingMeta ? 'Verifying with Meta...' : 'Test Meta Graph API'}</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Field 1: Permanent System User Access Token */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    System User Permanent Access Token <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {accessToken.length} characters
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showAccessToken ? 'text' : 'password'}
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="EAAG9x82l10..."
                    className="w-full p-2.5 pr-20 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <div className="absolute right-2 top-2 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setShowAccessToken(!showAccessToken)}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showAccessToken ? 'Hide token' : 'Show token'}
                    >
                      {showAccessToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const clip = await navigator.clipboard.readText();
                        if (clip) setAccessToken(clip.trim());
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer text-[10px] font-bold"
                      title="Paste from clipboard"
                    >
                      Paste
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Permanent token generated for a Meta System User with permissions: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">whatsapp_business_management</code> and <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">whatsapp_business_messaging</code>.
                </p>
              </div>

              {/* Row 2: Phone Number ID & WABA ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Phone Number ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    placeholder="e.g. 102938475618293"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400">
                    Found in Meta App Dashboard &rarr; WhatsApp &rarr; API Setup.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    WhatsApp Business Account ID (WABA ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={wabaId}
                    onChange={(e) => setWabaId(e.target.value)}
                    placeholder="e.g. 108920192837461"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400">
                    The 15-digit ID of your Meta WhatsApp Business Account.
                  </p>
                </div>
              </div>

              {/* Row 3: Meta App ID & App Secret */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Meta App ID
                  </label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="e.g. 18920192039481"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Meta Developer App ID from App Settings &rarr; Basic.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Meta App Secret (HMAC Verification)
                  </label>
                  <div className="relative">
                    <input
                      type={showAppSecret ? 'text' : 'password'}
                      value={appSecret}
                      onChange={(e) => setAppSecret(e.target.value)}
                      placeholder="e.g. 4f29a88c71b9e0293847..."
                      className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAppSecret(!showAppSecret)}
                      className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAppSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Used to cryptographically verify X-Hub-Signature-256 webhook headers.
                  </p>
                </div>
              </div>

              {/* Row 4: Webhook Verify Token & Graph API Version */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Webhook Verify Token
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomVerifyToken}
                      className="text-[10px] text-blue-600 hover:underline font-bold"
                    >
                      Generate Strong Token
                    </button>
                  </div>
                  <input
                    type="text"
                    value={webhookVerifyToken}
                    onChange={(e) => setWebhookVerifyToken(e.target.value)}
                    placeholder="webcraft_verify_token_whatsapp"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Token you will enter into Meta App Dashboard webhook configuration.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Meta Graph API Version
                  </label>
                  <select
                    value={graphApiVersion}
                    onChange={(e) => setGraphApiVersion(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none"
                  >
                    <option value="v22.0">v22.0 (Latest Production - Recommended)</option>
                    <option value="v21.0">v21.0</option>
                    <option value="v20.0">v20.0</option>
                  </select>
                  <p className="text-[11px] text-slate-400">
                    Official Graph API endpoint: <code className="font-mono">https://graph.facebook.com/{graphApiVersion}/</code>
                  </p>
                </div>
              </div>

              {/* Webhook Endpoints & Handshake Instructions */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Radio className="w-3.5 h-3.5 text-blue-600" />
                    <span>Meta Webhook Callback URL Endpoints</span>
                  </h4>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-2 py-0.5 rounded font-bold">
                    hub.challenge ready
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">1. Production Cloud Webhook URL</span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <input
                        type="text"
                        readOnly
                        value={prodCallbackUrl}
                        className="flex-1 bg-white border border-slate-200 rounded-lg p-2 font-mono text-[11px] text-slate-700 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(prodCallbackUrl, 'callback')}
                        className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
                      >
                        {copiedCallback ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">2. Direct Workspace Webhook URL</span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <input
                        type="text"
                        readOnly
                        value={localCallbackUrl}
                        className="flex-1 bg-white border border-slate-200 rounded-lg p-2 font-mono text-[11px] text-slate-700 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(localCallbackUrl, 'callback')}
                        className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta Verification Result Preview */}
              {metaVerificationResult && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                  <div className="font-bold text-sm text-emerald-800 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Meta Graph API Live Verification Succeeded:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div className="bg-white/80 p-2 rounded border border-emerald-200">
                      <span className="text-slate-500 block text-[10px]">Business Name</span>
                      <strong>{metaVerificationResult.phoneNumber?.verifiedName || metaVerificationResult.waba?.name || 'Verified'}</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded border border-emerald-200">
                      <span className="text-slate-500 block text-[10px]">Display Phone</span>
                      <strong>{metaVerificationResult.phoneNumber?.displayPhoneNumber || phoneNumberId}</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded border border-emerald-200">
                      <span className="text-slate-500 block text-[10px]">Quality Rating</span>
                      <strong className="text-emerald-700 uppercase">{metaVerificationResult.phoneNumber?.qualityRating || 'GREEN'}</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded border border-emerald-200">
                      <span className="text-slate-500 block text-[10px]">Status</span>
                      <strong className="text-emerald-700 uppercase">{metaVerificationResult.phoneNumber?.codeVerificationStatus || 'VERIFIED'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Meta Verification Error Banner */}
              {metaError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Meta Graph API Notice:</span>
                  </div>
                  <p className="text-rose-800">{metaError}</p>
                </div>
              )}
            </div>

            {/* Form Footer Action Bar */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Automatically syncs & saves to Supabase server on submission.</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleVerifyWithMeta}
                  disabled={isVerifyingMeta}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  {isVerifyingMeta ? 'Calling Graph API...' : 'Check Graph API'}
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-950/20 flex items-center space-x-1.5"
                >
                  <Server className={`w-3.5 h-3.5 ${isSaving ? 'animate-bounce' : ''}`} />
                  <span>{isSaving ? 'Saving to Supabase...' : 'Save All Credentials to Supabase'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column (4 cols): Diagnostics, Template Sync, Test Ping */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Webhook Handshake Verification */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>Webhook Handshake Test</span>
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                currentCompany.webhookConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {currentCompany.webhookConnected ? 'CONNECTED' : 'PENDING'}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              When Meta validates your callback URL, it sends a GET request with <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">hub.challenge</code> and <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">hub.verify_token</code>.
            </p>

            <button
              onClick={handleVerifyHandshake}
              disabled={isVerifyingWebhook}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingWebhook ? 'animate-spin' : ''}`} />
              <span>{isVerifyingWebhook ? 'Verifying Challenge...' : 'Verify Webhook Handshake'}</span>
            </button>

            {handshakeMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {handshakeMessage}
              </div>
            )}
          </div>

          {/* Card 2: Meta Message Templates Sync */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <span>Templates Synchronization</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                GET /{wabaId}/message_templates
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Fetch approved marketing, utility, and authentication templates directly from Meta Graph API.
            </p>

            <button
              onClick={handleSyncTemplates}
              disabled={isSyncingTemplates}
              className="w-full py-2.5 bg-slate-900 hover:bg-black disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTemplates ? 'animate-spin' : ''}`} />
              <span>{isSyncingTemplates ? 'Syncing from Meta...' : 'Sync Meta Templates'}</span>
            </button>

            {syncStatus && (
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs">
                {syncStatus}
              </div>
            )}
          </div>

          {/* Card 3: Outbound Test Ping */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Live Outbound Test Ping</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Dispatch an immediate test message using your configured Phone Number ID. Consumes 1 Utility credit.
              </p>
            </div>

            <form onSubmit={handleTestPing} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Recipient WhatsApp Mobile (with country code)
                </label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSendingTest}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-pulse' : ''}`} />
                <span>{isSendingTest ? 'Dispatching...' : 'Send Live Test Ping'}</span>
              </button>
            </form>

            {testResult && (
              <div className={`p-3 rounded-lg text-xs ${
                testResult.startsWith('Success')
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                {testResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
