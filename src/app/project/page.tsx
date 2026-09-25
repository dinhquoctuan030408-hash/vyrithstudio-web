'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StudioIcon from '@/components/StudioIcon';
import StatusBadge from '@/components/StatusBadge';
import { fetchAndSyncCloudData } from '@/data/projectManager';
import { UpcomingProject } from '@/data/config';
import { ExternalLink, Sparkles } from 'lucide-react';

export default function ProjectPage() {
  const [projects, setProjects] = useState<UpcomingProject[]>([]);

  useEffect(() => {
    document.title = 'Vyrith Studio - Projects';
    fetchAndSyncCloudData().then(data => setProjects(data.projects));
  }, []);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-12">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-mono uppercase mb-3 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>RESEARCH & GAME EXPERIENCES</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">R&D & Engineering Projects</h1>
        <p className="text-[#94A3B8] mt-2 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Core technology experiments spanning C++ native game loops, Luau sandboxes, low-latency netcode, and custom rendering pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="group rounded-3xl border border-white/10 bg-[#121826]/75 backdrop-blur-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-indigo-500/40 hover:shadow-[0_0_35px_-5px_rgba(99,102,241,0.25)] transition-all duration-300"
          >
            <div className="space-y-5">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#090D16] border border-white/10 p-2 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
                    <StudioIcon src={proj.icon} alt={proj.name} fallbackType="sparkles" />
                  </div>
                  <StatusBadge status={proj.status} size="sm" />
                </div>
                
                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                  {proj.progress}%
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {proj.name}
                </h3>
                <p className="text-xs text-[#94A3B8] font-mono mt-1">{proj.tagline}</p>
                <p className="text-xs text-[#94A3B8] mt-2 line-clamp-2 leading-relaxed">
                  {proj.overview || proj.tagline}
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.08] space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8] block">
                  Tech Architecture & Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {proj.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-0.5 rounded-lg bg-[#182234] border border-white/10 text-xs font-mono text-indigo-300 font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                  {proj.tags && proj.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] font-mono text-blue-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/project/${proj.id}`}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-white/10 hover:border-indigo-500/40 bg-white/5 hover:bg-indigo-600/15 text-xs font-bold text-white font-mono uppercase tracking-wider transition-all duration-200 group-hover:shadow-[0_0_20px_-3px_rgba(99,102,241,0.3)]"
              >
                <span>View Documentation</span>
                <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}