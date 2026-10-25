import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  KeyRound, 
  Plus, 
  RotateCw, 
  Trash2, 
  Copy, 
  Check, 
  ShieldAlert, 
  Terminal, 
  Sliders, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const TenantApiKeys: React.FC = () => {
  const {
    apiKeys,
    generateApiKey,
    revokeApiKey,
    rotateApiKey,
    testApiCall,
    currentCompany
  } = useApp();

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['messages:send', 'templates:read']);
  const [rateLimitRpm, setRateLimitRpm] = useState<number>(120);

  // One-time reveal modal state
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Interactive Playground State
  const [testEndpoint, setTestEndpoint] = useState('/api/v1/messages/send');
  const [selectedTestKey, setSelectedTestKey] = useState<string>(apiKeys[0]?.keyPrefix || '');
  const [testResult, setTestResult] = useState<{ success: boolean; statusCode: number; message: string; remainingLimit: number } | null>(null);

  const availableScopes = [
    { id: 'messages:send', label: 'messages:send', desc: 'Dispatch single and batch WhatsApp messages' },
    { id: 'templates:read', label: 'templates:read', desc: 'Inspect approved Meta template parameters' },
    { id: 'contacts:read', label: 'contacts:read', desc: 'Query contact consent and attributes' },
    { id: 'contacts:write', label: 'contacts:write', desc: 'Create and update contacts and groups' },
    { id: 'webhooks:listen', label: 'webhooks:listen', desc: 'Subscribe to delivery status callbacks' }
  ];

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const { rawKey } = generateApiKey(newKeyName.trim(), selectedScopes, rateLimitRpm);
    setIsGenerateOpen(false);
    setRevealedKey(rawKey);
    setNewKeyName('');
  };

  const handleRotate = (keyId: string) => {
    const { newRawKey } = rotateApiKey(keyId);
    if (newRawKey) {
      setRevealedKey(newRawKey);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRunTestCall = () => {
    const res = testApiCall(selectedTestKey, testEndpoint);
    setTestResult(res);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              P0 Requirement
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Secure Tenant API Credentials & Token Lifecycle
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate, SHA-256 hash, revoke, rotate, expire credentials with company-scoped permissions & rate limits.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/50 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generate New API Key</span>
        </button>
      </div>

      {/* Security Architecture Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start space-x-3 text-xs text-slate-300">
        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-white">Cryptographic Storage Specification</div>
          <p className="text-slate-400 mt-0.5 leading-relaxed">
            Raw API secrets are displayed <strong>exactly once</strong> upon creation and never stored in plain text.
            OmniWABA stores only the irreversible <strong>SHA-256</strong> hash. Incoming requests are hashed in-memory and matched using constant-time string comparison to prevent timing attacks.
          </p>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-rose-400" />
            <span>Active Credentials for {currentCompany.name}</span>
          </h2>
          <span className="text-[11px] text-slate-400">
            {apiKeys.filter(k => k.companyId === currentCompany.id && k.status === 'ACTIVE').length} Active Keys
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Key Name & Prefix</th>
                <th className="py-3 px-3">SHA-256 Hash Digest</th>
                <th className="py-3 px-3">Scopes</th>
                <th className="py-3 px-3">Rate Limit (RPM)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Expires At</th>
                <th className="py-3 px-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {apiKeys.map((key) => {
                const isCurrentTenant = key.companyId === currentCompany.id;
                const usagePct = (key.currentMinuteUsage / key.rateLimitRpm) * 100;
                return (
                  <tr key={key.id} className={`hover:bg-slate-800/40 transition ${!isCurrentTenant ? 'opacity-50' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{key.name}</div>
                      <div className="font-mono text-[10px] text-rose-300">{key.keyPrefix}••••••••</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800" title={key.tokenHash}>
                        {key.tokenHash.substring(0, 16)}...
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {key.scopes.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-slate-300 border border-slate-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{key.currentMinuteUsage} / {key.rateLimitRpm}</span>
                          <span>{usagePct.toFixed(0)}%</span>
                        </div>
                        <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div style={{ width: `${Math.min(100, usagePct)}%` }} className={`h-full ${usagePct > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        key.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {key.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[11px] text-slate-400 font-mono">
                      {new Date(key.expiresAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {key.status === 'ACTIVE' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleRotate(key.id)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition"
                            title="Rotate Key (Issues new secret and revokes old)"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => revokeApiKey(key.id)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                            title="Revoke Key Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Revoked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive API Testing Playground */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Interactive API Request Tester & Rate Limit Inspector</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test authorization, scope validation, and rate limit counters in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-400 text-xs mb-1">Key to Authenticate</label>
            <select
              value={selectedTestKey}
              onChange={(e) => setSelectedTestKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
            >
              {apiKeys.map(k => (
                <option key={k.id} value={k.keyPrefix}>
                  {k.name} ({k.keyPrefix}...) - {k.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">Target Endpoint</label>
            <select
              value={testEndpoint}
              onChange={(e) => setTestEndpoint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
            >
              <option value="/api/v1/messages/send">POST /api/v1/messages/send</option>
              <option value="/api/v1/templates/list">GET /api/v1/templates/list</option>
              <option value="/api/v1/contacts/query">GET /api/v1/contacts/query</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunTestCall}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition"
            >
              Execute Request
            </button>
          </div>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div className={`p-3.5 rounded-lg border text-xs font-mono flex items-start space-x-2.5 ${
            testResult.statusCode === 200
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : testResult.statusCode === 429
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            {testResult.statusCode === 200 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-bold">
                HTTP {testResult.statusCode} Response &bull; Remaining Quota: {testResult.remainingLimit} RPM
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">{testResult.message}</div>
            </div>
          </div>
        )}
      </div>

      {/* GENERATE API KEY MODAL */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-rose-400" />
                <span>Create New Scoped API Key</span>
              </h3>
              <button onClick={() => setIsGenerateOpen(false)} className="text-slate-400 hover:text-white text-lg">&times;</button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Key Description / Purpose</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production Mobile App Webhook"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Scoped Permissions</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {availableScopes.map((scope) => {
                    const isChecked = selectedScopes.includes(scope.id);
                    return (
                      <label key={scope.id} className="flex items-start space-x-2 p-2 bg-slate-950 rounded border border-slate-800/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedScopes([...selectedScopes, scope.id]);
                            else setSelectedScopes(selectedScopes.filter(s => s !== scope.id));
                          }}
                          className="mt-0.5 rounded text-rose-500 focus:ring-0"
                        />
                        <div>
                          <div className="font-mono text-slate-200 font-semibold">{scope.label}</div>
                          <div className="text-[10px] text-slate-400">{scope.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Rate Limit: <strong className="text-rose-400 font-mono">{rateLimitRpm} Requests / Min</strong>
                </label>
                <input
                  type="range"
                  min="60"
                  max="600"
                  step="30"
                  value={rateLimitRpm}
                  onChange={(e) => setRateLimitRpm(parseInt(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Create Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONE-TIME RAW KEY REVEAL MODAL */}
      {revealedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Save Your API Secret Now</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              For security, this raw key is only shown once and cannot be retrieved again. If you lose it, you will need to rotate or generate a new key.
            </p>

            <div className="p-3 bg-black rounded-lg border border-slate-700 flex items-center justify-between font-mono text-xs text-rose-300 break-all select-all">
              <span>{revealedKey}</span>
              <button
                onClick={() => copyToClipboard(revealedKey)}
                className="ml-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setRevealedKey(null)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                I have securely saved this key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
