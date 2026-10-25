import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar, AppNavTab } from './components/common/Sidebar';

// Dashboard Views
import { TenantDashboard } from './components/dashboard/TenantDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';

// Core Tenant Views matching PDF
import { AgentManagement } from './components/agents/AgentManagement';
import { ChatInboxView } from './components/chat/ChatInboxView';
import { CampaignView } from './components/campaigns/CampaignView';
import { ContactsView } from './components/contacts/ContactsView';
import { TemplatesView } from './components/templates/TemplatesView';
import { BotsView } from './components/bots/BotsView';
import { ApiInfoView } from './components/api/ApiInfoView';
import { CloudApiSetupView } from './components/whatsapp/CloudApiSetupView';
import { CompanySettingsView } from './components/settings/CompanySettingsView';
import PrivacyPolicy from './components/policy-terms/privacy_policy';


// Super Admin Views matching Page 1 & Page 10
import { AdminPricingPlans } from './components/superadmin/AdminPricingPlans';
import { AdminSiteSettings } from './components/superadmin/AdminSiteSettings';
import { SuperAdminHub } from './components/superadmin/SuperAdminHub';

// P0 Modules
import { CreditsHub } from './components/credits/CreditsHub';
import { DatabaseSchemaViewer } from './components/schema/DatabaseSchemaViewer';
import { AuthAndPermissions } from './components/auth/AuthAndPermissions';
import { TenantApiKeys } from './components/api/TenantApiKeys';
import { WhatsAppIntegration } from './components/whatsapp/WhatsAppIntegration';
import { BackgroundQueueHub } from './components/queue/BackgroundQueueHub';

// Authentication & Registration Pages
import { LoginPage } from './components/auth/LoginPage';
import { RegisterCompanyPage } from './components/auth/RegisterCompanyPage';

const MainLayout: React.FC = () => {
  const { currentUser, switchUser, users, impersonationState, stopImpersonation } = useApp();
  const [currentTab, setCurrentTab] = useState<AppNavTab>('dashboard');

  const isAdmin = currentUser.role === 'super_admin' && !impersonationState.isImpersonating;

  // Breadcrumb mapping matching PDF
  const getBreadcrumb = (tab: AppNavTab): string => {
    switch (tab) {
      case 'dashboard':
        return isAdmin ? 'DASHBOARD > SUPER ADMIN' : 'DASHBOARD >';
      case 'agents':
        return 'AGENTS > AGENT MANAGEMENT';
      case 'chat':
        return 'CHAT > LIVE INBOX';
      case 'campaigns':
      case 'campaign-create':
        return 'CAMPAIGNS > SEND CAMPAIGN';
      case 'contacts':
        return 'CONTACTS > CONTACT LIST';
      case 'contacts-fields':
        return 'CONTACTS > CUSTOM FIELDS';
      case 'contacts-groups':
        return 'CONTACTS > GROUPS MANAGEMENT';
      case 'contacts-import':
        return 'CONTACTS > CSV IMPORT';
      case 'templates':
        return 'TEMPLATES > TEMPLATES MANAGEMENT';
      case 'bots':
        return 'BOTS > BOTS MANAGEMENT';
      case 'api-info':
        return 'API > API INFO';
      case 'api-campaigns':
        return 'API > API CAMPAIGNS';
      case 'whatsapp-setup':
        return 'WHATSAPP CLOUD API > CREDENTIALS & WEBHOOKS';
      case 'apps':
        return 'APPS > SETTINGS & ROUTING';
      case 'plan':
        return 'SUBSCRIPTIONS > PRICING PLANS';
      case 'admin-companies':
        return 'SUPER ADMIN > COMPANIES DIRECTORY';
      case 'admin-pricing':
        return 'SUPER ADMIN > PRICING PLANS';
      case 'admin-settings':
        return 'SUPER ADMIN > SITE SETTINGS';
      case 'credits-ledger':
        return 'P0 ENGINE > DUAL CREDITS & LEDGER AUDIT';
      case 'database-schema':
        return 'P0 ENGINE > COMPLETE SQL RELATIONAL SCHEMA';
      case 'auth-permissions':
        return 'P0 ENGINE > AUTHENTICATION & RBAC PERMISSION MATRIX';
      default:
        return 'DASHBOARD >';
    }
  };

  const handleBackToAccount = () => {
    if (impersonationState.isImpersonating) {
      stopImpersonation();
      setCurrentTab('dashboard');
      return;
    }

    // Toggle between Super Admin and Tenant Admin for easy evaluation
    if (isAdmin) {
      const tenantUser = users.find(u => u.name.includes('Bijendra') || u.role === 'company_admin');
      if (tenantUser) {
        switchUser(tenantUser.id);
        setCurrentTab('dashboard');
      }
    } else {
      const superAdminUser = users.find(u => u.role === 'super_admin');
      if (superAdminUser) {
        switchUser(superAdminUser.id);
        setCurrentTab('dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar matching PDF */}
      <Navbar 
        breadcrumb={getBreadcrumb(currentTab)} 
        onBackToAccount={handleBackToAccount} 
      />

      {/* Main Body with Sidebar & Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          currentTab={currentTab} 
          onSelectTab={setCurrentTab} 
          onBackToAccount={handleBackToAccount}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50 min-w-0">
          {/* DASHBOARD ROUTE */}
          {currentTab === 'dashboard' && (
            isAdmin ? (
              <AdminDashboard onNavigate={setCurrentTab} />
            ) : (
              <TenantDashboard onNavigate={setCurrentTab} />
            )
          )}

          {/* TENANT MODULES MATCHING PDF */}
          {currentTab === 'agents' && <AgentManagement />}
          {currentTab === 'chat' && <ChatInboxView />}
          
          {currentTab === 'campaigns' && (
            <CampaignView initialCreateMode={false} />
          )}
          {currentTab === 'campaign-create' && (
            <CampaignView initialCreateMode={true} />
          )}

          {currentTab === 'contacts' && (
            <ContactsView initialSubTab="list" onNavigate={setCurrentTab} />
          )}
          {currentTab === 'contacts-fields' && (
            <ContactsView initialSubTab="fields" onNavigate={setCurrentTab} />
          )}
          {currentTab === 'contacts-groups' && (
            <ContactsView initialSubTab="groups" onNavigate={setCurrentTab} />
          )}
          {currentTab === 'contacts-import' && (
            <ContactsView initialSubTab="import" onNavigate={setCurrentTab} />
          )}

          {currentTab === 'templates' && <TemplatesView />}
          {currentTab === 'bots' && <BotsView />}
          
          {currentTab === 'api-info' && (
            <ApiInfoView 
              initialSubTab="info" 
              onNavigateToCampaigns={() => setCurrentTab('api-campaigns')} 
            />
          )}
          {currentTab === 'api-campaigns' && (
            <ApiInfoView 
              initialSubTab="campaigns" 
              onNavigateToCampaigns={() => setCurrentTab('api-campaigns')} 
            />
          )}

          {currentTab === 'whatsapp-setup' && <CloudApiSetupView />}
          {currentTab === 'apps' && <CompanySettingsView />}
          {currentTab === 'plan' && <AdminPricingPlans />}

          {/* SUPER ADMIN MODULES */}
          {currentTab === 'admin-companies' && (
            <SuperAdminHub />
          )}
          {currentTab === 'admin-pricing' && (
            <AdminPricingPlans />
          )}
          {currentTab === 'admin-settings' && (
            <AdminSiteSettings />
          )}

          {/* P0 PLATFORM MODULES */}
          {currentTab === 'credits-ledger' && <CreditsHub />}
          {currentTab === 'database-schema' && <DatabaseSchemaViewer />}
          {currentTab === 'auth-permissions' && <AuthAndPermissions />}
        </main>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { authView } = useApp();
  const [showPrivacy, setShowPrivacy] = useState(
    window.location.hash === '#privacy' || window.location.pathname === '/privacy'
  );

  React.useEffect(() => {
    const checkHash = () => {
      setShowPrivacy(window.location.hash === '#privacy' || window.location.pathname === '/privacy');
    };
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (showPrivacy) {
    return (
      <div className="relative">
        <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white px-4 py-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">Legal & Privacy Center</span>
          <button
            onClick={() => {
              window.location.hash = '';
              setShowPrivacy(false);
            }}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded font-medium text-white transition cursor-pointer"
          >
            ← Return to Dashboard
          </button>
        </div>
        <PrivacyPolicy />
      </div>
    );
  }

  if (authView === 'login') {
    return <LoginPage />;
  }

  if (authView === 'register_company') {
    return <RegisterCompanyPage />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export function PrivacyPage() {
  return <PrivacyPolicy />;
}

