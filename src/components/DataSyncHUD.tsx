'use client';

import React from 'react';
import { Database, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export interface SyncStatusState {
  isOpen: boolean;
  dataType: string;
  stageText: string;
  progress: number;
  isComplete: boolean;
  isError: boolean;
  errorMessage?: string;
}

interface DataSyncHUDProps {
  status: SyncStatusState;
}

export default function DataSyncHUD({ status }: DataSyncHUDProps) {
  if (!status.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md border border-white/20 bg-[#0c121e] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(59,130,246,0.35)] space-y-6 relative overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header with animated Icon */}
        <div className="flex items-center gap-4 border-b border-white/[0.08] pb-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
            status.isError
              ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
              : status.isComplete
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105'
              : 'bg-blue-600/15 border-blue-500/40 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)] animate-pulse'
          }`}>
            {status.isError ? (
              <AlertCircle className="w-7 h-7" />
            ) : status.isComplete ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : (
              <Database className="w-7 h-7 animate-bounce" />
            )}
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold block">
              {status.isComplete ? 'Sync Finalized' : 'Master Cloud Hub'}
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {status.isError ? 'Sync Interrupted' : status.isComplete ? 'Data Stored Successfully' : 'Synchronizing Data...'}
            </h3>
            <p className="text-xs text-[#94A3B8] font-mono mt-0.5">Target: {status.dataType}</p>
          </div>
        </div>

        {/* Progress Bar & Status Text */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[#94A3B8] flex items-center gap-1.5 truncate">
              <span className={`w-2 h-2 rounded-full shrink-0 ${status.isComplete ? 'bg-emerald-400' : 'bg-blue-400 animate-ping'}`} />
              <span className="truncate">{status.stageText}</span>
            </span>
            <span className={`font-bold shrink-0 ml-2 ${status.isComplete ? 'text-emerald-400' : 'text-blue-400'}`}>
              {status.progress}%
            </span>
          </div>

          {/* Neon Progress Bar */}
          <div className="w-full h-3 bg-[#090D16] rounded-full overflow-hidden border border-white/10 p-[1px]">
            <div
              className={`h-full rounded-full transition-all duration-300 shadow-md ${
                status.isError
                  ? 'bg-red-500'
                  : status.isComplete
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_#10B981]'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_0_15px_#3B82F6]'
              }`}
              style={{ width: `${Math.max(5, status.progress)}%` }}
            />
          </div>
        </div>

        {/* Bottom Specs Note */}
        <div className="p-3 rounded-2xl bg-[#090D16]/80 border border-white/5 flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Encrypted Transmission</span>
          </span>
          <span className="text-slate-400">All Devices Linked</span>
        </div>

      </div>
    </div>
  );
}