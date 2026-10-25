import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Company, SubscriptionPlan, AuditLog } from '../../types';
import { 
  Crown, 
  Building2, 
  Plus, 
  UserCheck, 
  LogOut, 
  ShieldAlert, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Coins, 
  Zap, 
  History 
} from 'lucide-react';

export const SuperAdminHub: React.FC = () => {
  const {
    companies,
    plans,
    auditLogs,
    startImpersonation,
    createNewCompany,
    savePlan,
    toggleCompanySuspension
  } = useApp();

  const [activeTab, setActiveTab] = useState<'companies' | 'plans' | 'revenue' | 'audit'>('companies');

  // Impersonation Modal State
  const [impersonateTargetCompany, setImpersonateTargetCompany] = useState<Company | null>(null);
  const [impersonateReason, setImpersonateReason] = useState('Diagnostic investigation of campaign delivery queue');

  // Onboarding Modal State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompCode, setNewCompCode] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newPlanId, setNewPlanId] = useState('plan_growth');
  const [newMarketingBonus, setNewMarketingBonus] = useState(10000);
  const [newUtilityBonus, setNewUtilityBonus] = useState(5000);

  // Audit Search State
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState('ALL');

  // Revenue Calculations
  const activeCompanies = companies.filter(c => c.status === 'ACTIVE');
  const totalMRR = activeCompanies.reduce((acc, c) => {
    const plan = plans.find(p => p.id === c.planId);
    return acc + (plan?.monthlyPrice || 0);
  }, 0);
  const totalARR = totalMRR * 12;

  const handleStartImpersonate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!impersonateTargetCompany || !impersonateReason.trim()) return;
    startImpersonation(impersonateTargetCompany.id, impersonateReason.trim());
    setImpersonateTargetCompany(null);
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim() || !newCompCode.trim()) return;

    createNewCompany(
      {
        name: newCompName.trim(),
        code: newCompCode.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        ownerName: newOwnerName.trim() || 'Tenant Owner',
        ownerEmail: newOwnerEmail.trim() || 'owner@tenant.com',
        timezone: 'America/New_York',
        currency: 'USD'
      },
      newPlanId,
      newMarketingBonus,
      newUtilityBonus
    );

    setIsOnboardingOpen(false);
    setNewCompName('');
    setNewCompCode('');
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    if (auditCategoryFilter !== 'ALL' && log.category !== auditCategoryFilter) return false;
    if (auditSearchQuery.trim()) {
      const q = auditSearchQuery.toLowerCase();
      return (
        log.actorEmail.toLowerCase().includes(q) ||
        log.companyName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Super Admin Console
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Multi-Company Management, Plans & Impersonation
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tenant lifecycle, subscription plans, MRR/ARR analytics, secure impersonation audit & activity log.
          </p>
        </div>

        <button
          onClick={() => setIsOnboardingOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-950/50 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Onboard New Tenant Company</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('companies')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'companies'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Companies Directory ({companies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('revenue')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'revenue'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Revenue & MRR/ARR</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'plans'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscription Plans ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'audit'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>System Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: COMPANIES DIRECTORY & IMPERSONATION */}
      {activeTab === 'companies' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>Registered Tenant Organizations</span>
            </h2>
            <span className="text-xs text-slate-400">
              {companies.filter(c => c.status === 'ACTIVE').length} Active &bull; {companies.filter(c => c.status === 'SUSPENDED').length} Suspended
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Company Name & Code</th>
                  <th className="py-3 px-3">Plan Tier</th>
                  <th className="py-3 px-3">Owner Contact</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-4 text-right">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {companies.map((comp) => {
                  const plan = plans.find(p => p.id === comp.planId);
                  return (
                    <tr key={comp.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{comp.name}</div>
                        <div className="font-mono text-purple-300 text-[10px]">{comp.code} &bull; {comp.id}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {plan?.name || 'Custom'} (${plan?.monthlyPrice}/mo)
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-400">
                        <div className="text-slate-200">{comp.ownerName}</div>
                        <div>{comp.ownerEmail}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          comp.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {comp.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[11px] font-mono text-slate-400">
                        {new Date(comp.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        {/* Login As Company Button */}
                        <button
                          onClick={() => setImpersonateTargetCompany(comp)}
                          className="px-2.5 py-1 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition inline-flex items-center space-x-1"
                          title="Impersonate company session with audit trail"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Login as Company</span>
                        </button>

                        <button
                          onClick={() => toggleCompanySuspension(comp.id)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                            comp.status === 'ACTIVE'
                              ? 'bg-slate-800 text-rose-400 border-slate-700 hover:bg-slate-700'
                              : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
                          }`}
                        >
                          {comp.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REVENUE & FINANCIAL ANALYTICS */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Monthly Recurring Revenue (MRR)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mt-2">
                ${totalMRR.toLocaleString()}
                <span className="text-xs font-normal text-slate-400"> / month</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Calculated from {activeCompanies.length} active enterprise subscriptions</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Annual Run Rate (ARR)</span>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mt-2">
                ${totalARR.toLocaleString()}
                <span className="text-xs font-normal text-slate-400"> / year</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Projected annualized revenue excluding overages</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Active Paying Tenants</span>
                <Building2 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mt-2">
                {activeCompanies.length}
                <span className="text-xs font-normal text-slate-400"> / {companies.length} total</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">0% churn across active Q4 billing periods</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUBSCRIPTION PLANS */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  <span className="text-lg font-extrabold text-purple-400">${plan.monthlyPrice}<span className="text-xs text-slate-400 font-normal">/mo</span></span>
                </div>

                <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Marketing Quota:</span>
                    <strong className="text-indigo-300 font-mono">{plan.marketingCreditsQuota.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Utility Quota:</span>
                    <strong className="text-emerald-300 font-mono">{plan.utilityCreditsQuota.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Agent Seats:</span>
                    <strong className="text-white font-mono">{plan.agentSeatLimit}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>API Rate Limit:</span>
                    <strong className="text-white font-mono">{plan.rateLimitRpm} RPM</strong>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  {Array.isArray(plan.features) && plan.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Over-limit policy: <strong>{plan.overLimitAction}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SYSTEM AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-4">
          <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <History className="w-4 h-4 text-purple-400" />
                <span>Enterprise Audit Logs</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Immutable record of logins, credit allocations, API key actions & impersonation sessions.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  placeholder="Filter audit logs..."
                  className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-48"
                />
              </div>

              <select
                value={auditCategoryFilter}
                onChange={(e) => setAuditCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="AUTH">AUTH</option>
                <option value="CREDIT">CREDIT</option>
                <option value="CAMPAIGN">CAMPAIGN</option>
                <option value="API_CREDENTIAL">API_CREDENTIAL</option>
                <option value="IMPERSONATION">IMPERSONATION</option>
                <option value="COMPANY_LIFECYCLE">COMPANY_LIFECYCLE</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Timestamp & IP</th>
                  <th className="py-2.5 px-3">Actor & Role</th>
                  <th className="py-2.5 px-3">Category & Action</th>
                  <th className="py-2.5 px-3">Company Target</th>
                  <th className="py-2.5 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAuditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400">
                      <div>{new Date(log.timestamp).toLocaleString()}</div>
                      <div className="text-slate-500">{log.ipAddress}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-white font-medium">{log.actorEmail}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.actorRole}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-800 text-purple-300 border border-slate-700">
                        {log.category}
                      </span>
                      <div className="text-[11px] font-semibold text-slate-200 mt-0.5">{log.action}</div>
                    </td>

                    <td className="py-2.5 px-3 text-[11px] text-slate-300">
                      {log.companyName}
                    </td>

                    <td className="py-2.5 px-4 text-slate-300 text-xs">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* IMPERSONATION MODAL */}
      {impersonateTargetCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Login as Company (Tenant Impersonation)</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to enter <strong>{impersonateTargetCompany.name}</strong> ({impersonateTargetCompany.code}).
              All actions taken will be logged in the permanent audit trail under your Super Admin credentials.
            </p>

            <form onSubmit={handleStartImpersonate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Audit Justification & Reason (Required)</label>
                <input
                  type="text"
                  value={impersonateReason}
                  onChange={(e) => setImpersonateReason(e.target.value)}
                  placeholder="e.g. Diagnostic investigation of webhook failures / Ticket #9921"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setImpersonateTargetCompany(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-md shadow-amber-950/50"
                >
                  Assume Tenant Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONBOARDING MODAL */}
      {isOnboardingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Onboard New Tenant Company</span>
              </h3>
              <button onClick={() => setIsOnboardingOpen(false)} className="text-slate-400 hover:text-white text-lg">&times;</button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={newCompName}
                  onChange={(e) => {
                    setNewCompName(e.target.value);
                    if (!newCompCode) setNewCompCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                  }}
                  placeholder="e.g. Nexus Electronics Ltd"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Company Code (Unique Tenant Slug)</label>
                <input
                  type="text"
                  value={newCompCode}
                  onChange={(e) => setNewCompCode(e.target.value)}
                  placeholder="e.g. nexus_electronics"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="e.g. Robert Vance"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Owner Email</label>
                  <input
                    type="email"
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    placeholder="e.g. r.vance@nexus.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Subscription Plan</label>
                <select
                  value={newPlanId}
                  onChange={(e) => setNewPlanId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${p.monthlyPrice}/mo)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Welcome Marketing Credits</label>
                  <input
                    type="number"
                    value={newMarketingBonus}
                    onChange={(e) => setNewMarketingBonus(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Welcome Utility Credits</label>
                  <input
                    type="number"
                    value={newUtilityBonus}
                    onChange={(e) => setNewUtilityBonus(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOnboardingOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
