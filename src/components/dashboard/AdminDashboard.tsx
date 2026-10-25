import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Heart, 
  BarChart2, 
  Building2, 
  ExternalLink, 
  UserCheck, 
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { AppNavTab } from '../common/Sidebar';

interface AdminDashboardProps {
  onNavigate: (tab: AppNavTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    companies,
    adminStats,
    startImpersonation
  } = useApp();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Heading matching Page 1 Top of PDF */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center space-x-2">
            <span>Welcome back, Admin</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Super Administrator Control Center &bull; Multi-Tenant WhatsApp SaaS
          </p>
        </div>
      </div>

      {/* 4 Metric Cards matching Page 1 Top of PDF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* USERS: 89 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              USERS
            </div>
            <div className="text-3xl font-extrabold text-slate-800 mt-1">
              {adminStats.users}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {adminStats.usersNewThisMonth} this month
            </div>
          </div>
          <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* PAYING CLIENTS: 62 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              PAYING CLIENTS
            </div>
            <div className="text-3xl font-extrabold text-slate-800 mt-1">
              {adminStats.payingClients}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              {adminStats.payingClientsNewThisMonth} this month
            </div>
          </div>
          <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Heart className="w-5 h-5" />
          </div>
        </div>

        {/* MRR: ₹503,679.00 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              MRR
            </div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">
              ₹{adminStats.mrr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-blue-600 font-medium mt-0.5">
              Monthly Recurring
            </div>
          </div>
          <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>

        {/* ARR: ₹6,044,148.00 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ARR
            </div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">
              ₹{adminStats.arr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-blue-600 font-medium mt-0.5">
              Annual Run Rate
            </div>
          </div>
          <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Latest Companies Table matching Page 1 Top of PDF */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Latest companies</h2>
          <button
            onClick={() => onNavigate('admin-companies')}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition"
          >
            See all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">COMPANY</th>
                <th className="py-3 px-3">CREATION DATE</th>
                <th className="py-3 px-3">USER</th>
                <th className="py-3 px-3">EMAIL</th>
                <th className="py-3 px-3">PLAN</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {comp.name}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">
                    {comp.createdAt}
                  </td>
                  <td className="py-3.5 px-3 text-slate-700">
                    {comp.ownerName}
                  </td>
                  <td className="py-3.5 px-3 text-blue-600">
                    {comp.ownerEmail}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                      {comp.planName || 'Refund Sys'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => startImpersonation(comp.id, 'Administrative Diagnostic Session')}
                      className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200 inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Login as Company</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
