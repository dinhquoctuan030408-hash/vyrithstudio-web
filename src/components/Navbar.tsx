'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { STUDIO_CONFIG } from '@/data/config';
import { Language } from '@/data/translations';
import { Search, Lock, ChevronDown, LogOut, User as UserIcon, Globe, Menu, X, Shield, Cpu, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: t.nav.dashboard, href: '/dashboard', lock: false },
    { name: t.nav.appstore, href: '/appstore', lock: true },
    { name: t.nav.project, href: '/project', lock: true },
    { name: t.nav.aboutus, href: '/aboutus', lock: true },
  ];

  const filteredApps = searchQuery.trim() === '' ? [] : STUDIO_CONFIG.activeApps.filter(
    app => app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
           app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = searchQuery.trim() === '' ? [] : STUDIO_CONFIG.upcomingProjects.filter(
    proj => proj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            proj.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proj.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const hasSearchResults = filteredApps.length > 0 || filteredProjects.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultClick = (targetHref: string) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(targetHref)}`);
    } else {
      router.push(targetHref);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#090D16]/75 backdrop-blur-2xl">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 p-[1.5px] shadow-[0_0_20px_-3px_rgba(56,189,248,0.5)] group-hover:shadow-[0_0_25px_0_rgba(56,189,248,0.8)] transition-all">
            <div className="w-full h-full bg-[#090D16] rounded-xl flex items-center justify-center p-1.5 overflow-hidden">
              <img 
                src="/icons/channel.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-blue-400 font-mono font-bold text-xs">&gt;_</span>';
                }}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black tracking-[0.2em] text-sm sm:text-base text-white group-hover:text-blue-400 transition-colors">
              VYRITH<span className="text-blue-500">.</span>STUDIO
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#94A3B8] font-mono">vyrithstudio.id.vn</span>
          </div>
        </Link>

        <div ref={searchRef} className="hidden md:block relative w-60 lg:w-80">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder={t.nav.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 bg-[#121826]/70 border border-white/10 rounded-full text-xs text-white placeholder-[#94A3B8]/60 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-[#94A3B8] hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {isSearchFocused && searchQuery.trim() !== '' && (
            <div className="absolute left-0 mt-2 w-full max-h-96 overflow-y-auto border border-white/15 bg-[#090D16]/95 backdrop-blur-2xl rounded-2xl p-3 shadow-2xl z-50 space-y-3">
              {!hasSearchResults ? (
                <div className="p-4 text-center text-xs text-[#94A3B8]">
                  {t.nav.noResults}
                </div>
              ) : (
                <>
                  {filteredApps.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-blue-400 px-2 py-1 font-bold">
                        {t.nav.categoryApps}
                      </div>
                      {filteredApps.map(app => (
                        <div
                          key={app.id}
                          onClick={() => handleSearchResultClick('/appstore')}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.06] cursor-pointer transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#121826] border border-white/10 flex items-center justify-center shrink-0">
                            <Cpu className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1 truncate">
                            <div className="text-xs font-bold text-white truncate">{app.name}</div>
                            <div className="text-[10px] text-[#94A3B8] truncate">{app.category}</div>
                          </div>
                          {!isAuthenticated && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredProjects.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 px-2 py-1 font-bold">
                        {t.nav.categoryProjects}
                      </div>
                      {filteredProjects.map(proj => (
                        <div
                          key={proj.id}
                          onClick={() => handleSearchResultClick('/project')}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.06] cursor-pointer transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#121826] border border-white/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div className="flex-1 truncate">
                            <div className="text-xs font-bold text-white truncate">{proj.name}</div>
                            <div className="text-[10px] text-[#94A3B8] truncate">{proj.status}</div>
                          </div>
                          {!isAuthenticated && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs uppercase font-medium tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-blue-600/15 border border-blue-500/30 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                {link.name}
                {link.lock && (
                  <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-white/10 bg-[#121826]/60 text-xs text-white hover:border-white/20 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-[11px] sm:text-xs">{lang}</span>
              <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-32 border border-white/10 bg-[#090D16]/95 backdrop-blur-xl rounded-xl py-1 shadow-2xl z-50">
                {(['EN', 'VI', 'ZH'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setIsLangOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between ${
                      lang === l ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{l === 'EN' ? 'English' : l === 'VI' ? 'Tiếng Việt' : '中文'}</span>
                    <span className="text-[10px] opacity-50">{l}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {!isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-white rounded-xl border border-white/10 hover:border-white/30 transition-all"
              >
                {t.nav.signIn}
              </Link>
              <Link
                href="/signup"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-[0_0_20px_-3px_rgba(59,130,246,0.5)] transition-all"
              >
                {t.nav.signUp}
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-xl border border-white/10 hover:border-blue-500/40 bg-[#121826]/40 transition-all"
              >
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-blue-500/40 bg-black/40"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || 'Vyrith')}`;
                  }}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 border border-white/10 bg-[#090D16]/95 backdrop-blur-xl rounded-2xl py-2 shadow-2xl z-50">
                  <div className="px-4 py-2.5 border-b border-white/[0.08]">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs text-white font-bold truncate">{user?.name}</p>
                      {user?.role === 'FOUNDER' && (
                        <Shield className="w-3 h-3 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-[#94A3B8] truncate mt-0.5">{user?.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                    {t.nav.editProfile}
                  </Link>
                  <button
                    onClick={() => { setIsUserMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t.nav.logout}
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-white/10 bg-[#121826]/60 text-[#94A3B8] hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#090D16]/95 backdrop-blur-2xl px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold ${
                pathname === link.href ? 'text-white bg-blue-600/20 border border-blue-500/30' : 'text-[#94A3B8]'
              }`}
            >
              <span>{link.name}</span>
              {link.lock && <Lock className="w-3 h-3 text-amber-400" />}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}