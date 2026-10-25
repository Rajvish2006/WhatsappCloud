import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Code2, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  BarChart3, 
  Key, 
  RefreshCw, 
  Send, 
  Terminal, 
  ShieldCheck,
  Plus
} from 'lucide-react';

interface ApiInfoViewProps {
  initialSubTab?: 'info' | 'campaigns';
  onNavigateToCampaigns?: () => void;
}

export const ApiInfoView: React.FC<ApiInfoViewProps> = ({ 
  initialSubTab = 'info', 
  onNavigateToCampaigns 
}) => {
  const { 
    currentCompany, 
    apiKeys, 
    generateApiKey, 
    revokeApiKey, 
    rotateApiKey, 
    campaigns 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'info' | 'campaigns'>(initialSubTab);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Active primary token or fallback
  const activeToken = apiKeys.find(k => k.status === 'ACTIVE') || apiKeys[0];
  const endpointBase = 'https://app.aspai.in/api/v1';
  const sampleBearer = activeToken ? `Bearer ${activeToken.tokenHash.substring(0, 32)}...` : 'Bearer G1K2RttZ8kFj99aBCx81924Lksq10294';

  // API campaigns (campaigns triggered via API or all campaigns)
  const [apiCampaignList, setApiCampaignList] = useState([
    {
      id: 'camp_api_001',
      name: 'OTP Verification API',
      campaignId: 'API-CMP-90812',
      createdAt: '2026-03-01 10:14:00',
      totalSent: 1420,
      deliveredRate: '99.4%'
    },
    {
      id: 'camp_api_002',
      name: 'Order Confirmation Webhook Trigger',
      campaignId: 'API-CMP-90813',
      createdAt: '2026-03-01 11:30:00',
      totalSent: 854,
      deliveredRate: '98.8%'
    },
    {
      id: 'camp_api_003',
      name: 'Account Password Reset Dispatcher',
      campaignId: 'API-CMP-90814',
      createdAt: '2026-03-01 12:45:00',
      totalSent: 310,
      deliveredRate: '100%'
    }
  ]);

  const handleCopy = (text: string, isToken: boolean) => {
    navigator.clipboard?.writeText(text);
    if (isToken) {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedEndpoint(true);
      setTimeout(() => setCopiedEndpoint(false), 2000);
    }
  };

  const handleSendTestApi = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setTestResponse(JSON.stringify({
        status: 'success',
        code: 200,
        message_id: `wamid.HBgL${Date.now()}`,
        recipient: '+919811111111',
        credit_deducted: 1,
        credit_type: 'UTILITY',
        remaining_balance: 2499,
        timestamp: new Date().toISOString()
      }, null, 2));
    }, 600);
  };

  const handleDeleteApiCampaign = (id: string) => {
    setApiCampaignList(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Sub Header Navigation matching Page 6 Bottom & Page 7 Top */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {activeTab === 'info' ? 'API info' : 'API campaigns'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrate WhatsApp messaging into your CRM, ERP, and backend servers via secure REST API.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'info'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            API info
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'campaigns'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            API campaigns ({apiCampaignList.length})
          </button>
        </div>
      </div>

      {activeTab === 'info' ? (
        /* TAB 1: API INFO matching Page 6 Bottom of PDF */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Card: API Details matching PDF */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 text-slate-800">
                  <Code2 className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold">API</h2>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                  v1.0 Production
                </span>
              </div>

              {/* Endpoint Display */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Base API Endpoint
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 select-all">
                    {endpointBase}
                  </div>
                  <button
                    onClick={() => handleCopy(endpointBase, false)}
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="Copy API Endpoint"
                  >
                    {copiedEndpoint ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Token Input matching PDF */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Bearer Token
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Scope: Company ID {currentCompany.code}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={sampleBearer}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 select-all focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopy(sampleBearer, true)}
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="Copy Bearer Token"
                  >
                    {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Authenticate your requests by including your token in the <code>Authorization: Bearer {'<token>'}</code> header.
                </p>
              </div>

              {/* Two Action Buttons matching PDF Page 6 Bottom */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                >
                  List of Campaigns for API
                </button>

                <a
                  href="#docs"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("API Documentation: Send POST to /api/v1/messages with JSON body { recipient: '+919811111111', template_name: 'safe4sign_login_otp', variables: ['123456'] }");
                  }}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition inline-flex items-center space-x-1.5"
                >
                  <span>Documentation</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Live cURL Interactive Sandbox */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold font-mono">cURL Interactive Dispatcher</span>
                </div>
                <button
                  onClick={handleSendTestApi}
                  disabled={isSending}
                  className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                >
                  <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-pulse' : ''}`} />
                  <span>{isSending ? 'Sending API Call...' : 'Execute Test API Call'}</span>
                </button>
              </div>

              <div className="bg-black/60 rounded-lg p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                <pre>{`curl -X POST "${endpointBase}/messages" \\
  -H "Authorization: ${sampleBearer}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919811111111",
    "template": "safe4sign_login_otp",
    "variables": ["849201"],
    "category": "UTILITY"
  }'`}</pre>
              </div>

              {testResponse && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                    API HTTP 200 Response:
                  </span>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[11px] text-indigo-300">
                    <pre>{testResponse}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Rate Limits & Security */}
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Rate Limits & Quota
              </h3>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Tenant Rate Limit:</span>
                  <strong className="text-slate-800 font-mono">120 req / min</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Max Batch Size:</span>
                  <strong className="text-slate-800 font-mono">500 msgs / payload</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Deduction Rule:</span>
                  <strong className="text-emerald-700 font-mono">Atomic on Queue</strong>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Failure Policy:</span>
                  <strong className="text-blue-700 font-mono">Auto 100% Refund</strong>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-900 space-y-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-xs font-bold">Secure Hash Protection</h4>
              </div>
              <p className="text-xs leading-relaxed text-emerald-800">
                Raw tokens are never stored plain-text in the database. Tokens are hashed using SHA-256 with tenant-specific salt before validation.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: API CAMPAIGNS matching Page 7 Top of PDF */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Campaigns</h2>
            <span className="text-xs text-slate-500">
              Showing {apiCampaignList.length} API-triggered campaigns
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">NAME</th>
                  <th className="py-3 px-6">CAMPAIGN ID</th>
                  <th className="py-3 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apiCampaignList.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div>{camp.name}</div>
                      <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                        Created: {camp.createdAt} &bull; Total Sent: {camp.totalSent.toLocaleString()}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono text-blue-600 font-medium">
                      {camp.campaignId}
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      {/* Analytics Button matching Page 7 Top */}
                      <button
                        onClick={() => alert(`Analytics for ${camp.name}: Delivered ${camp.deliveredRate}, Total Sent ${camp.totalSent}`)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition inline-flex items-center space-x-1"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Analytics</span>
                      </button>

                      {/* Delete Button matching Page 7 Top */}
                      <button
                        onClick={() => handleDeleteApiCampaign(camp.id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold transition inline-flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
