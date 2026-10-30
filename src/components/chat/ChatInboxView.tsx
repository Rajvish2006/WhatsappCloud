import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatConversation, ChatMessage } from '../../types';
import { 
  MessageSquare, 
  Search, 
  Send, 
  UserCheck, 
  FileText, 
  CheckCheck, 
  Check, 
  AlertCircle, 
  Bot,
  User,
  Clock,
  RefreshCw,
  X,
  Radio
} from 'lucide-react';

export const ChatInboxView: React.FC = () => {
  const {
    conversations,
    messages,
    internalNotes,
    contacts,
    templates,
    currentUser,
    activeConversationId,
    setActiveConversationId,
    sendChatMessage,
    addInternalNote,
    reassignConversation,
    users,
    syncInboundWebhookMessages,
    simulateCustomerInboundMessage
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'new'>('all');
  const [chatSearch, setChatSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [activeMode, setActiveMode] = useState<'chat' | 'notes'>('chat');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [simPhone, setSimPhone] = useState('+919876543210');
  const [simName, setSimName] = useState('Rahul Sharma');
  const [simText, setSimText] = useState('Hi! I am inquiring about WhatsApp Cloud API features.');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStatus, setSimStatus] = useState<string | null>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const convMessages = activeConv ? (messages[activeConv.id] || []) : [];
  const convNotes = activeConv ? (internalNotes[activeConv.id] || []) : [];
  const contact = contacts.find(c => c.phone.includes(activeConv?.contactPhone.replace(/[\s+]/g, '') || ''));
  const agents = users.filter(u => u.role === 'agent');

  const mineCount = conversations.filter(c => c.assignedAgentId === currentUser.id).length;
  const newCount = conversations.filter(c => (c.unreadCount || 0) > 0).length;

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncInboundWebhookMessages();
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const handleSimulateInbound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simPhone.trim() || !simText.trim()) return;
    setIsSimulating(true);
    setSimStatus('Simulating incoming WhatsApp webhook message...');

    try {
      const res = await simulateCustomerInboundMessage(simPhone.trim(), simName.trim(), simText.trim());
      setSimStatus(res.message);
      if (res.success) {
        setTimeout(() => {
          setIsSimModalOpen(false);
          setSimStatus(null);
        }, 1200);
      }
    } catch (err: any) {
      setSimStatus(`Error: ${err?.message || 'Simulation failed'}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'mine' && conv.assignedAgentId !== currentUser.id) return false;
    if (activeTab === 'new' && conv.unreadCount === 0) return false;
    if (chatSearch.trim()) {
      const q = chatSearch.toLowerCase();
      return conv.contactName.toLowerCase().includes(q) || conv.contactPhone.includes(q);
    }
    return true;
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;
    const txt = replyText.trim();
    const tplId = selectedTemplateId || undefined;
    setReplyText('');
    setSelectedTemplateId('');
    await sendChatMessage(activeConv.id, txt, tplId);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteText.trim() || !activeConv) return;
    addInternalNote(activeConv.id, internalNoteText.trim());
    setInternalNoteText('');
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex bg-white select-none">
      {/* COLUMN 1: CONVERSATIONS LIST matching Page 2 Bottom of PDF */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Conversations</h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleManualSync}
                title="Fetch latest incoming WhatsApp messages"
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
              </button>
              <button
                onClick={() => setIsSimModalOpen(true)}
                className="px-2 py-1 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
              >
                + Test Inbound
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Meta Webhook Live Sync Active</span>
          </div>

          {/* Search Box */}
          <div className="relative mb-3">
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search by contact or phone..."
              className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
          </div>

          {/* 3 Tabs matching Page 2 Bottom: All, Mine, New */}
          <div className="flex items-center space-x-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({conversations.length})
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'mine'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Mine ({mineCount})
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'new'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              New ({newCount})
            </button>
          </div>
        </div>

        {/* Conversations List matching Page 2 Bottom */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.map((conv) => {
            const isSelected = activeConv?.id === conv.id;
            const initialChar = conv.contactName.substring(0, 1).toUpperCase();

            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`w-full text-left p-3.5 flex items-start space-x-3 transition cursor-pointer ${
                  isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                }`}
              >
                {/* Circular Avatar matching PDF (A, 9, B in blue circle) */}
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                  {initialChar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 truncate">{conv.contactName}</span>
                    <span className="text-[10px] text-slate-400">{conv.lastMessageTime}</span>
                  </div>

                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[11px] text-slate-500 truncate pr-2">
                      {conv.lastMessage}
                    </p>
                    {Boolean(conv.unreadCount && conv.unreadCount > 0) && (
                      <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-bold shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* COLUMN 2: ACTIVE CHAT THREAD */}
      <div className="flex-1 flex flex-col bg-slate-50 border-r border-slate-200">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {activeConv.contactName.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-800">{activeConv.contactName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{activeConv.contactPhone}</div>
                </div>
              </div>

              {/* Mode Toggle & Agent Assignment */}
              <div className="flex items-center space-x-2 text-xs">
                <select
                  value={activeConv.assignedAgentId || ''}
                  onChange={(e) => reassignConversation(activeConv.id, e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded p-1 text-[11px] text-slate-700"
                >
                  <option value="">Assign Agent...</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>

                <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200">
                  <button
                    onClick={() => setActiveMode('chat')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${activeMode === 'chat' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500'}`}
                  >
                    WhatsApp Chat
                  </button>
                  <button
                    onClick={() => setActiveMode('notes')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${activeMode === 'notes' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
                  >
                    Internal Notes
                  </button>
                </div>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeMode === 'chat' ? (
                convMessages.map((msg) => {
                  const isInbound = msg.direction === 'incoming' || msg.direction === 'INBOUND';
                  const isBot = msg.senderType === 'BOT';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
                    >
                      <div className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                        {msg.senderName}
                      </div>

                      <div className={`max-w-[70%] p-3 rounded-xl text-xs leading-relaxed shadow-2xs ${
                        isInbound
                          ? 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                          : isBot
                          ? 'bg-blue-50 border border-blue-200 text-blue-900 rounded-br-none'
                          : 'bg-emerald-600 text-white rounded-br-none'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        {!isInbound && (
                          <div className="mt-1 flex items-center justify-end space-x-1 text-[10px] text-emerald-100">
                            {msg.deliveryStatus === 'read' ? <CheckCheck className="w-3.5 h-3.5 text-blue-200" /> : <Check className="w-3.5 h-3.5" />}
                            <span className="uppercase text-[9px]">{msg.deliveryStatus}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="space-y-3">
                  <form onSubmit={handleAddNote} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Add Internal Note (Team only)</label>
                    <textarea
                      rows={2}
                      value={internalNoteText}
                      onChange={(e) => setInternalNoteText(e.target.value)}
                      placeholder="Enter confidential customer note..."
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold"
                    >
                      Save note
                    </button>
                  </form>

                  {convNotes.map(n => (
                    <div key={n.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between text-amber-800 font-bold text-[10px]">
                        <span>{n.authorName}</span>
                        <span>{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-800">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Compose Box */}
            {activeMode === 'chat' && (
              <div className="p-3 bg-white border-t border-slate-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => {
                      setSelectedTemplateId(e.target.value);
                      const t = templates.find(tpl => tpl.id === e.target.value);
                      if (t) setReplyText(t.bodyText);
                    }}
                    className="bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 px-2 py-1"
                  >
                    <option value="">Insert Template...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name} [{t.category}]</option>
                    ))}
                  </select>
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a message to WhatsApp customer..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center transition shadow-2xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            Select a conversation to begin.
          </div>
        )}
      </div>

      {/* COLUMN 3: CONTACT PROFILE */}
      <div className="w-72 bg-white p-4 space-y-4 shrink-0 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact Details</h3>
        {contact ? (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-xs">
              {contact.name.substring(0, 1)}
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-800 text-sm">{contact.name}</div>
              <div className="text-slate-500 font-mono text-[11px]">{contact.phone}</div>
              {contact.email && <div className="text-blue-600 text-[11px]">{contact.email}</div>}
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Consent:</span>
                <span className="font-bold text-emerald-600">{contact.consentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">City:</span>
                <span className="text-slate-700">{contact.customAttributes.city || 'Noida'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400">No profile details found.</div>
        )}
      </div>
      {/* Modal: Simulate Customer Inbound WhatsApp Message */}
      {isSimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-sm font-bold text-slate-800">Simulate Inbound WhatsApp Webhook</h3>
              </div>
              <button
                onClick={() => setIsSimModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulateInbound} className="p-5 space-y-4 text-xs">
              <p className="text-slate-500 text-[11px]">
                Simulates an incoming WhatsApp message payload from a customer hitting your webhook endpoint. The message will be ingested directly into live chat.
              </p>

              {simStatus && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  {simStatus}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Customer Mobile Number (E.164)
                </label>
                <input
                  type="text"
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Sender Contact Name
                </label>
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Inbound Message Body
                </label>
                <textarea
                  rows={3}
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  placeholder="Hello, I would like to know your pricing plans..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 font-sans"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSimModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold transition"
                >
                  {isSimulating ? 'Dispatching...' : 'Dispatch Inbound Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
