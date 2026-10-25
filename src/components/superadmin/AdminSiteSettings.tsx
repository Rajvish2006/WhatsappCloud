import React, { useState } from 'react';
import { 
  Settings, 
  DollarSign, 
  Globe, 
  Grid, 
  Mail, 
  Image as ImageIcon, 
  Code, 
  Save, 
  CheckCircle2 
} from 'lucide-react';

export const AdminSiteSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'setup' | 'finances' | 'localization' | 'apps' | 'smtp' | 'images' | 'css-js'>('setup');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form Fields
  const [appName, setAppName] = useState('Webcraft Solution');
  const [appTagline, setAppTagline] = useState('WhatsApp Cloud API Platform');
  const [appUrl, setAppUrl] = useState('https://whatsappcloud-virid.vercel.app');
  const [supportEmail, setSupportEmail] = useState('vraj21712@gmail.com');

  // Finances
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [razorpayKey, setRazorpayKey] = useState('rzp_live_webcraft992');
  const [stripeSecret, setStripeSecret] = useState('sk_live_...encrypted');

  // Localization
  const [defaultLanguage, setDefaultLanguage] = useState('English');
  const [defaultTimezone, setDefaultTimezone] = useState('Asia/Kolkata (IST)');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  // Apps
  const [metaAppId, setMetaAppId] = useState('18920192039481');
  const [metaApiVersion, setMetaApiVersion] = useState('v21.0');

  // SMTP
  const [smtpHost, setSmtpHost] = useState('smtp.mailgun.org');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('notifications@whatsappcloud-virid.vercel.app');
  const [smtpPass, setSmtpPass] = useState('••••••••••••');

  // Images
  const [logoUrl, setLogoUrl] = useState('/assets/aistudio/Webcraft_Solution_Ribbon_Logo_577a10a3.png');
  const [faviconUrl, setFaviconUrl] = useState('/assets/aistudio/Webcraft_Solution_Ribbon_Logo_577a10a3.png');

  // CSS & JS
  const [customCss, setCustomCss] = useState('/* Custom global tenant overrides */');
  const [customJs, setCustomJs] = useState('// Analytics tags');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header matching Page 10 Bottom */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Site settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure global platform variables, branding, payment gateways, SMTP and localization.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Site settings saved!</span>
          </div>
        )}
      </div>

      {/* Settings Navigation Tabs matching Page 10 Bottom */}
      <div className="flex flex-wrap border-b border-slate-200 gap-x-6 gap-y-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('setup')}
          className={`pb-3 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === 'setup'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Setup</span>
        </button>

        <button
          onClick={() => setActiveTab('finances')}
          className={`pb-3 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === 'finances'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Finances</span>
        </button>

        <button
          onClick={() => setActiveTab('localization')}
          className={`pb-3 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === 'localization'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Localization</span>
        </button>

        <button
          onClick={() => setActiveTab('apps')}
          className={`pb-3 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === 'apps'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Apps</span>
        </button>

        <button
          onClick={() => setActiveTab('smtp')}
          className={`pb-3 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === 'smtp'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>SMTP</span>
        </button>

        <button
          onClick={() => setActiveTab('images')}
          className={`pb-3 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === 'images'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Images</span>
        </button>

        <button
          onClick={() => setActiveTab('css-js')}
          className={`pb-3 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === 'css-js'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>CSS & JS</span>
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 max-w-2xl text-xs text-slate-700">
        {activeTab === 'setup' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline / Subtitle</label>
              <input
                type="text"
                value={appTagline}
                onChange={(e) => setAppTagline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Base Application URL</label>
              <input
                type="url"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">System Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>
          </div>
        )}

        {activeTab === 'finances' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Code</label>
                <input
                  type="text"
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Razorpay Key ID</label>
              <input
                type="text"
                value={razorpayKey}
                onChange={(e) => setRazorpayKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stripe Secret Key</label>
              <input
                type="password"
                value={stripeSecret}
                onChange={(e) => setStripeSecret(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
              />
            </div>
          </div>
        )}

        {activeTab === 'localization' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Platform Language</label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">System Timezone</label>
              <select
                value={defaultTimezone}
                onChange={(e) => setDefaultTimezone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
              >
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'apps' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Meta App ID (Parent Cloud API)</label>
              <input
                type="text"
                value={metaAppId}
                onChange={(e) => setMetaAppId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Graph API Version</label>
              <input
                type="text"
                value={metaApiVersion}
                onChange={(e) => setMetaApiVersion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
              />
            </div>
          </div>
        )}

        {activeTab === 'smtp' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Port</label>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP User</label>
              <input
                type="text"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Password</label>
              <input
                type="password"
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
              />
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Logo URL</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Favicon URL</label>
              <input
                type="text"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono"
              />
            </div>
          </div>
        )}

        {activeTab === 'css-js' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Custom CSS</label>
              <textarea
                rows={4}
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Custom JavaScript</label>
              <textarea
                rows={4}
                value={customJs}
                onChange={(e) => setCustomJs(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800"
              />
            </div>
          </div>
        )}

        {/* Save button in blue matching PDF */}
        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </form>
    </div>
  );
};
