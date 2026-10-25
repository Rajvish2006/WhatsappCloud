import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Campaign, CreditCategory, MetaTemplate } from '../../types';
import { 
  Send, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Play, 
  Pause, 
  XCircle, 
  Calendar, 
  Coins, 
  Zap, 
  Copy, 
  Plus, 
  Eye, 
  ArrowLeft 
} from 'lucide-react';

interface CampaignViewProps {
  initialCreateMode?: boolean;
}

export const CampaignView: React.FC<CampaignViewProps> = ({ initialCreateMode = false }) => {
  const {
    campaigns,
    templates,
    contacts,
    currentWallet,
    wabaConfig,
    createCampaign,
    pauseCampaign,
    resumeCampaign,
    cancelCampaign,
    runCampaignSimulationStep
  } = useApp();

  const [isCreating, setIsCreating] = useState(initialCreateMode);

  // Form State matching Page 3 Bottom of PDF
  const [campaignName, setCampaignName] = useState('Festival Offer Campaign');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [selectedContactPhone, setSelectedContactPhone] = useState<string>('all');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [ignoreScheduleAndSendNow, setIgnoreScheduleAndSendNow] = useState(true);
  const [variable1Value, setVariable1Value] = useState('123456');
  const [matchField, setMatchField] = useState('name');
  const [campaignCategory, setCampaignCategory] = useState<CreditCategory>('MARKETING');
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const targetRecipients = selectedContactPhone === 'all'
    ? contacts
    : contacts.filter(c => c.phone === selectedContactPhone);

  const marketingAvail = currentWallet.marketingTotal - currentWallet.marketingReserved - currentWallet.marketingConsumed;
  const utilityAvail = currentWallet.utilityTotal - currentWallet.utilityReserved - currentWallet.utilityConsumed;

  const handleApplySend = () => {
    const required = targetRecipients.length;
    const avail = campaignCategory === 'MARKETING' ? marketingAvail : utilityAvail;

    if (avail < required) {
      alert(`Insufficient ${campaignCategory} credits. Required: ${required}, Available: ${avail}`);
      return;
    }

    const payload = targetRecipients.map(c => ({
      contactId: c.id,
      phone: c.phone,
      name: c.name,
      variables: {
        '1': matchField === 'manually' ? variable1Value : c.name
      }
    }));

    const res = createCampaign({
      companyId: '',
      name: campaignName,
      category: campaignCategory,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      totalRecipients: required,
      batchSize: 50,
      concurrency: 4,
      sendRateMs: 200,
      maxRetryAttempts: 3,
      variableMapping: { '1': matchField },
      recipients: payload
    });

    if (res.success) {
      setSendSuccessMessage(`Campaign "${campaignName}" successfully created and queued! Reserved ${required} ${campaignCategory} credits.`);
      setIsCreating(false);
      setTimeout(() => setSendSuccessMessage(null), 6000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header matching Page 3 Top of PDF */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Campaigns management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Send broadcasts, OTP notifications, and transactional updates</p>
        </div>

        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send new campaign {wabaConfig.displayPhoneNumber.replace(/[\s()-]/g, '')}</span>
          </button>
        ) : (
          <button
            onClick={() => setIsCreating(false)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to campaigns list</span>
          </button>
        )}
      </div>

      {sendSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center space-x-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{sendSuccessMessage}</span>
        </div>
      )}

      {/* 3-COLUMN CAMPAIGN SENDER matching Page 3 Bottom of PDF */}
      {isCreating ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* COLUMN 1: Campaign Details */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Campaign</h2>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Campaign name</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Name for your campaign"
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} [{t.category}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contacts</label>
              <select
                value={selectedContactPhone}
                onChange={(e) => setSelectedContactPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Select Contacts (All {contacts.length} Contacts)</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.phone}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Scheduled send time</label>
              <input
                type="text"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="dd-mm-yyyy --:--"
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Per client, based on the contact timezone</span>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="ignore_sched"
                checked={ignoreScheduleAndSendNow}
                onChange={(e) => setIgnoreScheduleAndSendNow(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <label htmlFor="ignore_sched" className="text-slate-700 font-medium cursor-pointer">
                Ignore scheduled time and send now
              </label>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleApplySend}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-xs transition cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>

          {/* COLUMN 2: Variables Mapping */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Variables</h2>

            <div>
              <div className="font-semibold text-slate-800 mb-1">Body</div>
              <label className="block text-slate-500 text-[11px] mb-1">Variable 1</label>
              <input
                type="text"
                value={variable1Value}
                onChange={(e) => setVariable1Value(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Match with a contact field</label>
              <select
                value={matchField}
                onChange={(e) => setMatchField(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-800 focus:outline-none"
              >
                <option value="name">Contact Full Name</option>
                <option value="phone">Phone Number</option>
                <option value="manually">Use manually defined value</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="font-semibold text-slate-800 mb-1">Buttons</div>
              <label className="block text-slate-500 text-[11px] mb-1">Copy code</label>
              <input
                type="text"
                readOnly
                value="https://www.whatsapp.com/otp/code?token=123"
                className="w-full bg-slate-100 border border-slate-200 rounded-md p-2 text-slate-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Match with a contact field</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-800 focus:outline-none">
                <option>Use manually defined value</option>
                <option>Custom Auth Token</option>
              </select>
            </div>
          </div>

          {/* COLUMN 3: Preview & Send campaign */}
          <div className="lg:col-span-4 space-y-4">
            {/* WhatsApp Preview Card matching Page 3 */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Preview</h2>

              {/* Chat Bubble Mockup */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-slate-800 space-y-2.5 shadow-2xs">
                {selectedTemplate.headerText && (
                  <div className="font-bold text-slate-900">{selectedTemplate.headerText}</div>
                )}
                <p className="leading-relaxed whitespace-pre-wrap font-sans">
                  "{variable1Value}" is your verification code. For your security, do not share this code.
                </p>
                <div className="text-[10px] text-slate-400">Expires in 5 minutes.</div>

                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-center">
                  <div className="text-blue-600 font-semibold text-xs flex items-center space-x-1">
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy code</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Send campaign Card matching Page 3 */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 text-xs">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Send campaign</h2>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600 font-medium">Credit Unit:</span>
                <span className="text-base font-bold text-slate-800 font-mono">9999</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Deduct from Credit Bucket</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCampaignCategory('MARKETING')}
                    className={`p-2 rounded border font-semibold flex items-center space-x-1.5 ${
                      campaignCategory === 'MARKETING'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5 text-blue-600" />
                    <span>Marketing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCampaignCategory('UTILITY')}
                    className={`p-2 rounded border font-semibold flex items-center space-x-1.5 ${
                      campaignCategory === 'UTILITY'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Utility</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplySend}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-xs transition cursor-pointer"
              >
                Send campaign now
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* CAMPAIGNS LIST & BATCH PROGRESS */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {campaigns.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Send className="w-8 h-8" />
              </div>
              <div className="text-sm font-semibold text-slate-700">There are no campaigns, send your first one!</div>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-md shadow-xs"
              >
                Send new campaign
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {campaigns.map((camp) => (
                <div key={camp.id} className="p-4 hover:bg-slate-50/80 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800 text-sm">{camp.name}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase border border-blue-200">
                          {camp.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">
                          {camp.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        Template: {camp.templateName} &bull; Recipients: {camp.totalRecipients} &bull; Credits Reserved: {camp.creditsReserved}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {camp.status === 'processing' && (
                        <button
                          onClick={() => runCampaignSimulationStep(camp.id)}
                          className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center space-x-1"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Simulate Batch Send</span>
                        </button>
                      )}

                      <span className="text-xs text-slate-500 font-mono">
                        Delivered: <strong className="text-emerald-700">{camp.deliveredCount}</strong> &bull; Read: <strong className="text-blue-700">{camp.readCount}</strong> &bull; Failed: <strong className="text-rose-600">{camp.failedCount}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
