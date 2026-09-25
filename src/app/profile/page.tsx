'use client';

import React, { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle2, 
  Save, 
  KeyRound, 
  Upload, 
  AlertCircle, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Fingerprint, 
  Send, 
  RefreshCw 
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, sendEmailOtp } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passOtp, setPassOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const [copiedUid, setCopiedUid] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState('');
  const [infoError, setInfoError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [submittingPass, setSubmittingPass] = useState(false);

  useEffect(() => {
    document.title = 'Vyrith Studio - Profile';
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const handleCopyUid = () => {
    if (!user?.uid) return;
    navigator.clipboard.writeText(user.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setInfoError(t.profile.errorFill);
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setInfoError('Dung lượng ảnh tối đa là 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatar(result);
      setInfoError('');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!avatarUrlInput.trim()) return;
    setAvatar(avatarUrlInput.trim());
    setAvatarUrlInput('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError('');
    setInfoSuccess('');

    if (!name.trim() || !phone.trim()) {
      setInfoError(t.profile.errorFill);
      return;
    }

    updateProfile({ name: name.trim(), phone: phone.trim(), avatar });
    setInfoSuccess(t.profile.successInfo);
    setTimeout(() => setInfoSuccess(''), 4000);
  };

  const handleRequestPassOtp = async () => {
    if (!user?.email) return;
    if (otpCountdown > 0) return;

    setPassError('');
    setPassSuccess('');
    setSendingOtp(true);

    const res = await sendEmailOtp(user.email, user.name);
    setSendingOtp(false);

    if (res.success) {
      setOtpSent(true);
      setOtpCountdown(60);
      setPassSuccess(t.auth.otpSentSuccess);
    } else {
      setPassError(res.error || 'Không thể gửi mã OTP.');
    }
  };

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassError(t.profile.errorFill);
      return;
    }

    if (newPassword.length < 6) {
      setPassError(t.profile.errorPassLen);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError(t.profile.errorPassMatch);
      return;
    }

    if (!passOtp.trim() || passOtp.trim().length !== 6) {
      setPassError(t.profile.errorNeedOtp);
      return;
    }

    const rawOtp = localStorage.getItem(`vyrith_otp_${user?.email.toLowerCase().trim()}`);
    if (!rawOtp) {
      setPassError(t.auth.otpInvalid);
      return;
    }

    const { otp, expiry } = JSON.parse(rawOtp);
    if (Date.now() > expiry || otp !== passOtp.trim()) {
      setPassError(t.auth.otpInvalid);
      return;
    }

    setSubmittingPass(true);
    const res = await changePassword(oldPassword, newPassword);
    setSubmittingPass(false);

    if (res.success) {
      localStorage.removeItem(`vyrith_otp_${user?.email.toLowerCase().trim()}`);
      setPassSuccess(t.profile.successPass);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPassOtp('');
      setOtpSent(false);
      setTimeout(() => setPassSuccess(''), 4000);
    } else {
      setPassError(res.error || 'Đổi mật khẩu thất bại.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        
        {/* Phần 1: Profile Information */}
        <div className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-6 sm:p-10 rounded-2xl space-y-8">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-white/[0.08] pb-6 text-center sm:text-left">
            <div className="relative group shrink-0">
              <img
                src={avatar || user?.avatar}
                alt={user?.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-500/50 shadow-md bg-[#090D16]"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.name || 'Vyrith')}`;
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[11px] text-white"
              >
                <Upload className="w-4 h-4" />
                <span>{t.profile.uploadBtn}</span>
              </button>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">{user?.name}</h1>
                
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-500/30 bg-[#090D16] shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
                  <Fingerprint className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-xs font-mono font-bold text-blue-300 tracking-wider">
                    {user?.uid || 'VYR-0000-0000'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUid}
                    className="ml-1 text-[#94A3B8] hover:text-white transition-colors"
                    title={t.auth.copyUid}
                  >
                    {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#94A3B8] font-mono">{user?.email}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono">
                  <Shield className="w-3 h-3" />
                  <span>{user?.role === 'FOUNDER' ? t.profile.founderBadge : t.profile.devBadge}</span>
                </span>
                {user?.role === 'FOUNDER' && (
                  <span className="text-[10px] text-amber-400/90 font-mono">
                    {t.profile.founderNote}
                  </span>
                )}
              </div>
            </div>
          </div>

          {infoSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{infoSuccess}</span>
            </div>
          )}

          {infoError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{infoError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block font-mono">
                {t.profile.avatarTitle}
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-xs text-white transition-all shrink-0"
                >
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>{t.profile.uploadBtn}</span>
                </button>

                <div className="w-full flex items-center gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                    <input
                      type="url"
                      placeholder={t.profile.urlPlaceholder}
                      value={avatarUrlInput}
                      onChange={(e) => setAvatarUrlInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium"
                  >
                    {t.profile.useUrlBtn}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 block font-mono">
                  {t.profile.fullName}
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
                  {t.profile.phoneLabel}
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
                {t.profile.emailLabel}
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

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-[0_0_20px_-3px_rgba(59,130,246,0.4)] transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{t.profile.saveProfileBtn}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Phần 2: Change Password with Email OTP */}
        <div className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-6 sm:p-10 rounded-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
            <KeyRound className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">{t.profile.passTitle}</h2>
              <p className="text-xs text-[#94A3B8]">{t.profile.passSubtitle}</p>
            </div>
          </div>

          {passSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passSuccess}</span>
            </div>
          )}

          {passError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleChangePass} className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1.5">
                {t.profile.currentPass} *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1.5">
                  {t.profile.newPass} *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1.5">
                  {t.profile.confirmNewPass} *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* OTP Section for Password Change */}
            <div className="pt-2">
              <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1.5">
                {t.profile.otpLabel} *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={passOtp}
                  onChange={(e) => setPassOtp(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-sm font-mono tracking-widest text-center text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleRequestPassOtp}
                  disabled={otpCountdown > 0 || sendingOtp}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider flex items-center gap-1.5 shrink-0 transition-all ${
                    otpCountdown > 0 
                      ? 'bg-white/5 border border-white/10 text-[#94A3B8] cursor-not-allowed'
                      : 'bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  {sendingOtp ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {otpCountdown > 0 ? `${otpCountdown}s` : t.profile.getOtpBtn}
                  </span>
                </button>
              </div>
              <p className="text-[10px] text-[#94A3B8]/80 font-mono mt-1.5">
                Mã xác thực sẽ được gửi trực tiếp đến: <strong className="text-white">{user?.email}</strong>
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submittingPass}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-blue-500/30 bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white font-semibold text-xs transition-all disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{submittingPass ? 'Đang xác thực...' : t.profile.changePassBtn}</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </ProtectedRoute>
  );
}