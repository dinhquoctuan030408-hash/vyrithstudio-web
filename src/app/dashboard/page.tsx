'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import StudioIcon from '@/components/StudioIcon';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { STUDIO_CONFIG, UpcomingProject, AppItem } from '@/data/config';
import { ArrowRight, Sparkles, Layers, Star, ExternalLink } from 'lucide-react';

export default function DashboardPage() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { activeApps, upcomingProjects } = STUDIO_CONFIG;

  useEffect(() => {
    document.title = 'Vyrith Studio - Dashboard';
  }, []);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-20 sm:space-y-28">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-4 pb-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[11px] sm:text-xs tracking-widest font-semibold uppercase mb-6 sm:mb-8 shadow-[0_0_20px_-3px_rgba(59,130,246,0.4)]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.hero.badge}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-5xl leading-[1.15]"
        >
          {t.hero.headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6 max-w-3xl text-xs sm:text-sm md:text-base text-[#94A3B8] leading-relaxed font-normal"
        >
          {t.hero.desc}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full"
        >
          <Link
            href={isAuthenticated ? '/appstore' : '/login?redirect=/appstore'}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-[0_0_25px_-5px_rgba(59,130,246,0.5)] transition-all"
          >
            <span>{t.hero.exploreApps}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={isAuthenticated ? '/project' : '/login?redirect=/project'}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl border border-white/10 bg-[#121826]/60 hover:bg-[#121826] hover:border-white/20 text-white font-semibold text-xs sm:text-sm transition-all"
          >
            <span>{t.hero.viewProjects}</span>
            <Layers className="w-4 h-4 text-[#94A3B8]" />
          </Link>
        </motion.div>
      </section>

      {/* SECTION 2: ACTIVE APPS */}
      <section className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/[0.08] pb-5 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              {t.sections.activeApps}
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">{t.sections.activeAppsSub}</p>
          </div>
          <Link
            href={isAuthenticated ? '/appstore' : '/login?redirect=/appstore'}
            className="text-xs uppercase tracking-wider text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5"
          >
            <span>{t.hero.exploreApps}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {activeApps.map((app: AppItem) => (
            <div
              key={app.id}
              className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-6 hover:border-blue-500/40 hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.25)] transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl border border-white/10 bg-[#090D16] p-2.5 flex items-center justify-center shadow-md">
                    <StudioIcon
                      src={app.icon}
                      alt={app.name}
                      fallbackType="cpu"
                    />
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-amber-300 font-mono">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>{app.rating}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] tracking-wider uppercase font-semibold text-blue-400 mb-1 font-mono">
                    {app.category}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">{app.name}</h3>
                  <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed line-clamp-3">
                    {app.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#94A3B8]">{app.version}</span>
                <Link
                  href={isAuthenticated ? '/appstore' : '/login?redirect=/appstore'}
                  className="px-4 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-semibold transition-all"
                >
                  {t.sections.launch}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: UPCOMING PROJECTS */}
      <section className="space-y-6 sm:space-y-8">
        <div className="border-b border-white/[0.08] pb-5">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
            {t.sections.upcomingProjects}
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">{t.sections.upcomingProjectsSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {upcomingProjects.map((proj: UpcomingProject) => (
            <Link
              key={proj.id}
              href={isAuthenticated ? '/project' : '/login?redirect=/project'}
              className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-6 hover:border-blue-500/40 hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.25)] transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg border border-white/10 bg-[#090D16] p-1.5 flex items-center justify-center">
                      <StudioIcon
                        src={proj.icon}
                        alt={proj.name}
                        fallbackType="sparkles"
                      />
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${
                        String(proj.status) === 'Alpha'
                          ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
                          : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {String(proj.status) === 'Alpha' ? t.sections.statusAlpha : t.sections.statusDev}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#94A3B8] group-hover:text-blue-400 transition-colors" />
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{proj.name}</h3>
                  <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed">
                    {proj.tagline}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {proj.techStack.map((tech: string) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md bg-[#182234] border border-white/10 text-[10px] font-mono text-blue-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#94A3B8] font-mono text-[11px]">{t.sections.completion}</span>
                  <span className="text-blue-400 font-mono font-bold text-xs">{proj.progress}%</span>
                </div>
                <div className="w-full h-1.5 sm:h-2 bg-[#090D16] rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full shadow-[0_0_10px_#3B82F6]"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}