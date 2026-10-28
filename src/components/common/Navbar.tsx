import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Globe, 
  Power, 
  Coins, 
  Zap, 
  ShieldAlert, 
  Building2, 
  ChevronDown, 
  Crown, 
  UserCheck, 
  LogOut, 
  LogIn, 
  UserPlus,
  Check,
  Database,
  RefreshCw,
  Copy,
  ExternalLink,
  X
} from 'lucide-react';

interface NavbarProps {
  breadcrumb: string;
  onBackToAccount?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ breadcrumb, onBackToAccount }) => {
  const {
    currentUser,
    currentCompany,
    companies,
    users,
    switchUser,
    currentWallet,
    impersonationState,
    startImpersonation,
    stopImpersonation,
    setAuthView,
    logout,
    supabaseStatus,
    isSupabaseSyncing,
    syncWithSupabase,
    syncAllToSupabase,
    copySupabaseSqlFix
  } = useApp();

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [pushingAll, setPushingAll] = useState(false);
  const [pushSummary, setPushSummary] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handlePushAll = async () => {
    setPushingAll(true);
    setPushSummary(null);
    try {
      const res = await syncAllToSupabase();
      if (res.success) {
        const total = Object.values(res.syncedCounts).reduce((a, b) => a + b, 0);
        setPushSummary(`Successfully synced ${total} records across ${Object.keys(res.syncedCounts).length} tables!`);
      } else {
        setPushSummary(`Sync notice: ${Object.values(res.errors).slice(0, 2).join('; ') || 'Check RLS rules'}`);
      }
    } catch (e: any) {
      setPushSummary(`Sync error: ${e.message}`);
    } finally {
      setPushingAll(false);
      setTimeout(() => setPushSummary(null), 6000);
    }
  };

  const marketingAvail = currentWallet.marketingTotal - currentWallet.marketingReserved - currentWallet.marketingConsumed;
  const utilityAvail = currentWallet.utilityTotal - currentWallet.utilityReserved - currentWallet.utilityConsumed;

  const isSuperAdmin = currentUser.role === 'super_admin';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCompany = (comp: typeof companies[0]) => {
    setIsCompanyDropdownOpen(false);
    startImpersonation(comp.id, `Administrative session for ${comp.name}`);
  };

  const handleSelectSuperAdmin = () => {
    setIsCompanyDropdownOpen(false);
    if (impersonationState.isImpersonating) {
      stopImpersonation();
    } else {
      const adminUsr = users.find(u => u.role === 'super_admin');
      if (adminUsr) switchUser(adminUsr.id);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs select-none">
      {/* High-Visibility Impersonation Alert Banner */}
      {impersonationState.isImpersonating && (
        <div className="bg-amber-500 text-slate-900 px-4 py-1.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-medium gap-2 border-b border-amber-600">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-slate-950 shrink-0" />
            <span>
              <strong>SUPER ADMIN IMPERSONATING:</strong> Logged into client organization{' '}
              <strong className="underline">{currentCompany.name}</strong> ({currentCompany.company_uid || currentCompany.code})
              as <strong>{currentUser.name}</strong>.
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-0.5 rounded text-[11px] font-bold cursor-pointer"
            >
              Switch Client ▾
            </button>
            <button
              onClick={stopImpersonation}
              className="bg-slate-900 hover:bg-black text-amber-300 px-2.5 py-0.5 rounded text-[11px] font-bold border border-amber-400 cursor-pointer shadow-xs"
            >
              Return to Super Admin
            </button>
          </div>
        </div>
      )}

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Breadcrumb matching PDF */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 tracking-wide uppercase">
          <span className="text-slate-800">{breadcrumb}</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Separate Marketing & Utility Credits Quick Glance */}
          <div className="hidden lg:flex items-center space-x-2.5 text-xs">
            <div className="flex items-center space-x-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-md" title="Independent Marketing Credit Balance">
              <Coins className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-semibold text-[11px]">Marketing:</span>
              <strong className="font-bold">{marketingAvail.toLocaleString()}</strong>
            </div>

            <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-md" title="Independent Utility Credit Balance">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold text-[11px]">Utility:</span>
              <strong className="font-bold">{utilityAvail.toLocaleString()}</strong>
            </div>
          </div>

          {/* DYNAMIC CLIENT & PERSONA SWITCHER (Replacing the static 2-button toggle from image) */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shadow-xs">
              {/* Button 1: Super Admin */}
              <button
                type="button"
                onClick={handleSelectSuperAdmin}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition flex items-center space-x-1 cursor-pointer ${
                  isSuperAdmin && !impersonationState.isImpersonating
                    ? 'bg-white text-purple-700 shadow-xs border border-purple-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Crown className="w-3 h-3 text-purple-600" />
                <span>Super Admin</span>
              </button>

              {/* Button 2: Active Client / Dropdown for ALL Clients */}
              <button
                type="button"
                onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition flex items-center space-x-1 cursor-pointer ${
                  !isSuperAdmin || impersonationState.isImpersonating
                    ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3 h-3 text-emerald-600" />
                <span className="max-w-[120px] truncate">
                  {impersonationState.isImpersonating 
                    ? currentCompany.name 
                    : (!isSuperAdmin ? currentCompany.name : 'Client Accounts')}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Dropdown Menu listing ALL clients so Super Admin can login as any client */}
            {isCompanyDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
                  <span>Switch Client Organization</span>
                  <span className="text-blue-600 font-mono">{companies.length} clients</span>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                  {companies.map((comp) => {
                    const isSelected = currentCompany.id === comp.id && (!isSuperAdmin || impersonationState.isImpersonating);
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => handleSelectCompany(comp)}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition flex items-center justify-between ${
                          isSelected ? 'bg-emerald-50/60 font-semibold text-emerald-900' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-bold text-xs truncate flex items-center space-x-1.5">
                            <span>{comp.name}</span>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {comp.company_uid || comp.code} &bull; {comp.ownerName}
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                          Login &rarr;
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50/70 space-y-1">
                  <button
                    type="button"
                    onClick={() => { setIsCompanyDropdownOpen(false); setAuthView('register_company'); }}
                    className="w-full text-left px-2 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Register New Company Account</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsCompanyDropdownOpen(false); setAuthView('login'); }}
                    className="w-full text-left px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 flex items-center space-x-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-400" />
                    <span>Go to Single Login Page</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Direct Public Page Links for Testing & Quick Access */}
          <div className="hidden sm:flex items-center space-x-1.5 text-xs">
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition"
              title="Open Unified Single Login Page"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthView('register_company')}
              className="px-2 py-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition font-semibold"
              title="Open Direct Company Registration Page"
            >
              + Register
            </button>
          </div>

          {/* Supabase Status Pill */}
          <button
            type="button"
            onClick={() => setIsSupabaseModalOpen(true)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition cursor-pointer shadow-2xs ${
              supabaseStatus.isConnected
                ? supabaseStatus.isRlsRestricted
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title="Click to view Supabase connection status & RLS fix script"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline font-bold">Supabase:</span>
            <span>{supabaseStatus.isConnected ? (supabaseStatus.isRlsRestricted ? 'RLS Active' : 'Live') : 'Offline'}</span>
            <span className={`w-2 h-2 rounded-full ${
              supabaseStatus.isConnected
                ? supabaseStatus.isRlsRestricted ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                : 'bg-slate-400'
            }`} />
          </button>

          {/* Language Selector */}
          <div className="hidden md:flex items-center space-x-1 text-slate-500 text-xs font-medium cursor-pointer hover:text-slate-800">
            <Globe className="w-3.5 h-3.5" />
            <span>English</span>
          </div>

          {/* User Avatar & Logout */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className={`w-7 h-7 rounded-full text-white font-bold flex items-center justify-center text-xs shadow-xs ${
              isSuperAdmin && !impersonationState.isImpersonating ? 'bg-purple-600' : 'bg-blue-600'
            }`}>
              {currentUser.name.substring(0, 1).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono leading-none">
                {isSuperAdmin && !impersonationState.isImpersonating ? 'Super Admin' : (currentCompany.company_uid || 'Client')}
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
              title="Sign Out to Login Page"
            >
              <Power className="w-4 h-4 text-slate-400 hover:text-rose-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Diagnostic & RLS Fix Modal */}
      {isSupabaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden text-slate-800">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Supabase Integration & Database Sync</h3>
              </div>
              <button
                onClick={() => setIsSupabaseModalOpen(false)}
                className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Connection Status Box */}
              <div className="p-3 rounded-lg border bg-slate-50 border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Project Endpoint:</span>
                  <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px] truncate max-w-[280px]">
                    {supabaseStatus.projectUrl || 'Not Configured'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Sync Status:</span>
                  <div className="flex items-center space-x-1.5 font-bold">
                    <span className={`w-2 h-2 rounded-full ${supabaseStatus.isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className={supabaseStatus.isConnected ? 'text-emerald-700' : 'text-rose-600'}>
                      {supabaseStatus.isConnected ? 'Connected & Verified' : 'Connection Failed'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Webhook Base URL:</span>
                  <span className="font-mono text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                    https://whatsappcloud-virid.vercel.app/api/webhook
                  </span>
                </div>
              </div>

              {/* RLS Alert and Fix Button */}
              {supabaseStatus.isRlsRestricted && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2 text-amber-900">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-[12px] flex items-center space-x-1">
                        <span>⚠️ Row-Level Security (RLS) Active in Supabase</span>
                      </div>
                      <p className="text-[11px] text-amber-800 mt-1">
                        Supabase blocks anonymous browser inserts by default. To allow the CRM to write directly to your tables, copy the SQL fix below and run it once in your Supabase SQL Editor.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      copySupabaseSqlFix();
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-xs"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'SQL Fix Copied to Clipboard!' : 'Copy SQL Fix Script for Supabase'}</span>
                  </button>
                </div>
              )}

              {/* Two-Way Sync Actions */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Full Platform Synchronization:</span>
                  <span className="text-[10px] text-blue-700 font-semibold bg-white px-2 py-0.5 rounded border border-blue-200">
                    Live 2-Way Sync
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Share all 14 tables (companies, users, contacts, templates, campaigns, messages, bot rules, wallets & keys) directly with Supabase.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handlePushAll}
                    disabled={pushingAll || isSupabaseSyncing}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${pushingAll ? 'animate-spin' : ''}`} />
                    <span>{pushingAll ? 'Pushing All Data...' : 'Push Everything to Supabase'}</span>
                  </button>

                  <button
                    onClick={() => syncWithSupabase()}
                    disabled={pushingAll || isSupabaseSyncing}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSupabaseSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSupabaseSyncing ? 'Pulling Data...' : 'Pull Everything from Supabase'}</span>
                  </button>
                </div>

                {pushSummary && (
                  <div className="p-2 rounded bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-[11px] font-semibold flex items-center space-x-1.5 animate-in fade-in">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{pushSummary}</span>
                  </div>
                )}
              </div>

              {/* Available Tables */}
              <div>
                <div className="font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Detected Supabase Tables & Synced Rows:</span>
                  <span className="text-[10px] text-slate-400">14 Tables Monitored</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(supabaseStatus.tablesAvailable).map(([tbl, isAvail]) => {
                    const rowCount = supabaseStatus.tableCounts?.[tbl] ?? (isAvail ? 'Synced' : 0);
                    return (
                      <div 
                        key={tbl}
                        className={`p-2 rounded border text-center transition ${
                          isAvail 
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 font-semibold' 
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="font-mono text-[11px] truncate" title={tbl}>{tbl}</div>
                        <div className="text-[10px] mt-0.5 flex items-center justify-center space-x-1">
                          <span>{isAvail ? '✓' : '—'}</span>
                          <span className="font-bold font-mono">{typeof rowCount === 'number' ? `${rowCount} rows` : rowCount}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  copySupabaseSqlFix();
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="text-slate-600 hover:text-slate-900 font-medium text-xs flex items-center space-x-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSql ? 'Copied Full SQL!' : 'Copy Full Table Creation & Permissions SQL'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsSupabaseModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
