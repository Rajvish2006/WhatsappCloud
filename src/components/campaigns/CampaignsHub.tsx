import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Campaign, CampaignStatus, CreditCategory, MetaTemplate } from '../../types';
import { 
  Megaphone, 
  Plus, 
  Play, 
  Pause, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  Layers, 
  AlertTriangle, 
  Coins, 
  Zap, 
  Users, 
  Sparkles, 
  RotateCw,
  Search,
  Filter,
  Eye,
  Sliders
} from 'lucide-react';

export const CampaignsHub: React.FC = () => {
  const {
    campaigns,
    templates,
    contacts,
    groups,
    currentWallet,
    createCampaign,
    pauseCampaign,
    resumeCampaign,
    cancelCampaign,
    runCampaignSimulationStep
  } = useApp();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedReportCampaign, setSelectedReportCampaign] = useState<Campaign | null>(null);

  // Wizard Form State
  const [campaignName, setCampaignName] = useState('Holiday VIP Special Offer');
  const [campaignCategory, setCampaignCategory] = useState<CreditCategory>('MARKETING');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [variableMappings, setVariableMappings] = useState<Record<string, string>>({
    '1': 'name',
    '2': 'discount_code'
  });
  const [batchSize, setBatchSize] = useState<number>(50);
  const [concurrency, setConcurrency] = useState<number>(4);
  const [sendRateMs, setSendRateMs] = useState<number>(200);
  const [maxRetryAttempts, setMaxRetryAttempts] = useState<number>(3);
  const [wizardError, setWizardError] = useState<string | null>(null);

  // Audience validation simulation
  const targetGroup = groups.find(g => g.id === selectedGroupId);
  const validContacts = contacts.filter(c => {
    if (campaignCategory === 'MARKETING' && c.consentStatus !== 'OPTED_IN') return false;
    return true;
  });

  const availableCredits = campaignCategory === 'MARKETING'
    ? (currentWallet.marketingTotal - currentWallet.marketingReserved - currentWallet.marketingConsumed)
    : (currentWallet.utilityTotal - currentWallet.utilityReserved - currentWallet.utilityConsumed);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const handleLaunchCampaign = () => {
    if (availableCredits < validContacts.length) {
      setWizardError(`Insufficient ${campaignCategory} credits. Available: ${availableCredits}, Required: ${validContacts.length}`);
      return;
    }

    const payloadRecipients = validContacts.map(c => ({
      contactId: c.id,
      phone: c.phone,
      name: c.name,
      variables: {
        '1': c.name,
        '2': 'HOLIDAY-VIP-30',
        '3': 'FedEx Express',
        '4': 'https://track.example.com'
      }
    }));

    const result = createCampaign({
      companyId: '',
      name: campaignName,
      category: campaignCategory,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      totalRecipients: payloadRecipients.length,
      batchSize,
      concurrency,
      sendRateMs,
      maxRetryAttempts,
      variableMapping: variableMappings,
      recipients: payloadRecipients
    });

    if (result.success) {
      setIsWizardOpen(false);
      setWizardStep(1);
    } else {
      setWizardError(result.error || 'Failed to create campaign');
    }
  };

  const exportCampaignReportCSV = (camp: Campaign) => {
    const headers = ['Recipient Phone', 'Name', 'Status', 'Message ID (WAMID)', 'Idempotency Key', 'Error Code', 'Retry Count'];
    const rows = camp.recipients.map(r => [
      r.phone,
      r.name,
      r.status,
      r.wabaMessageId || 'N/A',
      r.idempotencyKey,
      r.errorCode || '',
      r.retryCount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campaign_report_${camp.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Campaign Lifecycle Engine
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Campaign Management, Batching & Idempotency
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            4-step wizard, variable mapping, exponential backoff, worker concurrency, and atomic credit reservation.
          </p>
        </div>

        <button
          onClick={() => { setIsWizardOpen(true); setWizardStep(1); setWizardError(null); }}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-950/50 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New 4-Step Campaign</span>
        </button>
      </div>

      {/* Campaigns List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Megaphone className="w-4 h-4 text-indigo-400" />
            <span>Campaigns ({campaigns.length})</span>
          </h2>
          <span className="text-xs text-slate-400">
            Click "Simulate Batch Tick" to advance live worker queues
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {campaigns.map((camp) => {
            const progressPct = camp.totalRecipients > 0 ? (camp.sentCount / camp.totalRecipients) * 100 : 0;
            return (
              <div key={camp.id} className="p-5 hover:bg-slate-800/30 transition space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="font-bold text-sm text-white">{camp.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        camp.category === 'MARKETING'
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {camp.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        camp.status === 'processing' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse' :
                        camp.status === 'completed' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                        camp.status === 'paused' ? 'bg-slate-700 text-slate-300 border-slate-600' :
                        'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}>
                        {camp.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-mono">
                      Template: {camp.templateName} &bull; Batch Size: {camp.batchSize} &bull; Concurrency: {camp.concurrency}x &bull; Started: {new Date(camp.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Actions & Simulation Tick */}
                  <div className="flex items-center space-x-2">
                    {camp.status === 'processing' && (
                      <>
                        <button
                          onClick={() => runCampaignSimulationStep(camp.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1"
                          title="Simulate processing the next batch chunk"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Dispatch Batch (Meta API)</span>
                        </button>

                        <button
                          onClick={() => pauseCampaign(camp.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs"
                          title="Pause Dispatch"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {camp.status === 'paused' && (
                      <button
                        onClick={() => resumeCampaign(camp.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Resume</span>
                      </button>
                    )}

                    {camp.status !== 'completed' && camp.status !== 'cancelled' && (
                      <button
                        onClick={() => cancelCampaign(camp.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 text-xs"
                        title="Cancel Campaign & Refund Credits"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedReportCampaign(camp)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Report</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Counters */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>
                      Progress: <strong className="text-white font-mono">{camp.sentCount}</strong> / {camp.totalRecipients} ({progressPct.toFixed(1)}%)
                    </span>
                    <span className="space-x-3">
                      <span className="text-emerald-400">Delivered: {camp.deliveredCount}</span>
                      <span className="text-indigo-400">Read: {camp.readCount}</span>
                      <span className="text-rose-400">Failed: {camp.failedCount}</span>
                      <span className="text-slate-500">Skipped: {camp.skippedCount}</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                    <div style={{ width: `${progressPct}%` }} className="bg-indigo-500 h-full transition-all duration-300" />
                  </div>
                </div>

                {/* Credit Reservation Summary Pill */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                  <span>Atomic Credits Locked: <strong className="text-amber-300">{camp.creditsReserved}</strong></span>
                  <span>Consumed: <strong className="text-indigo-300">{camp.creditsConsumed}</strong></span>
                  <span>Auto-Refunded on Failures: <strong className="text-emerald-300">{camp.creditsRefunded}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-STEP CAMPAIGN WIZARD MODAL */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Wizard Step Indicator */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Megaphone className="w-4 h-4 text-indigo-400" />
                  <span>Campaign Launch Wizard</span>
                </h3>
                <p className="text-xs text-slate-400">Step {wizardStep} of 4</p>
              </div>
              <button onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-white text-lg">&times;</button>
            </div>

            {/* Stepper Tabs */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
              <div className={`p-2 rounded border ${wizardStep === 1 ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                1. Campaign Setup
              </div>
              <div className={`p-2 rounded border ${wizardStep === 2 ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                2. Audience & Filters
              </div>
              <div className={`p-2 rounded border ${wizardStep === 3 ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                3. Variable Mapping
              </div>
              <div className={`p-2 rounded border ${wizardStep === 4 ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                4. Batch & Reserve
              </div>
            </div>

            {wizardError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{wizardError}</span>
              </div>
            )}

            {/* STEP 1: CAMPAIGN DETAILS & CATEGORY */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Messaging Category & Credit Deductions</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCampaignCategory('MARKETING')}
                      className={`p-3 rounded-lg border text-left font-semibold flex items-start space-x-3 ${
                        campaignCategory === 'MARKETING'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Coins className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <div>Marketing Campaign</div>
                        <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                          Promotions, product drops, and discounts. Consumes Marketing credits.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCampaignCategory('UTILITY')}
                      className={`p-3 rounded-lg border text-left font-semibold flex items-start space-x-3 ${
                        campaignCategory === 'UTILITY'
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div>Utility Campaign</div>
                        <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                          Order confirmations, account alerts, logistics updates. Consumes Utility credits.
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg"
                  >
                    Next: Target Audience &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: AUDIENCE & VALIDATION */}
            {wizardStep === 2 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Select Contact Group / Segment</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.contactCount} contacts) {g.isDynamic ? '[Dynamic Segment]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Audience Validation Results */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="font-semibold text-white flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Audience Validation & Consent Filter</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <div className="text-slate-400">Total Contacts</div>
                      <div className="font-bold text-white text-sm mt-0.5">{contacts.length}</div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <div className="text-emerald-400">Valid & Opted-In</div>
                      <div className="font-bold text-emerald-400 text-sm mt-0.5">{validContacts.length}</div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <div className="text-amber-400">Excluded (Opt-Out/Invalid)</div>
                      <div className="font-bold text-amber-400 text-sm mt-0.5">{contacts.length - validContacts.length}</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-3">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-medium rounded-lg"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setWizardStep(3)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg"
                  >
                    Next: Template & Variables &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: TEMPLATE & VARIABLE MAPPING */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Approved Meta Template</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    {templates.filter(t => t.status === 'APPROVED').map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} [{t.category}] ({t.variablesCount} variables)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Variable Mappings */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="font-semibold text-white">Dynamic Placeholder Mapping ({"{{1}}"}, {"{{2}}"})</div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-emerald-400 w-16 font-bold">{"{{1}}"} &rarr;</span>
                      <select
                        value={variableMappings['1'] || 'name'}
                        onChange={(e) => setVariableMappings({ ...variableMappings, '1': e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                      >
                        <option value="name">Contact Full Name</option>
                        <option value="phone">Phone Number</option>
                        <option value="city">City Attribute</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-emerald-400 w-16 font-bold">{"{{2}}"} &rarr;</span>
                      <select
                        value={variableMappings['2'] || 'discount_code'}
                        onChange={(e) => setVariableMappings({ ...variableMappings, '2': e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                      >
                        <option value="discount_code">Dynamic Discount Code (HOLIDAY-VIP-30)</option>
                        <option value="order_id">Order Reference #</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Message Live Preview */}
                <div>
                  <span className="block text-slate-400 mb-1">Live WhatsApp Bubble Preview</span>
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-slate-200">
                    <p className="leading-relaxed whitespace-pre-wrap">{selectedTemplate.bodyText}</p>
                  </div>
                </div>

                <div className="flex justify-between pt-3">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-medium rounded-lg"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setWizardStep(4)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg"
                  >
                    Next: Batching & Reservation &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: BATCHING & ATOMIC CREDIT RESERVATION */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Batch Chunk Size</label>
                    <select
                      value={batchSize}
                      onChange={(e) => setBatchSize(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                    >
                      <option value={25}>25 recipients / batch</option>
                      <option value={50}>50 recipients / batch</option>
                      <option value={100}>100 recipients / batch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Worker Concurrency</label>
                    <select
                      value={concurrency}
                      onChange={(e) => setConcurrency(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                    >
                      <option value={2}>2 parallel streams</option>
                      <option value={4}>4 parallel streams</option>
                      <option value={8}>8 parallel streams</option>
                    </select>
                  </div>
                </div>

                {/* Atomic Credit Reservation Preview Card */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>Atomic Credit Reservation Requirement</span>
                    <span className="font-mono text-indigo-400">{campaignCategory}</span>
                  </div>

                  <div className="flex justify-between text-slate-400 text-xs py-1 border-b border-slate-800">
                    <span>Total Target Recipients:</span>
                    <strong className="text-white font-mono">{validContacts.length}</strong>
                  </div>

                  <div className="flex justify-between text-slate-400 text-xs py-1 border-b border-slate-800">
                    <span>Available {campaignCategory} Balance:</span>
                    <strong className="text-white font-mono">{availableCredits.toLocaleString()}</strong>
                  </div>

                  <div className="flex justify-between text-slate-400 text-xs py-1">
                    <span>Credits to be Locked upon Launch:</span>
                    <strong className="text-amber-300 font-mono">{validContacts.length}</strong>
                  </div>

                  {availableCredits < validContacts.length ? (
                    <div className="p-2 bg-rose-950/40 border border-rose-500/40 rounded text-rose-300 text-[11px] font-bold">
                      INSUFFICIENT CREDITS: Please allocate {validContacts.length - availableCredits} more {campaignCategory} credits.
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 rounded text-emerald-300 text-[11px] flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Balance confirmed. Credits will be locked atomically and released if cancelled.</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-3">
                  <button
                    onClick={() => setWizardStep(3)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-medium rounded-lg"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={handleLaunchCampaign}
                    disabled={availableCredits < validContacts.length}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg shadow-emerald-950/50"
                  >
                    Lock Credits & Launch Campaign
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CAMPAIGN REPORT & IDEMPOTENCY INSPECTOR DRAWER */}
      {selectedReportCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedReportCampaign.name} — Full Report</h3>
                <p className="text-xs text-slate-400">Recipient-Level Idempotency Keys & Delivery Metrics</p>
              </div>
              <button onClick={() => setSelectedReportCampaign(null)} className="text-slate-400 hover:text-white text-lg">&times;</button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <div className="text-slate-400">Total</div>
                <div className="font-bold text-white text-base">{selectedReportCampaign.totalRecipients}</div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <div className="text-emerald-400">Delivered</div>
                <div className="font-bold text-emerald-400 text-base">{selectedReportCampaign.deliveredCount}</div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <div className="text-indigo-400">Read</div>
                <div className="font-bold text-indigo-400 text-base">{selectedReportCampaign.readCount}</div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <div className="text-rose-400">Failed / Refunded</div>
                <div className="font-bold text-rose-400 text-base">{selectedReportCampaign.failedCount}</div>
              </div>
            </div>

            {/* Recipient Rows */}
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Phone</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">WAMID / Idempotency Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedReportCampaign.recipients.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-mono text-emerald-300">{rec.phone}</td>
                      <td className="py-2 px-3 text-white font-medium">{rec.name}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rec.status === 'read' ? 'bg-indigo-500/20 text-indigo-300' :
                          rec.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-300' :
                          rec.status === 'failed' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-400">
                        <div>{rec.wabaMessageId || 'N/A'}</div>
                        <div className="text-slate-500">{rec.idempotencyKey}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => exportCampaignReportCSV(selectedReportCampaign)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Report CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
