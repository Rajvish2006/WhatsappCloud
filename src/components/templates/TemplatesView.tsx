
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RefreshCw } from 'lucide-react';

export const TemplatesView: React.FC = () => {
  const { templates, syncTemplatesFromMeta } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSync = async () => {
    setIsSyncing(true);
    setError('');
    setSuccess('');

    try {
      await syncTemplatesFromMeta();
      setSuccess('Template synchronization completed.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to synchronize templates.'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Templates management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Meta WhatsApp Cloud API message templates
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700
            disabled:opacity-50 text-white text-xs font-semibold
            rounded-md flex items-center gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
          />
          {isSyncing ? 'Syncing...' : 'Load templates'}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {success}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Language</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {templates.length > 0 ? (
                templates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {tpl.name}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-1 rounded text-[10px] font-bold">
                        {tpl.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 uppercase">
                      {tpl.category}
                    </td>
                    <td className="py-3.5 px-3 uppercase">
                      {tpl.language}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    {isSyncing
                      ? 'Fetching templates from Meta...'
                      : 'No templates available. Click Load templates.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
