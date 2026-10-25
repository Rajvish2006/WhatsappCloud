import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AspLogo } from '../common/AspLogo';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Building2, 
  Crown, 
  Headphones, 
  KeyRound, 
  CheckCircle2, 
  HelpCircle,
  Clock
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { 
    login, 
    loginThrottling, 
    resetPassword, 
    setAuthView,
    users
  } = useApp();

  const [email, setEmail] = useState('admin@whatsappsaas.com');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = login(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to authenticate');
      }
    }, 400);
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setErrorMessage(null);
    const res = login(demoEmail, 'Password@123');
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to authenticate');
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    const ok = resetPassword(resetEmail.trim());
    if (ok) {
      setResetStatus(`Password reset instructions and cryptographic token sent to ${resetEmail}. Check your inbox.`);
    } else {
      setResetStatus(`No registered user found with email ${resetEmail}.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo matching PDF */}
        <div className="flex justify-center mb-3">
          <AspLogo size="lg" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Unified authentication portal for Super Admins, Client Organizations, and Agents
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-slate-200 sm:px-8 space-y-5">
          {/* Brute Force Lockout Alert */}
          {loginThrottling.isLocked && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800 text-xs animate-shake">
              <Clock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <strong className="block font-bold">Security Lockout Active</strong>
                <span>
                  Too many failed login attempts. Throttling enforced. Please wait{' '}
                  <strong className="font-mono text-rose-900">{loginThrottling.lockSecondsRemaining}s</strong> before retrying.
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && !loginThrottling.isLocked && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-blue-600 hover:text-blue-700 text-[11px] font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || loginThrottling.isLocked}
              className={`w-full flex justify-center items-center space-x-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-xs font-bold text-white transition ${
                isLoading || loginThrottling.isLocked
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 cursor-pointer'
              }`}
            >
              <span>{isLoading ? 'Signing In...' : 'Sign in to Platform'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Personas Click */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">
              Instant Demo Personas (1-Click Switch)
            </span>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@whatsappsaas.com')}
                className="p-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-900 text-xs flex items-center space-x-2 transition"
              >
                <Crown className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-[11px]">Super Admin</div>
                  <div className="text-[9px] text-purple-600 font-mono truncate">admin@...</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('bijendra@safel4sign.com')}
                className="p-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-900 text-xs flex items-center space-x-2 transition"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-[11px]">House Seekers</div>
                  <div className="text-[9px] text-blue-600 font-mono truncate">bijendra@...</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('rajesh@abcenterprises.com')}
                className="p-2 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-900 text-xs flex items-center space-x-2 transition"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-[11px]">ABC Enterprises</div>
                  <div className="text-[9px] text-emerald-600 font-mono truncate">rajesh@...</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('rahul@houseseekers.com')}
                className="p-2 border border-amber-200 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-900 text-xs flex items-center space-x-2 transition"
              >
                <Headphones className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-[11px]">Agent Rahul</div>
                  <div className="text-[9px] text-amber-600 font-mono truncate">rahul@...</div>
                </div>
              </button>
            </div>
          </div>

          {/* Link to Register Company Page */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              New client organization?{' '}
              <button
                type="button"
                onClick={() => setAuthView('register_company')}
                className="font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
              >
                Create Company Account & Setup WABA
              </button>
            </p>
          </div>
        </div>

        {/* Security Disclaimers Footer */}
        <div className="mt-4 flex items-center justify-center space-x-4 text-[11px] text-slate-400">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>SHA-256 Multi-Tenant Enforced</span>
          </span>
          <span>&bull;</span>
          <span>Role-Based Tenant Isolation</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2 text-slate-800">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold">Reset Your Password</h3>
              </div>
              <button onClick={() => { setIsForgotModalOpen(false); setResetStatus(null); }} className="text-slate-400 hover:text-slate-700 text-lg">&times;</button>
            </div>

            <p className="text-slate-600">
              Enter your registered business email and we'll dispatch a cryptographic password recovery token.
            </p>

            <form onSubmit={handleResetSubmit} className="space-y-3">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="registered@company.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-blue-500"
                required
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setIsForgotModalOpen(false); setResetStatus(null); }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold"
                >
                  Send Recovery Link
                </button>
              </div>

              {resetStatus && (
                <div className={`p-2.5 rounded-lg border text-[11px] ${
                  resetStatus.includes('sent')
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {resetStatus}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
