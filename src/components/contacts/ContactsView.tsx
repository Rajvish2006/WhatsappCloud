import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contact, ContactGroup } from '../../types';
import { 
  Users, 
  MessageCircle, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  Plus, 
  Filter, 
  CheckCircle2, 
  Layers, 
  ListFilter 
} from 'lucide-react';
import { AppNavTab } from '../common/Sidebar';

interface ContactsViewProps {
  initialSubTab?: 'list' | 'groups' | 'import' | 'fields';
  onNavigate: (tab: AppNavTab) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ initialSubTab = 'list', onNavigate }) => {
  const {
    contacts,
    groups,
    importContacts,
    deleteContact,
    createContactGroup,
    setActiveConversationId
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'list' | 'groups' | 'import' | 'fields'>(initialSubTab);

  // Filters matching Page 5 Top of PDF
  const [nameFilter, setNameFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  // CSV Import State matching Page 5 Bottom of PDF
  const [csvRawText, setCsvRawText] = useState(`phone,name,custom_field_name_1,custom_field_name_2
919800000001,Anil Gupta,Delhi,VIP
919800000002,Priya Sharma,Noida,Retail
919800000003,Vikram Mehta,Gurgaon,Investor`);
  const [selectedImportGroup, setSelectedImportGroup] = useState(groups[0]?.id || '');
  const [importResult, setImportResult] = useState<{ importedCount: number; errors: Array<{ row: number; phone: string; error: string }> } | null>(null);

  // New Group State matching Page 5 Middle
  const [newGroupName, setNewGroupName] = useState('');

  // Add Contact Modal
  const [isAddContactModal, setIsAddContactModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const filteredContacts = contacts.filter(c => {
    if (nameFilter && !c.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
    if (phoneFilter && !c.phone.includes(phoneFilter)) return false;
    return true;
  });

  const handleStartChat = (contact: Contact) => {
    onNavigate('chat');
  };

  const handleAddSingleContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim()) return;

    importContacts([{
      phone: newPhone.trim(),
      name: newName.trim() || 'New Lead',
      email: newEmail.trim() || undefined,
      consentStatus: 'OPTED_IN'
    }]);

    setIsAddContactModal(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = csvRawText.trim().split('\n');
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
    createContactGroup(newGroupName.trim(), 'Active contact segment', false);
    setNewGroupName('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Sub-Tabs Selector */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('list')}
          className={`pb-3 border-b-2 transition ${activeSubTab === 'list' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Contact list
        </button>
        <button
          onClick={() => setActiveSubTab('groups')}
          className={`pb-3 border-b-2 transition ${activeSubTab === 'groups' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Groups
        </button>
        <button
          onClick={() => setActiveSubTab('import')}
          className={`pb-3 border-b-2 transition ${activeSubTab === 'import' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Import
        </button>
        <button
          onClick={() => setActiveSubTab('fields')}
          className={`pb-3 border-b-2 transition ${activeSubTab === 'fields' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Fields
        </button>
      </div>

      {/* SUB-VIEW 1: CONTACT LIST matching Page 5 Top of PDF */}
      {activeSubTab === 'list' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Contacts management</h1>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                {contacts.length} CONTACTS
              </div>
            </div>

            {/* 4 Action Buttons top right matching PDF */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAddContactModal(true)}
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                Add new contact
              </button>
              <button
                onClick={() => setActiveSubTab('groups')}
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                Groups
              </button>
              <button
                onClick={() => setActiveSubTab('fields')}
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                Fields
              </button>
              <button
                onClick={() => alert('Exporting all contacts to CSV...')}
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                Export
              </button>
            </div>
          </div>

          {/* Filter Bar matching Page 5 Top of PDF */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Filter name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={phoneFilter}
                  onChange={(e) => setPhoneFilter(e.target.value)}
                  placeholder="Filter phone"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Groups</label>
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 focus:outline-none"
                >
                  <option value="">Select Groups</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Country</label>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 focus:outline-none"
                >
                  <option value="">Select Country</option>
                  <option value="+91">India (+91)</option>
                  <option value="+1">United States (+1)</option>
                </select>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition"
              >
                Filter
              </button>
            </div>
          </div>

          {/* Contacts Table matching Page 5 Top */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-8">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="py-3 px-3">NAME</th>
                    <th className="py-3 px-3">PHONE</th>
                    <th className="py-3 px-3">CREATED AT</th>
                    <th className="py-3 px-3">GROUPS</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.map(contact => (
                    <tr key={contact.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {contact.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {contact.phone}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(contact.createdAt).toISOString().split('T')[0]}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {contact.groups.length > 0 ? 'Investors' : '-'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {/* Emerald Start Chat Button matching Page 5 */}
                        <button
                          onClick={() => handleStartChat(contact)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Start chat</span>
                        </button>

                        <button
                          className="p-1 rounded text-blue-600 hover:bg-blue-50 transition"
                          title="Edit contact"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 transition"
                          title="Delete contact"
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
        </div>
      )}

      {/* SUB-VIEW 2: GROUPS MANAGEMENT matching Page 5 Middle */}
      {activeSubTab === 'groups' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400 font-semibold uppercase">
            / Contacts / Groups management
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Groups management</h1>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 max-w-md">
            <label className="block text-xs font-semibold text-slate-700">Name</label>
            <form onSubmit={handleCreateGroup} className="flex gap-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter name"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-800 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-md shadow-xs"
              >
                Add new group
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase">Existing Groups</h2>
            <div className="space-y-2">
              {groups.map(g => (
                <div key={g.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{g.name}</div>
                    <div className="text-slate-500 text-[11px]">{g.description}</div>
                  </div>
                  <span className="text-slate-600 font-mono text-[11px]">3 Contacts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: CSV CONTACTS IMPORT matching Page 5 Bottom */}
      {activeSubTab === 'import' && (
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">CSV contacts import</h1>

          <form onSubmit={handleImportSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">CSV file / content</label>
              <textarea
                rows={5}
                value={csvRawText}
                onChange={(e) => setCsvRawText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 font-mono text-xs text-slate-800 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Headers: <code>phone,name,custom_field_name_1,custom_field_name_2</code>
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Group to insert into</label>
              <select
                value={selectedImportGroup}
                onChange={(e) => setSelectedImportGroup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-slate-800 focus:outline-none"
              >
                <option value="">Select Group to insert into</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {importResult && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="font-bold text-emerald-700">Successfully imported: {importResult.importedCount} contacts</div>
                {importResult.errors.length > 0 && (
                  <div className="text-rose-600">Errors: {importResult.errors.length} rows rejected</div>
                )}
              </div>
            )}

            <div>
              {/* Emerald Green Import button matching Page 5 Bottom */}
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-xs transition"
              >
                Import contact
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-VIEW 4: FIELDS */}
      {activeSubTab === 'fields' && (
        <div className="space-y-4 max-w-xl">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Custom Fields</h1>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between">
              <span className="font-semibold text-slate-800">city</span>
              <span className="text-slate-400 font-mono">TEXT</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between">
              <span className="font-semibold text-slate-800">investor_tier</span>
              <span className="text-slate-400 font-mono">STRING</span>
            </div>
          </div>
        </div>
      )}

      {/* ADD SINGLE CONTACT MODAL */}
      {isAddContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-800">Add new contact</h2>
            <form onSubmit={handleAddSingleContact} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone Number (with Country Code)</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. 919811223344"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
