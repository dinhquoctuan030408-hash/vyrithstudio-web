'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudioIcon from '@/components/StudioIcon';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { fetchAndSyncCloudData } from '@/data/projectManager';
import { AppItem } from '@/data/config';
import { Download, ShieldCheck, Lock, Ban, Wrench } from 'lucide-react';

export default function AppStorePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<AppItem[]>([]);

  useEffect(() => {
    document.title = 'Vyrith Studio - App Store';
    fetchAndSyncCloudData().then(data => setApps(data.apps));
  }, []);

  const handleDownload = (app: AppItem) => {
    if (app.status === 'Maintenance') {
      alert('This app is currently under maintenance. Please check back later.');
      return;
    }
    if (app.status === 'Discontinued') {
      alert('This application has been discontinued and is no longer available for download.');
      return;
    }
    if (app.downloadEnabled === false) {
      alert('Download access is temporarily paused by the administrator.');
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent('/appstore')}`);
      return;
    }

    const link = document.createElement('a');
    link.href = app.downloadUrl;
    link.setAttribute('download', `${app.name}.zip`);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-12">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono uppercase mb-3 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>AUTHENTICATED WORKSPACE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Vyrith Studio App Store</h1>
        <p className="text-[#94A3B8] mt-2 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Official binaries, development tools, and low-level modules compiled for Vyrith workspace accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {apps.map((app) => {
          const isMaintenance = app.status === 'Maintenance';
          const isDiscontinued = app.status === 'Discontinued';
          const isDisabled = isMaintenance || isDiscontinued || app.downloadEnabled === false;

          return (
            <div
              key={app.id}
              className="relative group rounded-3xl border border-white/10 bg-[#121826]/75 backdrop-blur-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-blue-500/40 hover:shadow-[0_0_35px_-5px_rgba(59,130,246,0.25)] transition-all duration-300"
            >
              <div className="space-y-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl border border-white/10 bg-[#090D16] p-2.5 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <StudioIcon src={app.icon} alt={app.name} fallbackType="cpu" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{app.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-blue-400 font-mono font-semibold">{app.version}</span>
                        <span className="text-[#94A3B8] text-[10px] font-mono">• {app.category}</span>
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={app.status} size="sm" />
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-3">
                  {app.description}
                </p>

                {app.tags && app.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {app.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-lg bg-[#182234] border border-white/10 text-[10px] font-mono text-blue-300 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleDownload(app)}
                  disabled={isDisabled}
                  className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                    isDiscontinued
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 cursor-not-allowed'
                      : isMaintenance
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 cursor-not-allowed'
                      : app.downloadEnabled === false
                      ? 'bg-white/5 border border-white/10 text-[#94A3B8] cursor-not-allowed'
                      : !isAuthenticated
                      ? 'bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 shadow-glow'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_25px_-3px_rgba(59,130,246,0.5)] active:scale-95'
                  }`}
                >
                  {isDiscontinued ? (
                    <>
                      <Ban className="w-4 h-4" />
                      <span>Discontinued</span>
                    </>
                  ) : isMaintenance ? (
                    <>
                      <Wrench className="w-4 h-4" />
                      <span>Under Maintenance</span>
                    </>
                  ) : app.downloadEnabled === false ? (
                    <span>Download Paused</span>
                  ) : !isAuthenticated ? (
                    <>
                      <Lock className="w-4 h-4 text-amber-300" />
                      <span>Sign In to Download</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Package</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}