'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, Shield, CheckCircle2, Save } from 'lucide-react';

export default function ProfileClient() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, phone });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <ProtectedRoute>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-6 sm:p-10 rounded-2xl space-y-8">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-white/[0.08] pb-6 text-center sm:text-left">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/50 shadow-md bg-[#090D16]"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || 'Vyrith')}`;
              }}
            />
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{user?.name}</h1>
              <p className="text-xs text-[#94A3B8] font-mono mt-1">{user?.email}</p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono">
                <Shield className="w-3 h-3" />
                <span>{user?.role === 'FOUNDER' ? 'Executive Founder' : 'Vyrith Certified Developer'}</span>
              </div>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Cập nhật thông tin thành công.</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 block font-mono">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 block font-mono">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 block font-mono">
                Địa chỉ Email xác thực
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090D16]/50 border border-white/5 text-xs text-[#94A3B8] cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/[0.08]">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-[0_0_20px_-3px_rgba(59,130,246,0.4)] transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </ProtectedRoute>
  );
}