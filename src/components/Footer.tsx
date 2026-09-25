'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#090D16]/80 py-8 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-white tracking-wider">VYRITH STUDIO</span>
          <span>© 2026. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/aboutus" className="hover:text-white transition-colors">About Us</Link>
          <Link href="/project" className="hover:text-white transition-colors">Projects</Link>
          <Link href="/appstore" className="hover:text-white transition-colors">App Store</Link>
        </div>
      </div>
    </footer>
  );
}
