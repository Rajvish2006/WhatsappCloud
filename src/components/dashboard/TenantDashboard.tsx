import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Send, 
  UserPlus, 
  Bot, 
  FileText, 
  Layers, 
  Users, 
  MessageCircle, 
  Coins, 
  Zap, 
  Radio, 
  CheckCircle2, 
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { AppNavTab } from '../common/Sidebar';

interface TenantDashboardProps {
  onNavigate: (tab: AppNavTab) => void;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({ onNavigate }) => {
  const {
    currentCompany,
    currentUser,
    tenantStats,
    currentWallet,
    wabaConfig
  } = useApp();

  const marketingAvail = currentWallet.marketingTotal - currentWallet.marketingReserved - currentWallet.marketingConsumed;
  const utilityAvail = currentWallet.utilityTotal - currentWallet.utilityReserved - currentWallet.utilityConsumed;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Greeting & Action Buttons matching Page 1 Middle of PDF */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center space-x-2">
            <span>Welcome back, {currentUser.name}</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tenant Account: <strong className="text-slate-700">{currentCompany.name}</strong> ({currentCompany.company_uid})
          </p>
        </div>

        {/* 4 Action Buttons matching PDF */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('campaign-create')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send campaign</span>
          </button>

          <button
            onClick={() => onNavigate('contacts')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create contact</span>
          </button>

          <button
            onClick={() => onNavigate('bots')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Create reply bot</span>
          </button>

          <button
            onClick={() => onNavigate('templates')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Create template</span>
          </button>
        </div>
      </div>

      {/* WABA Settlement & Webhook Configuration Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-slate-900 flex items-center space-x-2">
              <span>WABA & Webhook Settlement Status</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                Settled: {currentCompany.company_uid || currentCompany.code}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Webhook Endpoint: <code className="bg-white/80 px-1.5 py-0.5 rounded text-blue-700 font-mono">https://app.aspai.in/webhook/receive/{currentCompany.company_uid || currentCompany.code}</code> &bull; Anti-Spam Rate Limit Active
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('whatsapp-setup')}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition shrink-0 cursor-pointer"
        >
          Configure Cloud API &rarr;
        </button>
      </div>

      {/* 5 Metric Cards matching Page 1 Middle of PDF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Single Send Templates */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              SINGLE SEND TEMPLATES
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {tenantStats.singleSendTemplates}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {tenantStats.openRatePct}% Open rate
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Send className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Templates */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              TEMPLATES
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {tenantStats.templates}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{tenantStats.approvedTemplates} Approved</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Contacts */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              CONTACTS
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {tenantStats.contacts}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              1 new this month
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Open Chats */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              OPEN CHATS
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {tenantStats.openChats}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              0 Resolved conversations
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <MessageCircle className="w-4 h-4" />
          </div>
        </div>

        {/* Card 5: Credit Limit matching PDF */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              CREDIT LIMIT
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {tenantStats.creditLimit.toLocaleString()}
            </div>
            <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
              Active Quota
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Coins className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* P0 — DUAL SEPARATE CREDIT BALANCES BREAKDOWN */}
      <div className="bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-emerald-50/50 border border-blue-100 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                P0 Architecture
              </span>
              <h2 className="text-sm font-bold text-slate-800">
                Independent Marketing & Utility Credit Accounting
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Separate wallet reserves, atomic campaign hold, automatic failure refunds & double-entry ledger.
            </p>
          </div>

          <button
            onClick={() => onNavigate('credits-ledger')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 cursor-pointer"
          >
            <span>Open Credit Ledger & Reports</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Marketing Credits */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1.5 text-indigo-600 font-bold text-xs uppercase">
                <Coins className="w-4 h-4" />
                <span>Marketing Credits</span>
              </div>
              <div className="text-2xl font-black text-slate-800 mt-1">
                {marketingAvail.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1.5">available to broadcast</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Allocated: <strong className="text-slate-700">{currentWallet.marketingTotal.toLocaleString()}</strong> &bull; Reserved: <strong className="text-amber-600">{currentWallet.marketingReserved.toLocaleString()}</strong>
              </div>
            </div>
            <button
              onClick={() => onNavigate('credits-ledger')}
              className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200"
            >
              + Top-up
            </button>
          </div>

          {/* Utility Message Credits */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1.5 text-emerald-600 font-bold text-xs uppercase">
                <Zap className="w-4 h-4" />
                <span>Utility Message Credits</span>
              </div>
              <div className="text-2xl font-black text-slate-800 mt-1">
                {utilityAvail.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1.5">available for alerts & chat</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Allocated: <strong className="text-slate-700">{currentWallet.utilityTotal.toLocaleString()}</strong> &bull; Reserved: <strong className="text-amber-600">{currentWallet.utilityReserved.toLocaleString()}</strong>
              </div>
            </div>
            <button
              onClick={() => onNavigate('credits-ledger')}
              className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200"
            >
              + Top-up
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Cloud API Official Connection Status Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-800">{wabaConfig.verifiedName}</h2>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Cloud API Connected
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Phone: {wabaConfig.displayPhoneNumber} &bull; Tier: {wabaConfig.metaTier} &bull; Quality: {wabaConfig.qualityRating}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('whatsapp-setup')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
          >
            Manage Webhooks & Credentials
          </button>
        </div>
      </div>
    </div>
  );
};
