'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Mail, Lock, User, Phone, ArrowRight, Terminal, AlertCircle } from 'lucide-react';

export default function SignupClient() {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ tất cả các trường thông tin.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu bảo mật phải có ít nhất 6 ký tự.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);
    const res = await signup({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });
    setLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Đăng ký không thành công.');
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-[440px] border border-white/10 bg-[#121826]/80 backdrop-blur-2xl p-6 sm:p-9 rounded-2xl shadow-2xl relative">
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400 mb-3">
            <Terminal className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">{t.auth.signupTitle}</h1>
          <p className="text-xs text-[#94A3B8]">{t.auth.signupSubtitle}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium block mb-1">
              {t.auth.name} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium block mb-1">
              {t.auth.email} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium block mb-1">
              Số điện thoại *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium block mb-1">
              {t.auth.password} (Tối thiểu 6 ký tự) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium block mb-1">
              Xác nhận mật khẩu *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wider uppercase shadow-[0_0_20px_-3px_rgba(59,130,246,0.5)] transition-all mt-4 disabled:opacity-50"
          >
            <span>{loading ? 'Đang khởi tạo...' : t.nav.signUp}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#94A3B8]">
          {t.auth.alreadyHaveAccount}{' '}
          <Link href="/login" className="text-blue-400 hover:underline font-semibold">
            {t.nav.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}