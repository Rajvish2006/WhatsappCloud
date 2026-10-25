import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubscriptionPlan } from '../../types';
import { 
  CreditCard, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Coins, 
  Users, 
  Check, 
  Layers 
} from 'lucide-react';

export const AdminPricingPlans: React.FC = () => {
  const { plans, savePlan } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState(999);
  const [marketingQuota, setMarketingQuota] = useState(5000);
  const [utilityQuota, setUtilityQuota] = useState(2500);
  const [agentLimit, setAgentLimit] = useState(5);
  const [rateLimitRpm, setRateLimitRpm] = useState(120);
  const [overLimitAction, setOverLimitAction] = useState<'BLOCK' | 'ALERT_ONLY' | 'GRACE_OVERAGE'>('BLOCK');
  const [featuresList, setFeaturesList] = useState('Real-time chat, Multi-agent routing, Meta Cloud API v21');

  const openAdd = () => {
    setEditingPlan(null);
    setName('');
    setMonthlyPrice(999);
    setMarketingQuota(5000);
    setUtilityQuota(2500);
    setAgentLimit(5);
    setRateLimitRpm(120);
    setOverLimitAction('BLOCK');
    setFeaturesList('Real-time chat, Multi-agent routing, Meta Cloud API v21');
    setIsAddModalOpen(true);
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setMonthlyPrice(plan.monthlyPrice);
    setMarketingQuota(plan.marketingCreditsQuota);
    setUtilityQuota(plan.utilityCreditsQuota);
    setAgentLimit(plan.agentSeatLimit);
    setRateLimitRpm(plan.rateLimitRpm);
    setOverLimitAction(plan.overLimitAction);
    setFeaturesList(Array.isArray(plan.features) ? plan.features.join(', ') : '');
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const planToSave: SubscriptionPlan = {
      id: editingPlan ? editingPlan.id : `plan_${Date.now()}`,
      name: name.trim(),
      monthlyPrice: Number(monthlyPrice),
      marketingCreditsQuota: Number(marketingQuota),
      utilityCreditsQuota: Number(utilityQuota),
      agentSeatLimit: Number(agentLimit),
      rateLimitRpm: Number(rateLimitRpm),
      overLimitAction,
      features: featuresList.split(',').map(f => f.trim()).filter(Boolean)
    };

    savePlan(planToSave);
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header matching Page 10 Top */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pricing plans</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure subscription tiers, marketing/utility credit allowances, agent seat limits & pricing.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add plan</span>
        </button>
      </div>

      {/* Pricing Plans Table matching Page 10 Top */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">NAME</th>
                <th className="py-3 px-4">PRICE</th>
                <th className="py-3 px-4">MARKETING CREDITS</th>
                <th className="py-3 px-4">UTILITY CREDITS</th>
                <th className="py-3 px-4">AGENTS</th>
                <th className="py-3 px-4">RPM LIMIT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-5 font-semibold text-slate-900">
                    <div>{p.name}</div>
                    <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                      {Array.isArray(p.features) ? p.features.slice(0, 2).join(' • ') : ''}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    ₹{p.monthlyPrice.toLocaleString()}
                    <span className="text-[10px] text-slate-400 font-normal"> / mo</span>
                  </td>

                  <td className="py-3 px-4 font-mono text-indigo-600 font-medium">
                    {p.marketingCreditsQuota.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 font-mono text-emerald-600 font-medium">
                    {p.utilityCreditsQuota.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-700">
                    {p.agentSeatLimit} seats
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-500">
                    {p.rateLimitRpm} RPM
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>

                  <td className="py-3 px-5 text-right space-x-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition inline-flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3 text-blue-600" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Plan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">
                {editingPlan ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Plan Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Starter Plan 100"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Monthly Price (₹)</label>
                  <input
                    type="number"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Agent Seats</label>
                  <input
                    type="number"
                    value={agentLimit}
                    onChange={(e) => setAgentLimit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Marketing Credits Quota</label>
                  <input
                    type="number"
                    value={marketingQuota}
                    onChange={(e) => setMarketingQuota(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Utility Credits Quota</label>
                  <input
                    type="number"
                    value={utilityQuota}
                    onChange={(e) => setUtilityQuota(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">API Rate Limit (RPM)</label>
                  <input
                    type="number"
                    value={rateLimitRpm}
                    onChange={(e) => setRateLimitRpm(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Over-Limit Policy</label>
                  <select
                    value={overLimitAction}
                    onChange={(e) => setOverLimitAction(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="BLOCK">Block sends on 0 credits</option>
                    <option value="ALERT_ONLY">Alert only (warning banner)</option>
                    <option value="GRACE_OVERAGE">Allow grace overage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Features (comma separated)</label>
                <input
                  type="text"
                  value={featuresList}
                  onChange={(e) => setFeaturesList(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
