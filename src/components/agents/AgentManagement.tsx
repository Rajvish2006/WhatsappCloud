import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Plus, Trash2, Mail, Lock, Phone, UserCheck } from 'lucide-react';

export const AgentManagement: React.FC = () => {
  const { users, currentCompany, createAgent, deleteAgent } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const companyAgents = users.filter(u => u.role === 'agent' && u.companyId === currentCompany.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !emailInput.trim()) return;

    createAgent(nameInput.trim(), emailInput.trim(), passwordInput.trim());
    setIsAddModalOpen(false);
    setNameInput('');
    setEmailInput('');
    setPasswordInput('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header matching Page 1 Bottom of PDF */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Agent management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage live chat agents, assignment workloads & credentials</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add new agent</span>
        </button>
      </div>

      {/* Agents Table or Empty State matching PDF */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {companyAgents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            There are no agent...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">NAME</th>
                  <th className="py-3 px-3">EMAIL</th>
                  <th className="py-3 px-3">ROLE</th>
                  <th className="py-3 px-3">STATUS</th>
                  <th className="py-3 px-3">CONCURRENT CAPACITY</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companyAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-800 flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {agent.name.substring(0, 1)}
                      </div>
                      <span>{agent.name}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">{agent.email}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200 uppercase">
                        {agent.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-200">
                        {agent.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {agent.activeChatCount || 0} / {agent.maxChatCapacity || 5} active chats
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => deleteAgent(agent.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                        title="Delete agent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NEW AGENT MODAL matching Page 2 Top of PDF */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800">New agent</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
              >
                Back
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="First and last name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Entry email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Entry password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-xs transition"
                >
                  Insert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
