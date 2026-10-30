import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RefreshCw, Plus, CheckCircle2, AlertCircle, Clock, XCircle, FileText, X } from 'lucide-react';
import { createServerTemplate } from '../../lib/metaApiClient';

export const TemplatesView: React.FC = () => {
  const { templates, syncTemplatesFromMeta } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Template creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'MARKETING' | 'UTILITY' | 'AUTHENTICATION'>('MARKETING');
  const [newLanguage, setNewLanguage] = useState('en_US');
  const [newBodyText, setNewBodyText] = useState('Hello {{1}}, welcome to our platform! Your account is active.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');

  const handleSync = async () => {
    setIsSyncing(true);
    setError('');
    setSuccess('');

    try {
      const res = await syncTemplatesFromMeta();
      if (res && res.success) {
        if (res.count > 0) {
          setSuccess(`Successfully synchronized ${res.count} message template(s) from Meta Cloud API.`);
        } else {
          setSuccess(`Synchronization checked. 0 remote message templates returned by Meta for this WABA.`);
        }
      } else if (res && res.error) {
        setError(res.error);
      } else {
        setSuccess(`Message templates synchronized.`);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to synchronize templates.');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredTemplates = templates.filter(tpl => {
    if (categoryFilter !== 'ALL' && tpl.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && (tpl.status || 'PENDING').toUpperCase() !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = tpl.name.toLowerCase().includes(q);
      const matchBody = (tpl.bodyText || '').toLowerCase().includes(q);
      const matchId = (tpl.metaTemplateId || tpl.id).toLowerCase().includes(q);
      return matchName || matchBody || matchId;
    }
    return true;
  });

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    const cleanName = newName.trim().toLowerCase();
    if (!/^[a-z0-9_]+$/.test(cleanName)) {
      setCreateError('Template name can only contain lowercase alphanumeric characters and underscores (e.g. seasonal_promo_01).');
      return;
    }

    if (!newBodyText.trim()) {
      setCreateError('Body text is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createServerTemplate({
        name: cleanName,
        category: newCategory,
        language: newLanguage,
        components: [
          {
            type: 'BODY',
            text: newBodyText.trim(),
          },
        ],
      });

      setSuccess(`Template "${cleanName}" submitted to Meta for approval!`);
      setIsCreateModalOpen(false);
      setNewName('');
      setNewBodyText('Hello {{1}}, welcome to our platform! Your account is active.');
      // Refresh templates
      await handleSync();
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create template in Meta Cloud API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Templates Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Meta WhatsApp Cloud API message templates synchronized with your WABA
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Template</span>
          </button>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync from Meta'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <strong className="font-semibold">Meta API Synchronization Notice: </strong>
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <div className="flex-1">{success}</div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by name, ID or body..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
          />
          <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
            {(['ALL', 'MARKETING', 'UTILITY', 'AUTHENTICATION'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-md transition ${
                  categoryFilter === cat ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'All' : cat}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
            {(['ALL', 'APPROVED', 'PENDING', 'REJECTED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 rounded-md transition ${
                  statusFilter === st ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'ALL' ? 'Any Status' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase text-[10px] font-bold tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Template Name & Identifier</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Language</th>
                <th className="py-3 px-4">Body Preview</th>
                <th className="py-3 px-3 text-right">Last Synced</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((tpl) => {
                  const statusNormalized = (tpl.status || 'PENDING').toUpperCase();
                  const isMetaSynced = Boolean(tpl.metaTemplateId || tpl.id.startsWith('meta_'));

                  return (
                    <tr key={tpl.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800 font-mono text-[11px]">{tpl.name}</span>
                          {isMetaSynced ? (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Meta Synced
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              Default Seed
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {tpl.metaTemplateId || tpl.id}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            statusNormalized === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : statusNormalized === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {statusNormalized === 'APPROVED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {statusNormalized === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                          {statusNormalized !== 'APPROVED' && statusNormalized !== 'REJECTED' && <Clock className="w-3 h-3 mr-1" />}
                          {statusNormalized}
                        </span>
                        {tpl.rejectionReason && (
                          <div className="text-[10px] text-rose-600 mt-1 max-w-xs">{tpl.rejectionReason}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 uppercase font-medium">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                          {tpl.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 uppercase font-mono text-[11px]">{tpl.language}</td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-[11px] text-slate-700 line-clamp-2 bg-slate-50 p-1.5 rounded border border-slate-100 font-mono">
                          {tpl.bodyText || 'No body text configured.'}
                        </div>
                        {tpl.variablesCount > 0 && (
                          <div className="text-[10px] text-blue-600 font-mono mt-1">
                            {tpl.variablesCount} dynamic variable{tpl.variablesCount > 1 ? 's' : ''} &#123;&#123;1&#125;&#125;
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-400 text-[10px] font-mono">
                        {tpl.lastSyncedAt ? new Date(tpl.lastSyncedAt).toLocaleTimeString() : 'Never'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No message templates match your filter</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Click &quot;Sync from Meta&quot; to fetch approved message templates directly from Meta Graph API, or create a new template.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Template in Meta Cloud API */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Create Meta WhatsApp Template</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="p-5 space-y-4 text-xs">
              {createError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Template Name (Meta Graph API requirement)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. order_dispatch_update"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Lowercase letters, numbers, and underscores only.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none"
                  >
                    <option value="MARKETING">MARKETING</option>
                    <option value="UTILITY">UTILITY</option>
                    <option value="AUTHENTICATION">AUTHENTICATION</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Language</label>
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none"
                  >
                    <option value="en_US">English (en_US)</option>
                    <option value="en_GB">English (en_GB)</option>
                    <option value="es_ES">Spanish (es_ES)</option>
                    <option value="pt_BR">Portuguese (pt_BR)</option>
                    <option value="hi_IN">Hindi (hi_IN)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Message Body Text
                </label>
                <textarea
                  rows={4}
                  value={newBodyText}
                  onChange={(e) => setNewBodyText(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  placeholder="Hello {{1}}, your order {{2}} has been confirmed."
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Use sequential numbered placeholders like &#123;&#123;1&#125;&#125;, &#123;&#123;2&#125;&#125; for dynamic variables.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold transition"
                >
                  {isSubmitting ? 'Submitting to Meta...' : 'Submit to Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
