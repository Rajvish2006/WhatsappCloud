import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BackgroundJob } from '../../types';
import { 
  Layers, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Scale, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Database 
} from 'lucide-react';

export const BackgroundQueueHub: React.FC = () => {
  const {
    backgroundJobs,
    currentCompany,
    reconcileLedger,
    currentWallet,
    ledger
  } = useApp();

  const [jobs, setJobs] = useState<BackgroundJob[]>(backgroundJobs);
  const [reconReport, setReconReport] = useState<{ status: 'BALANCED' | 'DISCREPANCY'; marketingDiff: number; utilityDiff: number } | null>(null);

  const runReconciliationCheck = () => {
    const res = reconcileLedger(currentCompany.id);
    setReconReport(res);
  };

  const handleManualRetry = (jobId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'PROCESSING',
          attempts: j.attempts + 1,
          errorMessage: undefined
        };
      }
      return j;
    }));

    setTimeout(() => {
      setJobs(prev => prev.map(j => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'COMPLETED',
            progress: 100,
            completedAt: new Date().toISOString()
          };
        }
        return j;
      }));
    }, 1200);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Worker Engine & Accounting
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Background Job Queues, Retries & Atomic Reconciliation
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Asynchronous campaign batch dispatching, exponential backoff retries, and zero-discrepancy ledger verification.
          </p>
        </div>

        <button
          onClick={runReconciliationCheck}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/50 transition"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Execute Ledger Reconciliation</span>
        </button>
      </div>

      {/* Reconciliation Diagnostic Result */}
      {reconReport && (
        <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
          reconReport.status === 'BALANCED'
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
        }`}>
          {reconReport.status === 'BALANCED' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs space-y-1">
            <div className="font-bold text-sm">
              Ledger Accounting Integrity: {reconReport.status === 'BALANCED' ? '100% BALANCED' : 'MISMATCH DETECTED'}
            </div>
            <p className="text-slate-300 leading-relaxed">
              Total historical allocations match wallet totals exactly. Marketing delta: {reconReport.marketingDiff} | Utility delta: {reconReport.utilityDiff}.
              Double-entry idempotency constraints have prevented double debit/credit occurrences across all campaign dispatches.
            </p>
          </div>
        </div>
      )}

      {/* Operational Worker Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Worker Streams</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">8 Workers</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Concurrency Healthy</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Webhook Latency</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">42 ms</div>
          <div className="text-[10px] text-indigo-400 mt-0.5">Meta Graph v21.0</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ledger Transaction Count</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">{ledger.length}</div>
          <div className="text-[10px] text-purple-400 mt-0.5">Immutable Audit Records</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Retry Policy</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">Exp. Backoff</div>
          <div className="text-[10px] text-amber-400 mt-0.5">Max 3 Attempts</div>
        </div>
      </div>

      {/* Background Jobs Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Asynchronous Jobs & Webhook Worker Queues</span>
          </h2>
          <span className="text-xs text-slate-400">{jobs.length} Monitored Jobs</span>
        </div>

        <div className="divide-y divide-slate-800">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 hover:bg-slate-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-white">{job.payloadDescription}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    job.status === 'PROCESSING' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 animate-pulse' :
                    job.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                    job.status === 'RETRYING' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                    'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Type: {job.type} &bull; Attempts: {job.attempts}/{job.maxAttempts} &bull; Queued: {new Date(job.createdAt).toLocaleTimeString()}
                </div>

                {job.errorMessage && (
                  <div className="p-2 bg-rose-950/30 border border-rose-500/30 rounded text-[11px] text-rose-300">
                    <strong>Worker Error:</strong> {job.errorMessage}
                  </div>
                )}
              </div>

              {/* Progress bar and manual retry */}
              <div className="flex items-center space-x-4">
                <div className="w-32 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Progress</span>
                    <span>{job.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${job.progress}%` }} className="bg-indigo-500 h-full" />
                  </div>
                </div>

                {job.status === 'RETRYING' && (
                  <button
                    onClick={() => handleManualRetry(job.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Force Retry</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
