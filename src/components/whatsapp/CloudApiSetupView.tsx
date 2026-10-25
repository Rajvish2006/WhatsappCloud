import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Smartphone, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw, 
  Send, 
  Radio, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  Key,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';

export const CloudApiSetupView: React.FC = () => {
  const { 
    currentCompany, 
    wabaConfig, 
    updateWabaConfig, 
    syncTemplatesFromMeta, 
    sendTestOutboundMessage,
    verifyWebhookConnection,
    resetWebhookVerification,
    updateCompanyAppCredentials
  } = useApp();

  const [copiedCallback, setCopiedCallback] = useState(false);
  const [copiedVerify, setCopiedVerify] = useState(false);
  
  // Webhook Handshake Verification
  const [isVerifyingWebhook, setIsVerifyingWebhook] = useState(false);
  const [handshakeMessage, setHandshakeMessage] = useState<string | null>(null);

  // App Credentials
  const [appIdInput, setAppIdInput] = useState(currentCompany.appId || '918274619283746');
  const [appSecretInput, setAppSecretInput] = useState(currentCompany.appSecret || 'wc_sec_99182374610928347102938475619283');
  const [showAppSecret, setShowAppSecret] = useState(false);
  const [credsSaved, setCredsSaved] = useState(false);

  // Step 2 State
  const [tokenInput, setTokenInput] = useState(wabaConfig.accessTokenMasked || 'EAAG9x82l10...sample_permanent_token');
  const [tokenSaved, setTokenSaved] = useState(false);

  // Step 3 State
  const [wabaIdInput, setWabaIdInput] = useState(wabaConfig.wabaId || '108920192837461');
  const [phoneIdInput, setPhoneIdInput] = useState(wabaConfig.phoneNumberId || '102938475618293');
  const [idsSaved, setIdsSaved] = useState(false);

  // Syncing
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Outbound test
  const [testPhone, setTestPhone] = useState('+919811111111');
  const [testResult, setTestResult] = useState<string | null>(null);

  const callbackUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/whatsapp` 
    : '/api/webhooks/whatsapp';
  const verifyToken = wabaConfig.webhookVerifyToken || 'webcraft_verify_token_whatsapp';

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

  const handleVerifyHandshake = () => {
    setIsVerifyingWebhook(true);
    setHandshakeMessage(null);
    verifyWebhookConnection().then((res) => {
      setIsVerifyingWebhook(false);
      setHandshakeMessage(res.message);
      setTimeout(() => setHandshakeMessage(null), 5000);
    }).catch(() => {
      setIsVerifyingWebhook(false);
      setHandshakeMessage('Verification handshake failed.');
      setTimeout(() => setHandshakeMessage(null), 5000);
    });
  };

  const handleSaveAppCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyAppCredentials(appIdInput.trim(), appSecretInput.trim());
    setCredsSaved(true);
    setTimeout(() => setCredsSaved(false), 3000);
  };

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    updateWabaConfig({ accessTokenMasked: tokenInput });
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 3000);
  };

  const handleSaveIds = (e: React.FormEvent) => {
    e.preventDefault();
    updateWabaConfig({ wabaId: wabaIdInput, phoneNumberId: phoneIdInput });
    setIdsSaved(true);
    setTimeout(() => setIdsSaved(false), 3000);
  };

 const handleSync = async () => {
  setIsSyncing(true);
  setSyncStatus(null);

  try {
    await syncTemplatesFromMeta();
  } catch (error) {
    setSyncStatus(
      error instanceof Error
        ? `Sync failed: ${error.message}`
        : 'Sync failed. Check your Meta API configuration.'
    );
  } finally {
    setIsSyncing(false);
  }

  setTimeout(() => setSyncStatus(null), 6000);
};

  const handleTestPing = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestResult('Sending test message via Meta Cloud API...');
    try {
      const res = await sendTestOutboundMessage(testPhone, 'Test ping from WhatsApp Cloud API Setup', 'UTILITY');
      if (res.success) {
        setTestResult(`Message successfully sent! Meta WAMID: ${res.wamid || 'Confirmed'}. Consumed 1 Utility credit.`);
      } else {
        setTestResult(`Send failed: ${res.error}`);
      }
    } catch (err: any) {
      setTestResult(`Error: ${err?.message || 'Send failed'}`);
    }
    setTimeout(() => setTestResult(null), 8000);
  };

  const isConnected = !!currentCompany.webhookConnected;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-800">WhatsApp Cloud API</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure Meta Cloud API credentials, webhook verification, permanent system user token, and Meta App Secret.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 4 Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Webhook Callback URL & Verify Token */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="text-sm font-bold text-slate-800">
                  Step 1: Webhook Configuration & Handshake
                </h2>
              </div>
              {isConnected ? (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Connection Pending</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600">
              Enter Callback URL and Verify token in your Meta App WhatsApp configuration under <strong>WhatsApp &rarr; Configuration &rarr; Webhook</strong>.
            </p>

            {!isConnected && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Webhook handshake not yet verified.</span>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Incoming payloads cannot be accepted until Meta performs the verification GET challenge. You can run the verification handshake below.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleVerifyHandshake}
                  disabled={isVerifyingWebhook}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold transition flex items-center space-x-1 shrink-0 cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingWebhook ? 'animate-spin' : ''}`} />
                  <span>{isVerifyingWebhook ? 'Verifying...' : 'Verify Now'}</span>
                </button>
              </div>
            )}

            {isConnected && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Webhook handshake verified successfully with Meta Cloud API.
                    {currentCompany.webhookConnectedAt && ` (${new Date(currentCompany.webhookConnectedAt).toLocaleTimeString()})`}
                  </span>
                </div>
                <button
                  onClick={handleVerifyHandshake}
                  disabled={isVerifyingWebhook}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[11px] font-semibold transition cursor-pointer"
                >
                  Test Handshake
                </button>
              </div>
            )}

            {handshakeMessage && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>{handshakeMessage}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Callback URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={callbackUrl}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 select-all"
                  />
                  <button
                    onClick={() => handleCopy(callbackUrl, 'callback')}
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                    title="Copy Callback URL"
                  >
                    {copiedCallback ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verify Token
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={verifyToken}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 select-all"
                  />
                  <button
                    onClick={() => handleCopy(verifyToken, 'verify')}
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                    title="Copy Verify Token"
                  >
                    {copiedVerify ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Permanent Access Token */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-slate-800">
                Step 2: Permanent Access Token
              </h2>
            </div>

            <p className="text-xs text-slate-600">
              Paste the permanent System User token generated from Meta Business Manager with permissions: <code>whatsapp_business_messaging</code> and <code>whatsapp_business_management</code>.
            </p>

            <form onSubmit={handleSaveToken} className="space-y-3">
              <div>
                <textarea
                  rows={2}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="EAAG... permanent access token"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                >
                  Save access token
                </button>
                {tokenSaved && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved successfully!</span>
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* STEP 3: WABA ID & Phone Number ID */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h2 className="text-sm font-bold text-slate-800">
                Step 3: WhatsApp Business Account ID & Phone Number ID
              </h2>
            </div>

            <form onSubmit={handleSaveIds} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp Business Account ID
                  </label>
                  <input
                    type="text"
                    value={wabaIdInput}
                    onChange={(e) => setWabaIdInput(e.target.value)}
                    placeholder="e.g. 108920192837461"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    value={phoneIdInput}
                    onChange={(e) => setPhoneIdInput(e.target.value)}
                    placeholder="e.g. 102938475618293"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
                >
                  Save IDs
                </button>
                {idsSaved && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved successfully!</span>
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* STEP 4: Meta App ID & App Secret */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                4
              </span>
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">
                  Step 4: Meta App ID & App Secret (HMAC Signature Key)
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Your App Secret is used for cryptographic verification of incoming webhook signatures (<code>X-Hub-Signature-256</code>) to verify authenticity from Meta.
            </p>

            <form onSubmit={handleSaveAppCredentials} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meta App ID
                  </label>
                  <input
                    type="text"
                    value={appIdInput}
                    onChange={(e) => setAppIdInput(e.target.value)}
                    placeholder="e.g. 918274619283746"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meta App Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showAppSecret ? 'text' : 'password'}
                      value={appSecretInput}
                      onChange={(e) => setAppSecretInput(e.target.value)}
                      placeholder="e.g. wc_sec_..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-10 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAppSecret(!showAppSecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showAppSecret ? 'Hide' : 'Show'}
                    >
                      {showAppSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
                >
                  Save App Credentials
                </button>
                {credsSaved && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Credentials saved!</span>
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Connection Status matching Page 9 of PDF */}
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              WhatsApp Cloud API - Connection Status
            </h3>

            {/* Dynamic Status Banner */}
            {isConnected ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <div className="font-bold text-emerald-900 text-sm">Connected & Active</div>
                  <div className="text-xs text-emerald-700 font-mono mt-0.5">
                    {wabaConfig.displayPhoneNumber}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="font-bold text-amber-900 text-sm">Connection Pending</div>
                  <div className="text-xs text-amber-700 font-mono mt-0.5">
                    Handshake Required
                  </div>
                </div>
              </div>
            )}

            {/* Health Info List */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Business Name:</span>
                <strong className="text-slate-800">{wabaConfig.verifiedName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Quality Rating:</span>
                <span className="font-bold text-emerald-600 uppercase">{wabaConfig.qualityRating}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Messaging Limit:</span>
                <strong className="text-blue-700">{wabaConfig.metaTier} / 24h</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">HMAC-SHA256:</span>
                <span className="font-semibold text-emerald-700">Enforced</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Meta API Version:</span>
                <span className="font-mono text-slate-800">v21.0</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full flex items-center justify-center space-x-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                <span>{isSyncing ? 'Synchronizing...' : 'Sync Meta Templates'}</span>
              </button>

              {syncStatus && (
                <div className="p-2 rounded bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                  {syncStatus}
                </div>
              )}
            </div>
          </div>

          {/* Quick Ping Test Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-700">Test Ping Dispatch</h4>
            <p className="text-[11px] text-slate-500">
              Send a test handshake message through Meta Cloud API to verify routing.
            </p>

            <form onSubmit={handleTestPing} className="space-y-2 text-xs">
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+91..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-black text-white font-semibold rounded-lg text-xs transition"
              >
                Send Test Ping
              </button>
            </form>

            {testResult && (
              <div className={`p-2 rounded text-[11px] font-medium ${
                testResult.startsWith('Message')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
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
