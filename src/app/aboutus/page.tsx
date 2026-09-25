'use client';

import React, { useEffect, useState } from 'react';
import { STUDIO_CONFIG } from '@/data/config';
import { Terminal, Shield, Zap, Mail, Phone, User, MessageSquare, Video } from 'lucide-react';

export default function AboutUsPage() {
  const { founder, socialLinks } = STUDIO_CONFIG;
  const [founderAvatar, setFounderAvatar] = useState(founder.avatar);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    document.title = 'Vyrith Studio - About Us';
    const dynamicAvatar = localStorage.getItem('vyrith_founder_avatar');
    if (dynamicAvatar) {
      setFounderAvatar(dynamicAvatar);
    }
  }, []);

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">
      
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">About Vyrith Studio</h1>
        <p className="text-xs sm:text-base text-[#94A3B8] max-w-2xl mx-auto">
          Bridging low-level systems engineering with interactive virtual worlds.
        </p>
      </div>

      <div className="border border-blue-500/20 bg-[#121826]/70 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-blue-500/40 shadow-md shrink-0 bg-[#090D16] flex items-center justify-center">
            {avatarError ? (
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(founder.name)}`}
                alt={founder.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={founderAvatar}
                alt={founder.name}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            )}
          </div>

          <div className="space-y-4 text-center md:text-left flex-1">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
                Studio Leadership
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-1">
                Founder: {founder.name}
              </h2>
              <p className="text-xs text-[#94A3B8] font-mono mt-0.5">{founder.title}</p>
            </div>

            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              {founder.bio}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <a
                href={`mailto:${founder.email}`}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-mono transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{founder.email}</span>
              </a>

              <a
                href={`tel:${founder.phone}`}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white border border-white/10 text-xs font-mono transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{founder.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight text-center md:text-left">
          Join Our Community & Social Media
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href={socialLinks.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-4 sm:p-5 rounded-2xl flex items-center gap-4 hover:border-blue-500/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2] group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Discord Server</h4>
              <p className="text-[11px] text-[#94A3B8]">Community & Dev Discussions</p>
            </div>
          </a>

          <a
            href={socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-4 sm:p-5 rounded-2xl flex items-center gap-4 hover:border-blue-500/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Facebook Page</h4>
              <p className="text-[11px] text-[#94A3B8]">Updates & Announcements</p>
            </div>
          </a>

          <a
            href={socialLinks.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-4 sm:p-5 rounded-2xl flex items-center gap-4 hover:border-blue-500/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">TikTok Channel</h4>
              <p className="text-[11px] text-[#94A3B8]">Shorts, Demos & Builds</p>
            </div>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-5 sm:p-6 rounded-2xl space-y-3">
          <Terminal className="w-6 h-6 text-blue-400" />
          <h3 className="text-base font-bold text-white">Core Technology</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Deterministic memory safety, cache-conscious C++ systems, and hardware-accelerated computation.
          </p>
        </div>

        <div className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-5 sm:p-6 rounded-2xl space-y-3">
          <Zap className="w-6 h-6 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Next-Gen Gaming</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Real-time physics routines, custom rendering shaders, and modular Luau game engines.
          </p>
        </div>

        <div className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-5 sm:p-6 rounded-2xl space-y-3">
          <Shield className="w-6 h-6 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Global Scalability</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Cross-platform production tools deployed on distributed low-latency edge networks.
          </p>
        </div>
      </div>

    </div>
  );
}