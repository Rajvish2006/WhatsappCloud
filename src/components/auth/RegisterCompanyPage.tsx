import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WebcraftLogo } from '../common/WebcraftLogo';
import { 
  Building2, 
  ShieldCheck, 
  Radio, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  Zap, 
  Coins, 
  Lock, 
  Smartphone, 
  Webhook, 
  Sliders, 
  Ban,
  Check,
  Copy
} from 'lucide-react';

export const RegisterCompanyPage: React.FC = () => {
  const { registerCompany, plans, setAuthView, companies } = useApp();

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('+91');
  const [address, setAddress] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || 'plan_basic');

  // Security & Anti-Spam Controls
  const [rateLimitRpm, setRateLimitRpm] = useState(120);
  const [antiSpamEnabled, setAntiSpamEnabled] = useState(true);
  const [optOutKeywordsEnabled, setOptOutKeywordsEnabled] = useState(true);
  const [blacklistedPhoneNumbers, setBlacklistedPhoneNumbers] = useState('+919999999999');

  // WABA Activation & Webhook Settlement Choice
  const [wabaMode, setWabaMode] = useState<'SANDBOX' | 'PRODUCTION'>('SANDBOX');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Computed tenant slug & webhook preview
  const previewSlug = companyName
    ? companyName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20)
    : 'yourcompany';
  const previewUid = `WC-${String(companies.length + 1).padStart(6, '0')}`;
  const previewWebhookUrl = `https://whatsappcloud-virid.vercel.app/api/webhook/${previewUid}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!companyName.trim()) {
      setErrorMessage('Company Name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Business Email is required.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = registerCompany({
        companyName: companyName.trim(),
        ownerName: ownerName.trim() || companyName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        planId: selectedPlanId,
        rateLimitRpm: Number(rateLimitRpm),
        antiSpamEnabled,
        optOutKeywordsEnabled,
        blacklistedPhones: blacklistedPhoneNumbers.split(',').map(s => s.trim()).filter(Boolean),
        wabaMode
      });

      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to complete registration.');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header & Logo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center space-x-3">
            <WebcraftLogo size="md" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Company Account Registration
              </h1>
              <p className="text-xs text-slate-500">
                Provision isolated multi-tenant organization, anti-spam policies & settle WABA webhook configuration.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAuthView('login')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs transition"
          >
            &larr; Back to Sign In
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Company Profile */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold text-slate-800">
                Company & Account Owner Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Company Legal Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Retail Logistics Ltd"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Owner Full Name
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Business Email (Login Identifier) *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@apexretail.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile / WhatsApp Number (E.164)
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Registered Business Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Suite 402, Cyber City, Gurugram, India"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Plan Selection */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-slate-800">
                Select Subscription Plan & Quota
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {plans.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    selectedPlanId === plan.id
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <strong className="text-sm font-bold text-slate-800">{plan.name}</strong>
                      <input
                        type="radio"
                        checked={selectedPlanId === plan.id}
                        onChange={() => setSelectedPlanId(plan.id)}
                        className="w-4 h-4 text-blue-600 accent-blue-600"
                      />
                    </div>
                    <div className="text-lg font-extrabold text-blue-700 mt-1">
                      ₹{plan.monthlyPrice.toLocaleString()}<span className="text-xs text-slate-500 font-normal">/mo</span>
                    </div>

                    <div className="mt-3 space-y-1 text-[11px] text-slate-600">
                      <div>Marketing: <strong>{plan.marketingCreditsQuota.toLocaleString()}</strong></div>
                      <div>Utility: <strong>{plan.utilityCreditsQuota.toLocaleString()}</strong></div>
                      <div>Seats: <strong>{plan.agentSeatLimit} agents</strong></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3: Security, Anti-Spam & Rate Limits (P0) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                3
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Security, Anti-Spam & Rate Limiting Controls
                </h2>
                <span className="text-[11px] text-slate-500">
                  Enforces platform compliance, protects Meta WABA quality rating, and blocks abusive high-volume spam.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tenant API Rate Limit (RPM)
                </label>
                <select
                  value={rateLimitRpm}
                  onChange={(e) => setRateLimitRpm(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none font-mono"
                >
                  <option value={60}>60 requests / minute (Safe starter threshold)</option>
                  <option value={120}>120 requests / minute (Standard business)</option>
                  <option value={240}>240 requests / minute (High-volume enterprise)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Excess API calls are throttled with HTTP 429 and automatic exponential backoff.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Blacklisted Phone Numbers (CSV format)
                </label>
                <input
                  type="text"
                  value={blacklistedPhoneNumbers}
                  onChange={(e) => setBlacklistedPhoneNumbers(e.target.value)}
                  placeholder="+919999999999, +919800000000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 font-mono focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Numbers prohibited from receiving outbound bulk campaigns or automated replies.
                </p>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={antiSpamEnabled}
                    onChange={(e) => setAntiSpamEnabled(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <strong className="block text-slate-800">Duplicate Frequency Protection</strong>
                    <span className="text-slate-500 text-[11px]">
                      Prevents repeated identical message blasts to the same contact within 60 seconds.
                    </span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optOutKeywordsEnabled}
                    onChange={(e) => setOptOutKeywordsEnabled(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <strong className="block text-slate-800">Auto Opt-Out Keyword Handler (STOP / UNSUBSCRIBE)</strong>
                    <span className="text-slate-500 text-[11px]">
                      Automatically marks contact as OPTED_OUT when customer replies STOP, canceling future campaigns.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* STEP 4: WABA Activation & Webhook Settlement */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                4
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  WhatsApp Cloud API & Webhook Settlement
                </h2>
                <span className="text-[11px] text-slate-500">
                  Automatically provisions your tenant webhook URL and sets up WABA settlement status.
                </span>
              </div>
            </div>

            {/* Settlement Provisioning Preview */}
            <div className="p-4 bg-slate-900 rounded-xl text-white space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>PRE-SETTLED TENANT ENDPOINT:</span>
                <span className="text-emerald-400 font-bold">READY TO ROUTE</span>
              </div>
              <div className="bg-black/50 p-2.5 rounded border border-slate-800 text-emerald-300 break-all select-all">
                {previewWebhookUrl}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Unique Company ID: <strong>{previewUid}</strong></span>
                <span>HMAC Signature: <strong>SHA-256 Enforced</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                onClick={() => setWabaMode('SANDBOX')}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${
                  wabaMode === 'SANDBOX'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="wabaMode"
                  checked={wabaMode === 'SANDBOX'}
                  onChange={() => setWabaMode('SANDBOX')}
                  className="mt-0.5"
                />
                <div>
                  <strong className="block text-slate-800">Activate Immediate Test Sandbox</strong>
                  <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                    Start instantly with 500 pre-allocated test credits. You can attach your official Meta Business Phone ID anytime later in settings.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setWabaMode('PRODUCTION')}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${
                  wabaMode === 'PRODUCTION'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="wabaMode"
                  checked={wabaMode === 'PRODUCTION'}
                  onChange={() => setWabaMode('PRODUCTION')}
                  className="mt-0.5"
                />
                <div>
                  <strong className="block text-slate-800">Production Meta WABA Settlement</strong>
                  <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                    For businesses with an active Meta Business Manager App. You will be directed to input your permanent access token upon account creation.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Registration Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center space-x-2 transition ${
                isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 cursor-pointer shadow-blue-500/20'
              }`}
            >
              <span>{isSubmitting ? 'Provisioning Company Account & Settle WABA...' : 'Complete Company Registration & Enter Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
