'use client';

import React, { useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import StudioIcon from '@/components/StudioIcon';
import { useLanguage } from '@/context/LanguageContext';
import { STUDIO_CONFIG } from '@/data/config';
import { ExternalLink } from 'lucide-react';

export default function ProjectPage() {
  const { t } = useLanguage();
  const { upcomingProjects } = STUDIO_CONFIG;

  useEffect(() => {
    document.title = 'Vyrith Studio - Projects';
  }, []);

  return (
    <ProtectedRoute>
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 sm:space-y-12">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{t.project.title}</h1>
          <p className="text-[#94A3B8] mt-2 text-xs sm:text-sm max-w-2xl">
            {t.project.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {upcomingProjects.map((proj) => (
            <div key={proj.id} className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg border border-white/10 bg-[#090D16] p-1.5 flex items-center justify-center">
                      <StudioIcon
                        src={proj.icon}
                        alt={proj.name}
                        fallbackType="sparkles"
                      />
                    </div>
                    <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
                      {proj.status === 'Alpha' ? t.sections.statusAlpha : t.sections.statusDev}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#94A3B8]">{proj.progress}% {t.sections.completion}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">{proj.name}</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{proj.tagline}</p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] space-y-4">
                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block mb-2 font-mono">
                    {t.sections.techArch}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.techStack.map((tech) => (
                      <span key={tech} className="px-2.5 py-1 rounded-md bg-[#182234] border border-white/10 text-xs font-mono text-blue-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={proj.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 hover:border-blue-500/40 bg-white/5 hover:bg-blue-600/10 text-xs text-white font-medium transition-all"
                >
                  <span>{t.sections.viewDocs}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}