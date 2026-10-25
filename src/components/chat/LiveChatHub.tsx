import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatConversation, ChatMessage, InternalNote, BotAutomationRule, User } from '../../types';
import { 
  MessageSquare, 
  Search, 
  Send, 
  UserCheck, 
  FileText, 
  Bot, 
  Check, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  Plus, 
  Sparkles, 
  Sliders, 
  Tag, 
  Layers, 
  Phone, 
  Circle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const LiveChatHub: React.FC = () => {
  const {
    conversations,
    messages,
    internalNotes,
    botRules,
    users,
    contacts,
    templates,
    currentUser,
    activeConversationId,
    setActiveConversationId,
    sendChatMessage,
    addInternalNote,
    reassignConversation,
    toggleConversationStatus,
    saveBotRule,
    toggleBotRule,
    setAgentAvailability
  } = useApp();

  const [activeChatTab, setActiveChatTab] = useState<'chat' | 'notes' | 'bots'>('chat');
  const [chatSearch, setChatSearch] = useState('');
  const [chatFilter, setChatFilter] = useState<'ALL' | 'MINE' | 'UNREAD' | 'RESOLVED'>('ALL');

  // Compose State
  const [replyInput, setReplyInput] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');

  // Bot rule editor modal
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [botRuleName, setBotRuleName] = useState('');
  const [botPriority, setBotPriority] = useState<number>(10);
  const [botKeywords, setBotKeywords] = useState('');
  const [botReplyText, setBotReplyText] = useState('');
  const [botActionType, setBotActionType] = useState<BotAutomationRule['actionType']>('SEND_TEXT');

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const activeContact = contacts.find(c => c.phone === activeConv?.contactPhone);
  const convMessages = activeConv ? (messages[activeConv.id] || []) : [];
  const convNotes = activeConv ? (internalNotes[activeConv.id] || []) : [];

  const agents = users.filter(u => u.role === 'agent' || u.role === 'company_admin');

  // Filtered Conversations
  const filteredConversations = conversations.filter(conv => {
    if (chatFilter === 'MINE' && conv.assignedAgentId !== currentUser.id) return false;
    if (chatFilter === 'UNREAD' && conv.unreadCount === 0) return false;
    if (chatFilter === 'RESOLVED' && conv.status !== 'RESOLVED') return false;
    if (chatFilter === 'ALL' && conv.status === 'RESOLVED') return false; // Show active by default

    if (chatSearch.trim()) {
      const q = chatSearch.toLowerCase();
      return conv.contactName.toLowerCase().includes(q) || conv.contactPhone.includes(q);
    }
    return true;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !activeConv) return;
    sendChatMessage(activeConv.id, replyInput.trim(), selectedTemplateId || undefined);
    setReplyInput('');
    setSelectedTemplateId('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteInput.trim() || !activeConv) return;
    addInternalNote(activeConv.id, internalNoteInput.trim());
    setInternalNoteInput('');
  };

  const handleSaveBotRule = (e: React.FormEvent) => {
    e.preventDefault();
    saveBotRule({
      name: botRuleName,
      priority: botPriority,
      keywords: botKeywords.split(',').map(k => k.trim()),
      actionType: botActionType,
      replyText: botReplyText,
      caseSensitive: false
    });
    setIsBotModalOpen(false);
    setBotRuleName('');
    setBotKeywords('');
    setBotReplyText('');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100">
      {/* 3-COLUMN LIVE CHAT LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMN 1: CONVERSATIONS LIST */}
        <div className="w-80 border-r border-slate-800 bg-slate-900/90 flex flex-col shrink-0">
          {/* Search & Inbox Filters */}
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                placeholder="Search chats or phone..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-800 pb-1">
              <button
                onClick={() => setChatFilter('ALL')}
                className={`pb-1 ${chatFilter === 'ALL' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'hover:text-white'}`}
              >
                Open ({conversations.filter(c => c.status === 'OPEN').length})
              </button>
              <button
                onClick={() => setChatFilter('MINE')}
                className={`pb-1 ${chatFilter === 'MINE' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'hover:text-white'}`}
              >
                Assigned to Me
              </button>
              <button
                onClick={() => setChatFilter('UNREAD')}
                className={`pb-1 ${chatFilter === 'UNREAD' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'hover:text-white'}`}
              >
                Unread
              </button>
              <button
                onClick={() => setChatFilter('RESOLVED')}
                className={`pb-1 ${chatFilter === 'RESOLVED' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'hover:text-white'}`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No active conversations match criteria.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full text-left p-3.5 flex items-start space-x-3 transition ${
                      isSelected
                        ? 'bg-indigo-950/40 border-l-4 border-indigo-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 shrink-0 text-xs">
                      {conv.contactName.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate">{conv.contactName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono">{conv.contactPhone}</div>

                      <p className="text-[11px] text-slate-300 truncate mt-1">
                        {conv.lastMessage}
                      </p>

                      <div className="flex items-center justify-between mt-2 text-[10px]">
                        <span className="text-slate-400 truncate max-w-[120px]">
                          {conv.assignedAgentName || 'Unassigned'}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-[9px]">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: ACTIVE CHAT THREAD & COMPOSE */}
        <div className="flex-1 flex flex-col bg-slate-950">
          {activeConv ? (
            <>
              {/* Active Chat Header */}
              <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-xs">
                    {activeConv.contactName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xs font-bold text-white">{activeConv.contactName}</h2>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        {activeConv.contactPhone}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Assigned Agent: <strong className="text-slate-200">{activeConv.assignedAgentName}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Reassign Agent Dropdown */}
                  <select
                    value={activeConv.assignedAgentId || ''}
                    onChange={(e) => reassignConversation(activeConv.id, e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded text-[11px] text-slate-200 px-2 py-1 focus:outline-none"
                  >
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.isOnline ? 'Online' : 'Offline'})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => toggleConversationStatus(
                      activeConv.id,
                      activeConv.status === 'OPEN' ? 'RESOLVED' : 'OPEN'
                    )}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                      activeConv.status === 'OPEN'
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {activeConv.status === 'OPEN' ? 'Mark Resolved' : 'Re-open Chat'}
                  </button>
                </div>
              </div>

              {/* Chat Mode Switcher Tabs */}
              <div className="bg-slate-900/60 border-b border-slate-800 px-4 flex space-x-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveChatTab('chat')}
                  className={`py-2 border-b-2 flex items-center space-x-1.5 transition ${
                    activeChatTab === 'chat'
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Message Stream ({convMessages.length})</span>
                </button>

                <button
                  onClick={() => setActiveChatTab('notes')}
                  className={`py-2 border-b-2 flex items-center space-x-1.5 transition ${
                    activeChatTab === 'notes'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Private Internal Notes ({convNotes.length})</span>
                </button>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeChatTab === 'chat' && (
                  convMessages.map((msg) => {
                    const isInbound = msg.direction === 'INBOUND';
                    const isBot = msg.senderType === 'BOT';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
                      >
                        <div className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                          {msg.senderName} &bull; {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>

                        <div className={`max-w-[70%] p-3 rounded-xl text-xs leading-relaxed shadow-md ${
                          isInbound
                            ? 'bg-slate-800 text-slate-100 rounded-bl-none'
                            : isBot
                            ? 'bg-purple-950/80 border border-purple-700/50 text-purple-100 rounded-br-none'
                            : 'bg-emerald-700 text-white rounded-br-none'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>

                          {/* Delivery receipt status */}
                          {!isInbound && (
                            <div className="mt-1 flex items-center justify-end space-x-1 text-[10px] text-emerald-200">
                              {msg.deliveryStatus === 'read' && <CheckCheck className="w-3.5 h-3.5 text-blue-300" />}
                              {msg.deliveryStatus === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-slate-300" />}
                              {msg.deliveryStatus === 'sent' && <Check className="w-3.5 h-3.5 text-slate-300" />}
                              {msg.deliveryStatus === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-rose-300" />}
                              <span className="uppercase text-[9px]">{msg.deliveryStatus}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {activeChatTab === 'notes' && (
                  <div className="space-y-3">
                    <form onSubmit={handleAddNote} className="space-y-2 bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <label className="block text-xs font-semibold text-slate-300">Add Confidential Note</label>
                      <textarea
                        rows={2}
                        value={internalNoteInput}
                        onChange={(e) => setInternalNoteInput(e.target.value)}
                        placeholder="Internal context, escalation notes, or customer preferences..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition"
                      >
                        Save Internal Note
                      </button>
                    </form>

                    <div className="space-y-2">
                      {convNotes.map(note => (
                        <div key={note.id} className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between text-[10px] text-amber-300 font-semibold">
                            <span>{note.authorName}</span>
                            <span>{new Date(note.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-200">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Compose Box (for WhatsApp Tab) */}
              {activeChatTab === 'chat' && (
                <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => {
                        setSelectedTemplateId(e.target.value);
                        const t = templates.find(tpl => tpl.id === e.target.value);
                        if (t) setReplyInput(t.bodyText);
                      }}
                      className="bg-slate-950 border border-slate-700 rounded text-[11px] text-slate-300 px-2 py-1 focus:outline-none"
                    >
                      <option value="">Insert Meta Template...</option>
                      {templates.filter(t => t.status === 'APPROVED').map(t => (
                        <option key={t.id} value={t.id}>{t.name} [{t.category}]</option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400">Deducts 1 credit upon send</span>
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <textarea
                      rows={2}
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      placeholder="Type a WhatsApp reply to customer..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                    <button
                      type="submit"
                      className="px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
              Select a conversation to start messaging.
            </div>
          )}
        </div>

        {/* COLUMN 3: CONTACT PROFILE & AUTOMATION RULES */}
        <div className="w-80 border-l border-slate-800 bg-slate-900/90 flex flex-col shrink-0 overflow-y-auto p-4 space-y-5">
          {/* Customer Metadata Card */}
          {activeContact && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Customer Profile</span>
              </h3>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
                <div>
                  <div className="font-bold text-white text-sm">{activeContact.name}</div>
                  <div className="text-[11px] font-mono text-emerald-400">{activeContact.phone}</div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">Consent Status:</span>
                  <span className="font-bold text-emerald-400">{activeContact.consentStatus}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Opt-in Source:</span>
                  <span className="text-slate-200">{activeContact.consentSource}</span>
                </div>

                <div className="pt-1">
                  <span className="text-slate-400 text-[10px] uppercase block mb-1">Tags</span>
                  <div className="flex flex-wrap gap-1">
                    {activeContact.tags.map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-indigo-300 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Concurrent Agents & Workload Balancing */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Agent Workload Balancer</span>
            </h3>

            <div className="space-y-2">
              {agents.map(agent => (
                <div key={agent.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-1.5 font-semibold text-white">
                      <Circle className={`w-2 h-2 rounded-full ${agent.isOnline ? 'bg-emerald-400 fill-emerald-400' : 'bg-slate-600'}`} />
                      <span>{agent.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Active: {agent.activeChatCount || 2} / {agent.maxChatCapacity || 5} Chats
                    </div>
                  </div>

                  <button
                    onClick={() => setAgentAvailability(agent.id, !agent.isOnline)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      agent.isOnline
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {agent.isOnline ? 'Online' : 'Offline'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bot Automation Rules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>Priority Bot Rules</span>
              </h3>
              <button
                onClick={() => setIsBotModalOpen(true)}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Rule</span>
              </button>
            </div>

            <div className="space-y-2">
              {botRules.map(rule => (
                <div key={rule.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px]">#{rule.priority} {rule.name}</span>
                    <button
                      onClick={() => toggleBotRule(rule.id)}
                      className={`w-3.5 h-3.5 rounded-full border ${rule.isActive ? 'bg-purple-500 border-purple-400' : 'bg-slate-800 border-slate-700'}`}
                      title="Toggle Rule"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Keywords: [{rule.keywords.join(', ')}]
                  </div>
                  <div className="text-[9px] text-purple-300 font-mono">
                    Triggered {rule.hitCount} times
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE BOT RULE MODAL */}
      {isBotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <span>New Bot Automation Rule</span>
              </h3>
              <button onClick={() => setIsBotModalOpen(false)} className="text-slate-400 hover:text-white text-lg">&times;</button>
            </div>

            <form onSubmit={handleSaveBotRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Rule Name</label>
                <input
                  type="text"
                  value={botRuleName}
                  onChange={(e) => setBotRuleName(e.target.value)}
                  placeholder="e.g. Return Policy Helper"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority Order (1-99)</label>
                  <input
                    type="number"
                    value={botPriority}
                    onChange={(e) => setBotPriority(parseInt(e.target.value) || 10)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Action Type</label>
                  <select
                    value={botActionType}
                    onChange={(e) => setBotActionType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="SEND_TEXT">Send Auto-Text</option>
                    <option value="HANDOFF_AGENT">Handoff to Agent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Trigger Keywords (Comma separated)</label>
                <input
                  type="text"
                  value={botKeywords}
                  onChange={(e) => setBotKeywords(e.target.value)}
                  placeholder="return, refund, exchange"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Bot Reply Content</label>
                <textarea
                  rows={3}
                  value={botReplyText}
                  onChange={(e) => setBotReplyText(e.target.value)}
                  placeholder="Our returns policy allows returns within 30 days..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBotModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg"
                >
                  Save Bot Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
