'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { STUDIO_CONFIG } from '@/data/config';
import { Download, CheckCircle, ShieldCheck } from 'lucide-react';

export default function AppStoreClient() {
  const { activeApps } = STUDIO_CONFIG;

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <ProtectedRoute>
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 sm:space-y-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authenticated Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">Vyrith Studio App Store</h1>
          <p className="text-[#94A3B8] mt-2 text-xs sm:text-sm max-w-2xl">
            Official binaries, development tools, and low-level modules compiled for Vyrith workspace accounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {activeApps.map((app) => (
            <div key={app.id} className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl border border-white/10 bg-[#090D16] p-2 flex items-center justify-center">
                      <img
                        src={app.icon}
                        alt={app.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">{app.name}</h3>
                      <span className="text-xs text-blue-400 font-mono">{app.version}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5" /> Ready
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{app.description}</p>
              </div>

              <button
                onClick={() => handleDownload(app.downloadUrl)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-[0_0_20px_-3px_rgba(59,130,246,0.4)] transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Package</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}