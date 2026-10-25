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
  Check
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
    logout
  } = useApp();

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    </header>
  );
};
