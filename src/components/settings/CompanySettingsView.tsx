import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  Users, 
  Webhook, 
  MessageSquare, 
  Bot, 
  Check, 
  Save, 
  CheckCircle2, 
  ShieldAlert,
  Clock,
  PhoneOff
} from 'lucide-react';

export const CompanySettingsView: React.FC = () => {
  const { appSettings, updateAppSettings, currentCompany } = useApp();

  const [activeTab, setActiveTab] = useState<'agents' | 'webhooks' | 'chat' | 'bot'>('agents');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [enableAgentAssignment, setEnableAgentAssignment] = useState(appSettings.enableAgents ?? true);
  const [maxChatsPerAgent, setMaxChatsPerAgent] = useState(15);
  const [autoAssignRoundRobin, setAutoAssignRoundRobin] = useState(true);

  // Webhooks
  const [webhookUrl, setWebhookUrl] = useState(appSettings.webhookCallbackUrl ?? 'https://crm.houseseekers.com/api/v1/whatsapp-events');
  const [webhookSecret, setWebhookSecret] = useState('whsec_99120481029481');
  const [eventMessages, setEventMessages] = useState(true);
  const [eventStatuses, setEventStatuses] = useState(true);
  const [eventOptOuts, setEventOptOuts] = useState(true);

  // Chat Settings
  const [blacklistedPhones, setBlacklistedPhones] = useState(
    appSettings.blacklistedPhoneNumbers ?? '+919999999999\n+14155550000'
  );
  const [chatWelcomeMessage, setChatWelcomeMessage] = useState(
    'Welcome to House Seekers! How can our property advisors assist you today?'
  );
  const [outOfHoursMessage, setOutOfHoursMessage] = useState(
    'Our office hours are Mon-Sat 9AM-8PM IST. An agent will follow up shortly.'
  );

  // Bot Settings
  const [enableBotFallback, setEnableBotFallback] = useState(true);
  const [botFallbackText, setBotFallbackText] = useState(
    'Thank you for reaching out. We received your query and a representative will reply shortly.'
  );
  const [botCaseInsensitive, setBotCaseInsensitive] = useState(true);

  const handleSave = (e: React.FormEvent) => {
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

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header matching Page 7 & Page 8 */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Apps & Company Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure agent routing, inbound webhooks, chat filters, and bot automation triggers.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Sub-Navigation matching Page 7 & 8 */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('agents')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'agents'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Agents</span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'webhooks'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Webhook className="w-4 h-4" />
          <span>WebHooks</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
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
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'bot'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Bot settings</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: AGENTS SETTINGS matching Page 7 Bottom */}
        {activeTab === 'agents' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-800">Agents</h2>
            </div>

            <div className="space-y-4 max-w-2xl text-xs text-slate-700">
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
            </div>
          </div>
        )}

        {/* TAB 2: WEBHOOKS matching Page 7 Middle */}
        {activeTab === 'webhooks' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Webhook className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-800">WebHooks</h2>
            </div>

            <div className="space-y-4 max-w-2xl text-xs text-slate-700">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tenant Webhook URL
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://crm.yourcompany.com/webhook"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  We'll POST JSON payloads to this endpoint whenever WhatsApp events occur.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Webhook Signature Secret
                </label>
                <input
                  type="text"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Subscribed Event Triggers
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center space-x-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <input
                      type="checkbox"
                      checked={eventMessages}
                      onChange={(e) => setEventMessages(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Customer Messages</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <input
                      type="checkbox"
                      checked={eventStatuses}
                      onChange={(e) => setEventStatuses(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Delivery Receipts</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <input
                      type="checkbox"
                      checked={eventOptOuts}
                      onChange={(e) => setEventOptOuts(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Opt-outs / Stops</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CHAT SETTINGS matching Page 8 Top */}
        {activeTab === 'chat' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-800">Chat settings</h2>
            </div>

            <div className="space-y-4 max-w-2xl text-xs text-slate-700">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blacklisted Phone Numbers
                </label>
                <textarea
                  rows={4}
                  value={blacklistedPhones}
                  onChange={(e) => setBlacklistedPhones(e.target.value)}
                  placeholder="+919800000000 (one per line)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Numbers entered here are blocked from campaigns and automatically marked spam in live chat.
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
            </div>
          </div>
        )}

        {/* TAB 4: BOT SETTINGS matching Page 8 Bottom */}
        {activeTab === 'bot' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Bot className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-800">Bot settings</h2>
            </div>

            <div className="space-y-4 max-w-2xl text-xs text-slate-700">
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
            </div>
          </div>
        )}

        {/* Global Save Button matching PDF */}
        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
