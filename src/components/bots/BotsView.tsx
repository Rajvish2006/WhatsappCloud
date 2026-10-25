import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bot, Plus, Trash2, Edit, CheckCircle2 } from 'lucide-react';

export const BotsView: React.FC = () => {
  const { botRules, saveBotRule, toggleBotRule } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [triggerText, setTriggerText] = useState('');
  const [responseText, setResponseText] = useState('');

  const handleCreateBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerText.trim() || !responseText.trim()) return;

    saveBotRule({
      name: ruleName.trim() || 'Custom Reply Bot',
      keywords: triggerText.split(',').map(s => s.trim()),
      trigger_text: triggerText.trim(),
      response_text: responseText.trim(),
      replyText: responseText.trim(),
      actionType: 'SEND_TEXT',
      priority: 10
    });

    setIsModalOpen(false);
    setRuleName('');
    setTriggerText('');
    setResponseText('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header matching Page 6 Middle of PDF */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Bots management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Automated WhatsApp keyword responses and template triggers</p>
        </div>

        {/* Action Buttons matching Page 6 Middle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition"
          >
            Create template based bot
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition"
          >
            Create message bot
          </button>
        </div>
      </div>

      {/* Bots List or Empty State matching PDF */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {botRules.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            There are no replies...
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {botRules.map((rule) => (
              <div key={rule.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 text-sm">{rule.name}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase border border-blue-200">
                      Priority #{rule.priority}
                    </span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    Triggers on: [{rule.keywords.join(', ')}]
                  </div>
                  <p className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 max-w-xl">
                    {rule.replyText || rule.response_text}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleBotRule(rule.id)}
                    className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition ${
                      rule.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {rule.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE BOT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-800">Create reply bot</h2>
            <form onSubmit={handleCreateBot} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bot Name</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Price Inquiry Bot"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Trigger Keywords (Comma separated)</label>
                <input
                  type="text"
                  value={triggerText}
                  onChange={(e) => setTriggerText(e.target.value)}
                  placeholder="price, quote, cost, details"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Auto-Response Message</label>
                <textarea
                  rows={3}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Hello! Our prices start at..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md"
                >
                  Save bot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
