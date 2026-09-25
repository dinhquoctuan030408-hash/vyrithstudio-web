'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { STUDIO_CONFIG } from '@/data/config';
import { getLiveProjects, getLiveApps } from '@/data/projectManager';
import { Search, ChevronDown, LogOut, User as UserIcon, Menu, X, Shield, Cpu, Sparkles, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: "Dashboard", href: '/dashboard' },
    { name: "App Store", href: '/appstore' },
    { name: "Projects", href: '/project' },
    { name: "About Us", href: '/aboutus' },
  ];

  const liveProjects = getLiveProjects();
  const liveApps = getLiveApps();

  const filteredApps = searchQuery.trim() === '' ? [] : liveApps.filter(
    app => app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
           app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = searchQuery.trim() === '' ? [] : liveProjects.filter(
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
    router.push(targetHref);
  };

  const isFounder = user?.role === 'FOUNDER' || user?.email.toLowerCase() === STUDIO_CONFIG.founderAuth.email.toLowerCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#090D16]/80 backdrop-blur-2xl">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        
        {/* Logo */}
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

        {/* Search */}
        <div ref={searchRef} className="hidden md:block relative w-60 lg:w-80">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search apps, projects..."
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
                  No matching apps or projects found
                </div>
              ) : (
                <>
                  {filteredApps.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-blue-400 px-2 py-1 font-bold">
                        Applications
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
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredProjects.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 px-2 py-1 font-bold">
                        Projects
                      </div>
                      {filteredProjects.map(proj => (
                        <div
                          key={proj.id}
                          onClick={() => handleSearchResultClick(`/project/${proj.id}`)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.06] cursor-pointer transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#121826] border border-white/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div className="flex-1 truncate">
                            <div className="text-xs font-bold text-white truncate">{proj.name}</div>
                            <div className="text-[10px] text-[#94A3B8] truncate">{proj.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Navigation Links */}
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
              </Link>
            );
          })}
        </nav>

        {/* Right Auth Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#94A3B8] hover:text-white rounded-xl border border-white/10 hover:border-white/30 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-[0_0_20px_-3px_rgba(59,130,246,0.5)] transition-all"
              >
                Sign Up
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
                      {isFounder && (
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
                    <span>Edit Profile</span>
                  </Link>

                  {/* Nút Founder Panel */}
                  {isFounder && (
                    <Link
                      href="/panel"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-amber-300 font-semibold hover:bg-amber-500/10 transition-colors border-t border-b border-white/[0.05]"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                      <span>Studio Founder Panel</span>
                    </Link>
                  )}

                  <button
                    onClick={() => { setIsUserMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
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
            </Link>
          ))}
          {isFounder && (
            <Link
              href="/panel"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Studio Founder Panel</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}