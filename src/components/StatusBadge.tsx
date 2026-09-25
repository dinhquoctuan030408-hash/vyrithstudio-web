'use client';

import React from 'react';
import { AppProjectStatus } from '@/data/config';
import { CheckCircle2, Hammer, Wrench, Ban, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: AppProjectStatus | string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const normStatus = (status || 'Ready').toUpperCase();

  let badgeStyle = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]';
  let Icon = CheckCircle2;
  let label = status;

  if (normStatus.includes('DEV') || normStatus === 'IN DEVELOPMENT') {
    badgeStyle = 'border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.2)]';
    Icon = Hammer;
    label = 'In Development';
  } else if (normStatus.includes('MAINT') || normStatus === 'MAINTENANCE') {
    badgeStyle = 'border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
    Icon = Wrench;
    label = 'Maintenance';
  } else if (normStatus.includes('DISCONT') || normStatus === 'DISCONTINUED') {
    badgeStyle = 'border-rose-500/40 bg-rose-500/10 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]';
    Icon = Ban;
    label = 'Discontinued';
  } else if (normStatus.includes('ALPHA') || normStatus.includes('BETA')) {
    badgeStyle = 'border-purple-500/40 bg-purple-500/10 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]';
    Icon = Sparkles;
    label = status;
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-mono uppercase tracking-wider font-bold border ${sizeClasses} ${badgeStyle}`}>
      <Icon className="w-3 h-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
