'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Mail, Lock, ArrowRight, Terminal, AlertCircle } from 'lucide-react';

export default function LoginClient() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Đăng nhập không thành công.');
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-[420px] border border-white/10 bg-[#121826]/80 backdrop-blur-2xl p-6 sm:p-9 rounded-2xl shadow-2xl relative">
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400 mb-3">
            <Terminal className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">{t.auth.loginTitle}</h1>
          <p className="text-xs text-[#94A3B8]">{t.auth.loginSubtitle}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium block mb-1.5">
              {t.auth.email}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium block mb-1.5">
              {t.auth.password}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wider uppercase shadow-[0_0_20px_-3px_rgba(59,130,246,0.5)] transition-all mt-4 disabled:opacity-50"
          >
            <span>{loading ? 'Đang xác thực...' : t.nav.signIn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#94A3B8]">
          {t.auth.dontHaveAccount}{' '}
          <Link href="/signup" className="text-blue-400 hover:underline font-semibold">
            {t.nav.signUp}
          </Link>
        </p>
      </div>
    </div>
  );
}