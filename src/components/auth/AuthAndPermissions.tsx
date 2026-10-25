import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  AlertTriangle, 
  CheckCircle2, 
  UserX, 
  RefreshCw, 
  Building2, 
  UserCheck, 
  Clock, 
  Terminal,
  Fingerprint
} from 'lucide-react';

export const AuthAndPermissions: React.FC = () => {
  const {
    currentUser,
    currentCompany,
    permissionMatrix,
    updatePermission,
    loginThrottling,
    simulateLoginAttempt,
    resetPassword,
    toggleCompanySuspension
  } = useApp();

  const [testPasswordInput, setTestPasswordInput] = useState('');
  const [resetEmailInput, setResetEmailInput] = useState(currentUser.email);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [suspensionReasonInput, setSuspensionReasonInput] = useState('Terms of Service non-compliance / Audit hold');

  const permissionsList = [
    { key: 'platform:manage_companies', label: 'Manage All Companies & Tenants', module: 'Platform' },
    { key: 'platform:impersonate_tenant', label: 'Impersonate Tenant ("Login as Company")', module: 'Platform' },
    { key: 'platform:manage_plans', label: 'Create & Modify Pricing Plans', module: 'Platform' },
    { key: 'credits:allocate_any', label: 'Top-Up & Allocate Global Credits', module: 'Credits' },
    { key: 'credits:view_all', label: 'View Credit Wallets & Ledger', module: 'Credits' },
    { key: 'campaigns:create', label: 'Create & Schedule Campaigns', module: 'Campaigns' },
    { key: 'campaigns:execute', label: 'Launch Batch Workers', module: 'Campaigns' },
    { key: 'campaigns:cancel', label: 'Cancel & Refund Campaigns', module: 'Campaigns' },
    { key: 'chat:read', label: 'Read Live Chat Conversations', module: 'Live Chat' },
    { key: 'chat:reply', label: 'Send Outbound Messages & Templates', module: 'Live Chat' },
    { key: 'chat:reassign', label: 'Reassign Chat to Other Agents', module: 'Live Chat' },
    { key: 'templates:manage', label: 'Create & Sync Meta Templates', module: 'WhatsApp' },
    { key: 'contacts:manage', label: 'Import CSV, Tag & Export Contacts', module: 'Audience' },
    { key: 'bot:configure', label: 'Configure Bot Automation Rules', module: 'Automation' },
    { key: 'api_keys:manage', label: 'Generate & Revoke Tenant API Keys', module: 'API' },
    { key: 'audit:read', label: 'Inspect System Audit Logs', module: 'Security' }
  ];

  const roles = ['SUPER_ADMIN', 'COMPANY_OWNER', 'ADMIN', 'AGENT'];

  const handleTestPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = testPasswordInput === 'SuperSecret123!';
    simulateLoginAttempt(isCorrect);
    setTestPasswordInput('');
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmailInput) return;
    const ok = resetPassword(resetEmailInput);
    if (ok) {
      setResetSuccessMessage(`Cryptographically signed password reset token dispatched to ${resetEmailInput}. Valid for 15 minutes.`);
      setTimeout(() => setResetSuccessMessage(null), 5000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              P0 Requirement
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Authentication, Session Security & Permission Matrix
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Role-based access control (RBAC), brute-force login throttling, company data isolation & token lifecycle.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center space-x-2">
            <Fingerprint className="w-4 h-4 text-emerald-400" />
            <span>Active Session: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})</span>
          </div>
        </div>
      </div>

      {/* Top 3 Diagnostic Cards: Session Isolation, Throttling, Company Lifecycle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Company Isolation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Building2 className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Company Data Isolation</h2>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Tenant Boundary:</span>
              <strong className="text-white font-mono">{currentCompany.code}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>SQL Row Isolation:</span>
              <span className="text-emerald-400 font-bold">ENFORCED (WHERE company_id)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Session Isolation:</span>
              <span className="text-emerald-400 font-bold">JWT Bound to Tenant</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All database queries, webhooks, and cache partitions are strictly scoped to company UUID. Zero cross-tenant data leakage.
          </p>
        </div>

        {/* Card 2: Login Throttling & Brute-Force Guard */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center space-x-2 text-amber-400">
            <Lock className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Login Throttling Simulator</h2>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Failed Password Attempts:</span>
              <span className={`font-mono font-bold ${
                loginThrottling.failedAttempts >= 4 ? 'text-rose-400' : 'text-amber-300'
              }`}>
                {loginThrottling.failedAttempts} / 5
              </span>
            </div>

            {loginThrottling.isLocked ? (
              <div className="p-2 bg-rose-950/40 border border-rose-500/40 rounded text-rose-300 text-[11px] font-semibold flex items-center space-x-1.5 animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>LOCKED OUT: Retry in {loginThrottling.lockSecondsRemaining}s</span>
              </div>
            ) : (
              <form onSubmit={handleTestPasswordSubmit} className="flex gap-2">
                <input
                  type="password"
                  value={testPasswordInput}
                  onChange={(e) => setTestPasswordInput(e.target.value)}
                  placeholder="Try wrong password..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold text-xs transition"
                >
                  Test
                </button>
              </form>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            5 consecutive invalid password attempts trigger an automated IP & account lock with exponential cooldown.
          </p>
        </div>

        {/* Card 3: Account & Company Suspension */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center space-x-2 text-rose-400">
            <UserX className="w-4 h-4" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Company Suspension Control</h2>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                currentCompany.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {currentCompany.status}
              </span>
            </div>

            <button
              onClick={() => toggleCompanySuspension(currentCompany.id, suspensionReasonInput)}
              className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs transition ${
                currentCompany.status === 'ACTIVE'
                  ? 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {currentCompany.status === 'ACTIVE' ? 'Suspend Current Company' : 'Reactivate Company'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Suspended tenants immediately block outbound campaign dispatch, API keys, and access tokens until unfreezing.
          </p>
        </div>
      </div>

      {/* Password Reset Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2 mb-2">
          <KeyRound className="w-4 h-4 text-indigo-400" />
          <span>Secure Password Reset Simulator</span>
        </h2>
        <form onSubmit={handleResetPasswordSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="email"
            value={resetEmailInput}
            onChange={(e) => setResetEmailInput(e.target.value)}
            placeholder="Enter user email..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition shrink-0"
          >
            Dispatch Reset Token
          </button>
        </form>

        {resetSuccessMessage && (
          <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resetSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Complete Interactive Permission Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Granular Role-Based Permission Matrix (RBAC)</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live permission toggles for SUPER_ADMIN, COMPANY_OWNER, ADMIN, and AGENT roles.
            </p>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            Audit logging active on toggle
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-1/3">Permission Scope & Description</th>
                <th className="py-3 px-3 text-center">SUPER_ADMIN</th>
                <th className="py-3 px-3 text-center">COMPANY_OWNER</th>
                <th className="py-3 px-3 text-center">ADMIN</th>
                <th className="py-3 px-3 text-center">AGENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {permissionsList.map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{perm.label}</div>
                    <div className="font-mono text-[10px] text-slate-400">{perm.key}</div>
                  </td>

                  {roles.map((role) => {
                    const isAllowed = permissionMatrix[role]?.[perm.key] || false;
                    return (
                      <td key={role} className="py-3 px-3 text-center">
                        <button
                          onClick={() => updatePermission(role, perm.key, !isAllowed)}
                          className={`w-7 h-7 rounded-md inline-flex items-center justify-center transition border ${
                            isAllowed
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                              : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
                          }`}
                          title={`Toggle ${perm.key} for ${role}`}
                        >
                          {isAllowed ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
