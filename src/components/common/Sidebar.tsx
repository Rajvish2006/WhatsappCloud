import React from 'react';
import { WebcraftLogo } from './WebcraftLogo';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  MessageCircle, 
  Send, 
  Contact as ContactIcon, 
  Layers, 
  Bot, 
  Code2, 
  Smartphone, 
  CreditCard, 
  Building2, 
  Globe, 
  Settings, 
  Coins, 
  Database, 
  ShieldCheck, 
  Power, 
  ChevronDown, 
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

export type AppNavTab = 
  | 'dashboard'
  | 'agents'
  | 'chat'
  | 'campaigns'
  | 'campaign-create'
  | 'contacts'
  | 'contacts-fields'
  | 'contacts-groups'
  | 'contacts-import'
  | 'templates'
  | 'bots'
  | 'api-info'
  | 'api-campaigns'
  | 'apps'
  | 'whatsapp-setup'
  | 'plan'
  | 'admin-companies'
  | 'admin-pricing'
  | 'admin-settings'
  | 'credits-ledger'
  | 'database-schema'
  | 'auth-permissions';

interface SidebarProps {
  currentTab: AppNavTab;
  onSelectTab: (tab: AppNavTab) => void;
  onBackToAccount: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onBackToAccount }) => {
  const { currentUser } = useApp();
  const isAdmin = currentUser.role === 'super_admin';

  const isContactsSubActive = currentTab.startsWith('contacts');
  const isApiSubActive = currentTab.startsWith('api-');

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-3.5rem)] select-none">
      {/* Brand Logo Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <WebcraftLogo size="md" />
      </div>

      {/* "Back to your account" Action Bar matching PDF Page 4 */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/50">
        <button
          onClick={onBackToAccount}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-700 hover:text-rose-600 hover:bg-rose-50/50 transition text-xs font-semibold group cursor-pointer border border-transparent hover:border-rose-100"
        >
          <div className="w-5 h-5 rounded-full border border-rose-400 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition">
            <Power className="w-3 h-3" />
          </div>
          <span>Back to your account</span>
        </button>
      </div>

      {/* Main Navigation matching Page 4 of PDF */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
        {/* DASHBOARD */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition font-medium ${
            currentTab === 'dashboard'
              ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${currentTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Dashboard</span>
        </button>

        {/* TENANT ITEMS */}
        {!isAdmin && (
          <>
            <button
              onClick={() => onSelectTab('agents')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition font-medium ${
                currentTab === 'agents'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Users className={`w-4 h-4 ${currentTab === 'agents' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Agents</span>
            </button>

            <button
              onClick={() => onSelectTab('chat')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition font-medium ${
                currentTab === 'chat'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <MessageCircle className={`w-4 h-4 ${currentTab === 'chat' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Chat</span>
            </button>

            <button
              onClick={() => onSelectTab('campaigns')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition font-medium ${
                currentTab === 'campaigns' || currentTab === 'campaign-create'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Send className={`w-4 h-4 ${currentTab.startsWith('campaign') ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Campaigns</span>
            </button>

            {/* CONTACTS WITH SUBMENU */}
            <div>
              <button
                onClick={() => onSelectTab('contacts')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition font-medium ${
                  isContactsSubActive
                    ? 'bg-blue-50/70 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ContactIcon className={`w-4 h-4 ${isContactsSubActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>Contacts</span>
                </div>
                {isContactsSubActive ? <ChevronDown className="w-3.5 h-3.5 text-blue-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {/* Submenu matching Page 4 */}
              {isContactsSubActive && (
                <div className="ml-7 pl-2 border-l border-slate-200 space-y-1 mt-1">
                  <button
                    onClick={() => onSelectTab('contacts')}
                    className={`w-full text-left py-1 px-2 rounded text-[11px] ${currentTab === 'contacts' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Contact list
                  </button>
                  <button
                    onClick={() => onSelectTab('contacts-fields')}
                    className={`w-full text-left py-1 px-2 rounded text-[11px] ${currentTab === 'contacts-fields' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Fields
                  </button>
                  <button
                    onClick={() => onSelectTab('contacts-groups')}
                    className={`w-full text-left py-1 px-2 rounded text-[11px] ${currentTab === 'contacts-groups' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Groups
                  </button>
                  <button
                    onClick={() => onSelectTab('contacts-import')}
                    className={`w-full text-left py-1 px-2 rounded text-[11px] ${currentTab === 'contacts-import' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Import
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectTab('templates')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition font-medium ${
                currentTab === 'templates'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Layers className={`w-4 h-4 ${currentTab === 'templates' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Templates</span>
            </button>

            <button
              onClick={() => onSelectTab('bots')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition font-medium ${
                currentTab === 'bots'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Bot className={`w-4 h-4 ${currentTab === 'bots' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Bots</span>
            </button>

            {/* API WITH SUBMENU */}
            <div>
              <button
                onClick={() => onSelectTab('api-info')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition font-medium ${
                  isApiSubActive
                    ? 'bg-blue-50/70 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Code2 className={`w-4 h-4 ${isApiSubActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>API</span>
                </div>
                {isApiSubActive ? <ChevronDown className="w-3.5 h-3.5 text-blue-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {isApiSubActive && (
                <div className="ml-7 pl-2 border-l border-slate-200 space-y-1 mt-1">
                  <button
                    onClick={() => onSelectTab('api-info')}
                    className={`w-full text-left py-1 px-2 rounded text-[11px] ${currentTab === 'api-info' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    API info
                  </button>
                  <button
                    onClick={() => onSelectTab('api-campaigns')}
                    className={`w-full text-left py-1 px-2 rounded text-[11px] ${currentTab === 'api-campaigns' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    API campaigns
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectTab('whatsapp-setup')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition font-medium ${
                currentTab === 'whatsapp-setup'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Smartphone className={`w-4 h-4 ${currentTab === 'whatsapp-setup' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>WhatsApp Cloud API</span>
            </button>

            <button
              onClick={() => onSelectTab('apps')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition font-medium ${
                currentTab === 'apps'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Settings className={`w-4 h-4 ${currentTab === 'apps' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Apps & Settings</span>
            </button>

            <button
              onClick={() => onSelectTab('plan')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition font-medium ${
                currentTab === 'plan'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <CreditCard className={`w-4 h-4 ${currentTab === 'plan' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Plan</span>
            </button>
          </>
        )}

        {/* SUPER ADMIN ITEMS matching Page 1 & Page 10 */}
        {isAdmin && (
          <>
            <button
              onClick={() => onSelectTab('admin-companies')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition font-medium ${
                currentTab === 'admin-companies'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Building2 className={`w-4 h-4 ${currentTab === 'admin-companies' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Companies</span>
            </button>

            <button
              onClick={() => onSelectTab('admin-pricing')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition font-medium ${
                currentTab === 'admin-pricing'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <CreditCard className={`w-4 h-4 ${currentTab === 'admin-pricing' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Pricing plans</span>
            </button>

            <button
              onClick={() => onSelectTab('admin-settings')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition font-medium ${
                currentTab === 'admin-settings'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Settings className={`w-4 h-4 ${currentTab === 'admin-settings' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Site Settings</span>
            </button>
          </>
        )}

        {/* P0 PLATFORM HUBS ALWAYS ACCESSIBLE */}
        <div className="pt-3 mt-2 border-t border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            P0 Engine Modules
          </div>

          <button
            onClick={() => onSelectTab('credits-ledger')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition font-medium ${
              currentTab === 'credits-ledger'
                ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Coins className={`w-4 h-4 ${currentTab === 'credits-ledger' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Credits & Ledger (P0)</span>
          </button>

          <button
            onClick={() => onSelectTab('database-schema')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition font-medium ${
              currentTab === 'database-schema'
                ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Database className={`w-4 h-4 ${currentTab === 'database-schema' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Database Schema (P0)</span>
          </button>

          <button
            onClick={() => onSelectTab('auth-permissions')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition font-medium ${
              currentTab === 'auth-permissions'
                ? 'bg-amber-50 text-amber-700 font-semibold border border-amber-200 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${currentTab === 'auth-permissions' ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>Auth & Permissions (P0)</span>
          </button>
        </div>
      </div>

      {/* Footer matching Page 1 & Page 10 */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[10px] text-slate-400 flex items-center justify-between">
        <span className="font-mono font-medium">VERSION 2.1.0</span>
        <span className="text-emerald-600 font-semibold flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Online</span>
        </span>
      </div>
    </aside>
  );
};
