import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contact, ConsentStatus, ContactGroup } from '../../types';
import { 
  Users, 
  Upload, 
  Plus, 
  Download, 
  Search, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  Layers, 
  SlidersHorizontal 
} from 'lucide-react';

export const ContactsHub: React.FC = () => {
  const {
    contacts,
    groups,
    importContacts,
    toggleContactConsent,
    createContactGroup,
    deleteContact,
    currentCompany
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('ALL');
  const [selectedConsentFilter, setSelectedConsentFilter] = useState<'ALL' | ConsentStatus>('ALL');

  // Import Modal State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [csvText, setCsvText] = useState(`phone,name,email,tags,city,consentStatus
+14155551101,Alexander Gray,alex.gray@example.com,vip,San Francisco,OPTED_IN
+12125552202,Jessica Morgan,jess.m@designstudio.io,retail,New York,OPTED_IN
12345,Invalid Number Guy,invalid@test.com,lead,Unknown,OPTED_IN
+14155552671,Duplicate Sophia,sophia@example.com,vip,San Francisco,OPTED_IN
+15125553311,Opt Out Customer,optout@austin.com,retail,Austin,OPTED_OUT`);
  const [importResult, setImportResult] = useState<{ importedCount: number; errors: Array<{ row: number; phone: string; error: string }> } | null>(null);

  // Group Creation State
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [isDynamic, setIsDynamic] = useState(false);

  // Filtered Contacts
  const filteredContacts = contacts.filter(c => {
    if (selectedConsentFilter !== 'ALL' && c.consentStatus !== selectedConsentFilter) return false;
    if (selectedTagFilter !== 'ALL' && !c.tags.includes(selectedTagFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleParseAndImport = () => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rawRows = lines.slice(1).map(line => {
      const parts = line.split(',').map(p => p.trim());
      const rowObj: any = {};
      headers.forEach((h, i) => {
        rowObj[h] = parts[i] || '';
      });
      return rowObj;
    });

    const res = importContacts(rawRows);
    setImportResult(res);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    createContactGroup(newGroupName.trim(), newGroupDesc.trim(), isDynamic);
    setIsGroupOpen(false);
    setNewGroupName('');
    setNewGroupDesc('');
  };

  const exportContactsCSV = () => {
    const headers = ['Phone', 'Name', 'Email', 'Consent Status', 'Consent Source', 'Tags', 'City', 'Created At'];
    const rows = filteredContacts.map(c => [
      c.phone,
      c.name,
      c.email || '',
      c.consentStatus,
      c.consentSource,
      `"${c.tags.join(';')}"`,
      c.customAttributes.city || '',
      c.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contacts_export_${currentCompany.code}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Audience CRM
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Contacts, Consent Tracking & Dynamic Segments
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            CSV validation error reports, GDPR/Meta opt-in consent compliance, and group segmentations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportContactsCSV}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => { setIsImportOpen(true); setImportResult(null); }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/50 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV with Validation</span>
          </button>
        </div>
      </div>

      {/* Group & Dynamic Segments Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Contact Groups & Dynamic Segments ({groups.length})</span>
          </h2>
          <button
            onClick={() => setIsGroupOpen(true)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Segment</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {groups.map(grp => (
            <div key={grp.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs text-white">{grp.name}</span>
                  {grp.isDynamic && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-semibold">
                      Dynamic
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{grp.description}</p>
                <div className="text-[10px] text-slate-500 mt-2 font-mono">
                  {contacts.filter(c => c.groups.includes(grp.id)).length} Active Contacts
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contacts Table with Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Contact Registry ({filteredContacts.length} Contacts)</span>
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, email..."
                className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none w-52"
              />
            </div>

            <select
              value={selectedConsentFilter}
              onChange={(e) => setSelectedConsentFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="ALL">All Consent States</option>
              <option value="OPTED_IN">OPTED_IN (Compliant)</option>
              <option value="OPTED_OUT">OPTED_OUT (Blocked)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Contact & Phone</th>
                <th className="py-3 px-3">Consent Status</th>
                <th className="py-3 px-3">Opt-in Source</th>
                <th className="py-3 px-3">Tags</th>
                <th className="py-3 px-3">Attributes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredContacts.map(contact => (
                <tr key={contact.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{contact.name}</div>
                    <div className="font-mono text-emerald-300 text-[11px]">{contact.phone}</div>
                    {contact.email && <div className="text-[10px] text-slate-400">{contact.email}</div>}
                  </td>

                  <td className="py-3 px-3">
                    <button
                      onClick={() => toggleContactConsent(
                        contact.id,
                        contact.consentStatus === 'OPTED_IN' ? 'OPTED_OUT' : 'OPTED_IN'
                      )}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border cursor-pointer transition ${
                        contact.consentStatus === 'OPTED_IN'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                      }`}
                      title="Click to toggle consent status"
                    >
                      {contact.consentStatus}
                    </button>
                  </td>

                  <td className="py-3 px-3 text-[11px] text-slate-400">
                    <div>{contact.consentSource}</div>
                    <div className="text-[9px] text-slate-500">{new Date(contact.consentTimestamp).toLocaleDateString()}</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map(t => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-indigo-300 border border-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-[11px] font-mono text-slate-400">
                    {Object.entries(contact.customAttributes).map(([k, v]) => (
                      <div key={k}>{k}: {v}</div>
                    ))}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => deleteContact(contact.id)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                      title="Delete Contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV IMPORT WITH VALIDATION MODAL */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Bulk CSV Import & Validation Engine</span>
              </h3>
              <button onClick={() => setIsImportOpen(false)} className="text-slate-400 hover:text-white text-lg">&times;</button>
            </div>

            <p className="text-xs text-slate-300">
              Validates E.164 phone formats, catches duplicates against existing CRM records, and enforces opt-in status.
            </p>

            <div>
              <label className="block text-slate-400 text-xs mb-1">Raw CSV Text (or Paste from Spreadsheet)</label>
              <textarea
                rows={7}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-mono text-xs text-emerald-300 focus:outline-none"
              />
            </div>

            {/* Validation Error Report Table */}
            {importResult && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold">
                    Successfully Imported: {importResult.importedCount} Contacts
                  </span>
                  <span className="text-rose-400 font-bold">
                    Rejected Rows: {importResult.errors.length}
                  </span>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="border border-rose-500/40 rounded-lg overflow-hidden text-xs">
                    <div className="bg-rose-950/40 p-2 font-bold text-rose-300 text-[11px] uppercase tracking-wider">
                      Validation Error Report
                    </div>
                    <table className="w-full text-left text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                        <tr>
                          <th className="py-2 px-3">CSV Row #</th>
                          <th className="py-2 px-3">Phone Value</th>
                          <th className="py-2 px-3">Rejection Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                        {importResult.errors.map((err, i) => (
                          <tr key={i} className="hover:bg-slate-800/40">
                            <td className="py-2 px-3 text-amber-400">Row {err.row}</td>
                            <td className="py-2 px-3 text-rose-300">{err.phone}</td>
                            <td className="py-2 px-3 text-slate-300">{err.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleParseAndImport}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50"
              >
                Validate & Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {isGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Create Contact Segment</span>
              </h3>
              <button onClick={() => setIsGroupOpen(false)} className="text-slate-400 hover:text-white text-lg">&times;</button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Segment Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. VIP Repeat Buyers"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Criteria explanation"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Dynamic Segment</div>
                  <div className="text-[10px] text-slate-400">Automatically adds new contacts matching tags</div>
                </div>
                <input
                  type="checkbox"
                  checked={isDynamic}
                  onChange={(e) => setIsDynamic(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGroupOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
