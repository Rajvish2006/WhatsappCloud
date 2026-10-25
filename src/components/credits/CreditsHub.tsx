import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreditCategory, CreditTransactionType } from '../../types';
import { 
  Coins, 
  Zap, 
  Lock, 
  CheckCircle2, 
  RefreshCcw, 
  PlusCircle, 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Scale, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export const CreditsHub: React.FC = () => {
  const {
    currentCompany,
    currentWallet,
    ledger,
    allocateCredits,
    reconcileLedger
  } = useApp();

  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpCategory, setTopUpCategory] = useState<CreditCategory>('MARKETING');
  const [topUpAmount, setTopUpAmount] = useState<number>(5000);
  const [topUpReason, setTopUpReason] = useState<string>('Q4 Promo Campaign Allowance');

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | CreditCategory>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | CreditTransactionType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [reconResult, setReconResult] = useState<{ status: 'BALANCED' | 'DISCREPANCY'; marketingDiff: number; utilityDiff: number } | null>(null);

  const companyLedger = ledger.filter(l => l.companyId === currentCompany.id);

  // Marketing Calculations
  const mktAvailable = currentWallet.marketingTotal - currentWallet.marketingReserved - currentWallet.marketingConsumed;
  const mktReservedPct = currentWallet.marketingTotal > 0 ? (currentWallet.marketingReserved / currentWallet.marketingTotal) * 100 : 0;
  const mktConsumedPct = currentWallet.marketingTotal > 0 ? (currentWallet.marketingConsumed / currentWallet.marketingTotal) * 100 : 0;

  // Utility Calculations
  const utilAvailable = currentWallet.utilityTotal - currentWallet.utilityReserved - currentWallet.utilityConsumed;
  const utilReservedPct = currentWallet.utilityTotal > 0 ? (currentWallet.utilityReserved / currentWallet.utilityTotal) * 100 : 0;
  const utilConsumedPct = currentWallet.utilityTotal > 0 ? (currentWallet.utilityConsumed / currentWallet.utilityTotal) * 100 : 0;

  // Filtered Ledger
  const filteredLedger = companyLedger.filter(entry => {
    if (categoryFilter !== 'ALL' && entry.category !== categoryFilter) return false;
    if (typeFilter !== 'ALL' && entry.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        entry.id.toLowerCase().includes(q) ||
        entry.reason.toLowerCase().includes(q) ||
        entry.referenceId.toLowerCase().includes(q) ||
        entry.idempotencyKey.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topUpAmount <= 0) return;
    allocateCredits(currentCompany.id, topUpCategory, topUpAmount, topUpReason);
    setIsTopUpOpen(false);
  };

  const runReconciliation = () => {
    const res = reconcileLedger(currentCompany.id);
    setReconResult(res);
  };

  const exportLedgerCSV = () => {
    const headers = ['Transaction ID', 'Category', 'Type', 'Amount', 'Before Balance', 'After Balance', 'Reference ID', 'Reason', 'Idempotency Key', 'Timestamp'];
    const rows = filteredLedger.map(l => [
      l.id,
      l.category,
      l.type,
      l.amount,
      l.beforeBalance,
      l.afterBalance,
      l.referenceId,
      `"${l.reason.replace(/"/g, '""')}"`,
      l.idempotencyKey,
      l.timestamp
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `omniwaba_credit_ledger_${currentCompany.code}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              P0 Requirement
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Separate Marketing & Utility Credit Balances
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Independent wallets, atomic reservations, real-time consumption, failure refunds, and double-entry ledger.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={runReconciliation}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verify Reconciliation</span>
          </button>

          <button
            onClick={() => setIsTopUpOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-950/50 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Allocate / Top Up Credits</span>
          </button>
        </div>
      </div>

      {/* Reconciliation Diagnostic Banner if triggered */}
      {reconResult && (
        <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
          reconResult.status === 'BALANCED'
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
        }`}>
          {reconResult.status === 'BALANCED' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <div className="font-bold text-sm">
              {reconResult.status === 'BALANCED' ? 'Zero-Discrepancy Audit Reconciliation Confirmed' : 'Ledger Discrepancy Flagged'}
            </div>
            <p className="mt-0.5 text-slate-300">
              The double-entry ledger was mathematically aggregated against current in-memory balances for <strong>{currentCompany.name}</strong>.
              Marketing variance: {reconResult.marketingDiff} | Utility variance: {reconResult.utilityDiff}.
            </p>
          </div>
          <button onClick={() => setReconResult(null)} className="text-slate-400 hover:text-slate-200 text-xs font-medium">Dismiss</button>
        </div>
      )}

      {/* Side-by-Side Dual Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MARKETING CREDITS CARD */}
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">Independent Category</span>
                <h2 className="text-base font-bold text-white">Marketing Credits</h2>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              Promotions & Broadcasts
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <div>
              <div className="text-[11px] text-slate-400">Available to Spend</div>
              <div className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
                {mktAvailable.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Locked / Reserved</div>
              <div className="text-lg font-bold text-amber-300 mt-1 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>{currentWallet.marketingReserved.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Allocation Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Allocated Total: <strong className="text-slate-200">{currentWallet.marketingTotal.toLocaleString()}</strong></span>
              <span>Consumed: <strong className="text-indigo-300">{currentWallet.marketingConsumed.toLocaleString()}</strong></span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div style={{ width: `${mktConsumedPct}%` }} className="bg-indigo-500 h-full" title={`Consumed: ${mktConsumedPct.toFixed(1)}%`} />
              <div style={{ width: `${mktReservedPct}%` }} className="bg-amber-400 h-full" title={`Reserved: ${mktReservedPct.toFixed(1)}%`} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Deduction rule: 1 credit per marketing recipient</span>
            <button
              onClick={() => { setTopUpCategory('MARKETING'); setIsTopUpOpen(true); }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              + Add Marketing Credits
            </button>
          </div>
        </div>

        {/* UTILITY CREDITS CARD */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">Independent Category</span>
                <h2 className="text-base font-bold text-white">Utility Message Credits</h2>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Orders, Alerts & Support
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <div>
              <div className="text-[11px] text-slate-400">Available to Spend</div>
              <div className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
                {utilAvailable.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Locked / Reserved</div>
              <div className="text-lg font-bold text-emerald-300 mt-1 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>{currentWallet.utilityReserved.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Allocation Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Allocated Total: <strong className="text-slate-200">{currentWallet.utilityTotal.toLocaleString()}</strong></span>
              <span>Consumed: <strong className="text-emerald-300">{currentWallet.utilityConsumed.toLocaleString()}</strong></span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div style={{ width: `${utilConsumedPct}%` }} className="bg-emerald-500 h-full" title={`Consumed: ${utilConsumedPct.toFixed(1)}%`} />
              <div style={{ width: `${utilReservedPct}%` }} className="bg-amber-400 h-full" title={`Reserved: ${utilReservedPct.toFixed(1)}%`} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Deduction rule: 1 credit per transactional / 2-way dispatch</span>
            <button
              onClick={() => { setTopUpCategory('UTILITY'); setIsTopUpOpen(true); }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              + Add Utility Credits
            </button>
          </div>
        </div>
      </div>

      {/* Deduction & Reservation Rules Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
          Strict Accounting & Lifecycle Rules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <div className="font-semibold text-indigo-300 flex items-center space-x-1 mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>1. Atomic Reservation</span>
            </div>
            When a campaign is scheduled or queued, credits are atomically moved from <em>Available</em> to <em>Reserved</em>. No campaign can start without upfront reservation.
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <div className="font-semibold text-emerald-300 flex items-center space-x-1 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>2. Batch Commit</span>
            </div>
            As batch workers dispatch to Meta Cloud API, reserved credits are finalized into <em>Consumed</em>. Idempotency keys prevent double billing.
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <div className="font-semibold text-amber-300 flex items-center space-x-1 mb-1">
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>3. Automatic Failure Refund</span>
            </div>
            If Meta Cloud API returns status "failed" (e.g. error 131026) or campaign is cancelled early, unconsumed credits automatically refund to Available.
          </div>
        </div>
      </div>

      {/* Immutable Double-Entry Credit Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Immutable Credit Ledger</span>
              <span className="text-[11px] font-normal text-slate-400">({companyLedger.length} Total Audit Records)</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Every balance delta has an immutable audit log, before/after balances & idempotency key.</p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reason or ref..."
                className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="MARKETING">Marketing Only</option>
              <option value="UTILITY">Utility Only</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Movement Types</option>
              <option value="ALLOCATION">ALLOCATION</option>
              <option value="RESERVATION">RESERVATION</option>
              <option value="COMMIT">COMMIT</option>
              <option value="REFUND">REFUND</option>
            </select>

            <button
              onClick={exportLedgerCSV}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="Download CSV Ledger"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Transaction / Time</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-right">Before &rarr; After</th>
                <th className="py-3 px-3">Reference & Idempotency Key</th>
                <th className="py-3 px-4">Audit Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((entry) => {
                  const isPositive = entry.amount > 0;
                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] font-semibold text-slate-200">{entry.id}</div>
                        <div className="text-[10px] text-slate-400">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          entry.category === 'MARKETING'
                            ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {entry.category}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center space-x-1 font-semibold text-[10px] ${
                          entry.type === 'ALLOCATION' ? 'text-emerald-400' :
                          entry.type === 'RESERVATION' ? 'text-amber-400' :
                          entry.type === 'REFUND' ? 'text-indigo-400' :
                          'text-slate-300'
                        }`}>
                          {entry.type === 'ALLOCATION' && <ArrowDownLeft className="w-3 h-3" />}
                          {entry.type === 'RESERVATION' && <Lock className="w-3 h-3" />}
                          {entry.type === 'REFUND' && <RefreshCcw className="w-3 h-3" />}
                          {entry.type === 'COMMIT' && <ArrowUpRight className="w-3 h-3" />}
                          <span>{entry.type}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className={`font-mono font-bold text-xs ${
                          entry.amount > 0 ? 'text-emerald-400' : 'text-slate-200'
                        }`}>
                          {entry.amount > 0 ? `+${entry.amount.toLocaleString()}` : entry.amount.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-400">
                        <span>{entry.beforeBalance.toLocaleString()}</span>
                        <span className="text-slate-500 mx-1">&rarr;</span>
                        <span className="text-slate-200 font-semibold">{entry.afterBalance.toLocaleString()}</span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono text-[10px] text-indigo-300 truncate max-w-[140px]" title={entry.referenceId}>
                          {entry.referenceType}: {entry.referenceId}
                        </div>
                        <div className="font-mono text-[9px] text-slate-400 truncate max-w-[140px]" title={entry.idempotencyKey}>
                          idemp: {entry.idempotencyKey}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-xs text-slate-300 font-medium max-w-[240px] truncate" title={entry.reason}>
                          {entry.reason}
                        </div>
                        <div className="text-[10px] text-slate-400">Actor: {entry.actorEmail}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOP-UP ALLOCATION MODAL */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Coins className="w-4 h-4 text-indigo-400" />
                <span>Allocate Credit Allowance</span>
              </h3>
              <button onClick={() => setIsTopUpOpen(false)} className="text-slate-400 hover:text-white text-lg">&times;</button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Company Target</label>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-semibold">
                  {currentCompany.name} ({currentCompany.code})
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Credit Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTopUpCategory('MARKETING')}
                    className={`p-2.5 rounded-lg border text-left font-semibold flex items-center space-x-2 ${
                      topUpCategory === 'MARKETING'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div>Marketing</div>
                      <div className="text-[10px] font-normal text-slate-400">Promotions & Broadcasts</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTopUpCategory('UTILITY')}
                    className={`p-2.5 rounded-lg border text-left font-semibold flex items-center space-x-2 ${
                      topUpCategory === 'UTILITY'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div>Utility</div>
                      <div className="text-[10px] font-normal text-slate-400">Alerts & 2-Way Messages</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Credit Amount</label>
                <input
                  type="number"
                  min="100"
                  step="500"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Audit Ledger Reason</label>
                <input
                  type="text"
                  value={topUpReason}
                  onChange={(e) => setTopUpReason(e.target.value)}
                  placeholder="e.g. Monthly Top-up / VIP campaign allowance"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                This transaction will immediately post an immutable <strong>ALLOCATION</strong> record to the PostgreSQL ledger with before/after balances.
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTopUpOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
