import React, { useState } from 'react';
import { COMPLETE_SQL_DDL, SCHEMA_TABLES, SCHEMA_MIGRATIONS, SchemaTable } from '../../services/sqlSchema';
import { SUPABASE_RLS_FIX_SQL } from '../../lib/supabaseService';
import { useApp } from '../../context/AppContext';
import { 
  Database, 
  Table, 
  Key, 
  FileCode2, 
  GitCommit, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  Search, 
  ShieldCheck, 
  SlidersHorizontal,
  RefreshCw,
  CloudUpload,
  CloudDownload,
  CheckCircle2,
  AlertTriangle,
  Server
} from 'lucide-react';

export const DatabaseSchemaViewer: React.FC = () => {
  const { supabaseStatus, syncWithSupabase, syncAllToSupabase, isSupabaseSyncing } = useApp();
  const [activeTab, setActiveTab] = useState<'tables' | 'ddl' | 'migrations' | 'constraints' | 'supabase'>('tables');
  const [selectedTable, setSelectedTable] = useState<SchemaTable>(SCHEMA_TABLES[0]);
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedSupabase, setCopiedSupabase] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handlePushAll = async () => {
    setIsPushing(true);
    setPushResult(null);
    try {
      const res = await syncAllToSupabase();
      if (res.success) {
        const total = Object.values(res.syncedCounts).reduce((a, b) => a + b, 0);
        setPushResult({
          message: `Successfully shared ${total} records across all 14 tables to Supabase!`,
          type: 'success'
        });
      } else {
        const errCount = Object.keys(res.errors).length;
        setPushResult({
          message: `Push completed with issues on ${errCount} table(s). Check RLS policies below.`,
          type: 'error'
        });
      }
    } catch (e: any) {
      setPushResult({
        message: e?.message || 'Error pushing to Supabase',
        type: 'error'
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullAll = async () => {
    setPushResult(null);
    try {
      await syncWithSupabase();
      setPushResult({
        message: 'Successfully pulled and refreshed latest data from Supabase!',
        type: 'success'
      });
    } catch (e: any) {
      setPushResult({
        message: e?.message || 'Error pulling from Supabase',
        type: 'error'
      });
    }
  };

  const filteredTables = SCHEMA_TABLES.filter(t => 
    t.name.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTableQuery.toLowerCase())
  );

  const copyDDL = () => {
    navigator.clipboard.writeText(COMPLETE_SQL_DDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySupabaseSQL = () => {
    navigator.clipboard.writeText(SUPABASE_RLS_FIX_SQL);
    setCopiedSupabase(true);
    setTimeout(() => setCopiedSupabase(false), 2000);
  };

  const downloadDDL = () => {
    const element = document.createElement('a');
    const file = new Blob([COMPLETE_SQL_DDL], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'omniwaba_schema_production.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              P0 Requirement
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Enterprise Relational Database Schema & Migrations
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Production PostgreSQL DDL, foreign keys, unique idempotency constraints, GIN indexes & migration audit history.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyDDL}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Full SQL DDL'}</span>
          </button>

          <button
            onClick={downloadDDL}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md shadow-emerald-950/50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .sql File</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('tables')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'tables'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Interactive Table Explorer ({SCHEMA_TABLES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ddl')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'ddl'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>Full Production DDL Script</span>
        </button>

        <button
          onClick={() => setActiveTab('migrations')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'migrations'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>Applied Migrations ({SCHEMA_MIGRATIONS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('constraints')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'constraints'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Indexes & Idempotency Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'supabase'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Supabase RLS & Direct Sync</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE TABLE EXPLORER */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Table List (Left col) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                placeholder="Search table or column..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredTables.map((tbl) => {
                const isSelected = selectedTable.name === tbl.name;
                return (
                  <button
                    key={tbl.name}
                    onClick={() => setSelectedTable(tbl)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs">{tbl.name}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-semibold">
                        {tbl.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {tbl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Details & Columns (Right col) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white font-mono">{selectedTable.name}</h2>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                  Category: {selectedTable.category.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">{selectedTable.description}</p>
            </div>

            {/* Column Schema Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                <Table className="w-3.5 h-3.5 text-emerald-400" />
                <span>Columns & Data Types</span>
              </h3>
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Column Name</th>
                      <th className="py-2.5 px-3">Data Type</th>
                      <th className="py-2.5 px-3">Constraints</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedTable.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-300">{col.name}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-indigo-300">{col.type}</td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-amber-300">
                          {col.constraints || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-400">{col.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Foreign Keys & Indexes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 mb-2">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Foreign Key Constraints</span>
                </h4>
                {selectedTable.foreignKeys.length === 0 ? (
                  <span className="text-xs text-slate-500">None (Root table)</span>
                ) : (
                  <ul className="space-y-1 font-mono text-[11px] text-slate-300">
                    {selectedTable.foreignKeys.map((fk, i) => (
                      <li key={i} className="flex items-center space-x-1.5">
                        <span className="text-amber-400">&bull;</span>
                        <span>{fk}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5 mb-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>B-Tree & Unique Indexes</span>
                </h4>
                <ul className="space-y-1 font-mono text-[11px] text-slate-300">
                  {selectedTable.indexes.map((idx, i) => (
                    <li key={i} className="flex items-center space-x-1.5">
                      <span className="text-indigo-400">&bull;</span>
                      <span>{idx}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL DDL SCRIPT */}
      {activeTab === 'ddl' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-2xl relative">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>PostgreSQL 15+ Enterprise Multi-Tenant DDL Definition</span>
            </div>
            <button
              onClick={copyDDL}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="text-xs text-emerald-300 font-mono overflow-x-auto p-4 rounded-lg bg-black/60 max-h-[600px] leading-relaxed">
            {COMPLETE_SQL_DDL}
          </pre>
        </div>
      )}

      {/* TAB 3: MIGRATIONS HISTORY */}
      {activeTab === 'migrations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">Database Migration Registry</h2>
            <p className="text-xs text-slate-400 mt-0.5">Automated sequence for zero-downtime schema evolution.</p>
          </div>

          <div className="space-y-3">
            {SCHEMA_MIGRATIONS.map((mig) => (
              <div key={mig.version} className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-white">{mig.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                      {mig.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{mig.description}</p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-500 shrink-0">
                  <div>Version: {mig.version}</div>
                  <div>{mig.appliedAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONSTRAINTS & IDEMPOTENCY */}
      {activeTab === 'constraints' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Idempotency & Duplicate Send Guards</span>
            </h3>
            <p className="text-xs text-slate-400">
              Critical safeguards preventing double messages during retries, worker restarts, or timeouts.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-emerald-300 font-mono">uq_recipient_idempotency</strong>
                <p className="text-slate-400 mt-1">
                  Enforces <code>UNIQUE(campaign_id, idempotency_key)</code>. Even if a background worker restarts, a recipient row cannot be re-inserted or re-dispatched.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-indigo-300 font-mono">uq_ledger_idempotency</strong>
                <p className="text-slate-400 mt-1">
                  Enforces <code>UNIQUE(company_id, idempotency_key)</code>. Guarantees credit transactions cannot be recorded or charged twice.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Check Constraints on Wallets</span>
            </h3>
            <p className="text-xs text-slate-400">
              Guarantees mathematical integrity at the PostgreSQL engine level.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-amber-300 font-mono">chk_marketing_balance</strong>
                <p className="text-slate-400 mt-1">
                  <code>CHECK (marketing_total &gt;= (marketing_reserved + marketing_consumed))</code>. Prevents over-reservation or negative balances.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-amber-300 font-mono">chk_utility_balance</strong>
                <p className="text-slate-400 mt-1">
                  <code>CHECK (utility_total &gt;= (utility_reserved + utility_consumed))</code>. Ensures utility credits remain mathematically positive.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUPABASE RLS & DIRECT SYNC */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          {/* Main Sync Controls Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${supabaseStatus.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <span>Everything Sharing with Supabase (14 Tables Bidirectional Sync)</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Connected Project: <code className="text-emerald-400 font-mono">{supabaseStatus.projectUrl || 'Not Configured'}</code>
                  {supabaseStatus.lastCheckedAt && (
                    <span className="text-slate-500 ml-2">| Verified: {new Date(supabaseStatus.lastCheckedAt).toLocaleTimeString()}</span>
                  )}
                </p>
              </div>

              {/* Push & Pull Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled={isPushing || isSupabaseSyncing}
                  onClick={handlePushAll}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center space-x-2 transition cursor-pointer shadow-md shadow-emerald-950/40"
                >
                  <CloudUpload className={`w-4 h-4 ${isPushing ? 'animate-bounce' : ''}`} />
                  <span>{isPushing ? 'Uploading All 14 Tables...' : 'Push Everything to Supabase'}</span>
                </button>

                <button
                  disabled={isPushing || isSupabaseSyncing}
                  onClick={handlePullAll}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center space-x-2 transition cursor-pointer shadow-md shadow-blue-950/40"
                >
                  <CloudDownload className={`w-4 h-4 ${isSupabaseSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSupabaseSyncing ? 'Refreshing...' : 'Pull Everything from Supabase'}</span>
                </button>

                <button
                  onClick={copySupabaseSQL}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                >
                  {copiedSupabase ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSupabase ? 'Copied SQL Script' : 'Copy Full Setup SQL'}</span>
                </button>
              </div>
            </div>

            {/* Sync Feedback Message */}
            {pushResult && (
              <div className={`p-3.5 rounded-lg text-xs flex items-center justify-between ${
                pushResult.type === 'success' 
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300' 
                  : 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
              }`}>
                <div className="flex items-center space-x-2">
                  {pushResult.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span>{pushResult.message}</span>
                </div>
                <button 
                  onClick={() => setPushResult(null)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Quick Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Configuration</span>
                <span className="font-bold text-white flex items-center space-x-1 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${supabaseStatus.isConfigured ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <span>{supabaseStatus.isConfigured ? 'API Key Configured' : 'Missing URL/Key'}</span>
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Database Ping</span>
                <span className="font-bold text-white flex items-center space-x-1 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${supabaseStatus.isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>{supabaseStatus.isConnected ? 'Online & Responsive' : 'Unreachable'}</span>
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Active Tables</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">
                  {Object.values(supabaseStatus.tablesAvailable || {}).filter(Boolean).length} / 14 Tables Ready
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Real-Time Sync</span>
                <span className="font-bold text-blue-400 mt-0.5 block">
                  Auto-Sync on Mutations
                </span>
              </div>
            </div>

            {/* 14-Table Sync Matrix Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  <span>All 14 Supabase Collections Sync Status</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  Total Rows Recorded: {Object.values(supabaseStatus.tableCounts || {}).reduce((a, b) => a + b, 0)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: 'companies', label: 'companies', desc: 'Tenants, Meta credentials & webhook secret tokens' },
                  { key: 'users', label: 'users', desc: 'Agents, admins, avatars, online statuses & roles' },
                  { key: 'contacts', label: 'contacts', desc: 'Audience phones, opt-in consent & metadata' },
                  { key: 'contact_groups', label: 'contact_groups', desc: 'Segmentation groups & filter queries' },
                  { key: 'templates', label: 'templates', desc: 'Meta-approved WhatsApp message templates' },
                  { key: 'campaigns', label: 'campaigns', desc: 'Broadcasts, schedules & analytics' },
                  { key: 'messages', label: 'messages', desc: 'Chat messages, message IDs & delivery receipts' },
                  { key: 'conversations', label: 'conversations', desc: '24-hour live chat sessions & agent assignments' },
                  { key: 'bot_rules', label: 'bot_rules', desc: 'Keyword auto-replies & bot triggers' },
                  { key: 'credit_wallets', label: 'credit_wallets', desc: 'Marketing & Utility balances and reservations' },
                  { key: 'credit_ledger', label: 'credit_ledger', desc: 'Immutable financial audit entries & idempotency keys' },
                  { key: 'tenant_api_keys', label: 'tenant_api_keys', desc: 'Hashed developer API credentials & scopes' },
                  { key: 'audit_logs', label: 'audit_logs', desc: 'Security actions, auth logs & admin events' },
                  { key: 'app_settings', label: 'app_settings', desc: 'Global platform settings & branding' },
                ].map(item => {
                  const isAvailable = (supabaseStatus.tablesAvailable as any)?.[item.key];
                  const rowCount = supabaseStatus.tableCounts?.[item.key] ?? 0;

                  return (
                    <div 
                      key={item.key}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-mono text-xs font-bold text-white flex items-center space-x-1.5">
                          <Table className="w-3 h-3 text-emerald-400" />
                          <span>{item.label}</span>
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          isAvailable 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {isAvailable ? `${rowCount} row${rowCount === 1 ? '' : 's'}` : 'Missing/RLS'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanatory Banner & SQL Fix */}
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs space-y-2 text-emerald-200 mt-4">
              <div className="font-bold text-sm text-emerald-300">How Everything Shares with Supabase:</div>
              <p className="text-slate-300 leading-relaxed">
                1. <strong>Real-Time Mutations:</strong> Whenever you add contacts, launch campaigns, send chat messages, or update bot rules, OmniWABA automatically commits changes to Supabase in the background.<br />
                2. <strong>One-Click Sync:</strong> Use <em>Push Everything to Supabase</em> to upload all pre-existing platform entities, or <em>Pull Everything</em> to pull recent records into the local view.<br />
                3. <strong>Permissions & Schema Setup:</strong> If any table shows <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-400">Missing/RLS</code>, copy the script below and paste it into your <strong>Supabase Dashboard &rarr; SQL Editor</strong> to create all tables and grant write access.
              </p>
            </div>

            {/* SQL Snippet View */}
            <div className="relative rounded-lg bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[360px]">
              <pre>{SUPABASE_RLS_FIX_SQL}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
