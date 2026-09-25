'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, Phone, ArrowRight, Terminal, AlertCircle, KeyRound, CheckCircle2, ArrowLeft, ShieldCheck, RefreshCw, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function SignupPage() {
  const { signup, sendEmailOtp } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  const [otpCode, setOtpCode] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Vyrith Studio - Sign Up';
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockActive(e.getModifierState('CapsLock'));
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Confirm password does not match.');
      return;
    }

    setLoading(true);
    const res = await sendEmailOtp(formData.email, formData.name);
    setLoading(false);

    if (res.success) {
      setStep(2);
      setCountdown(60);
      setSuccessMsg('6-digit verification code has been dispatched to your email.');
      if (res.otp) {
        setDemoOtpHint(res.otp);
      }
    } else {
      setError(res.error || 'Failed to dispatch verification OTP.');
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);
    const res = await sendEmailOtp(formData.email, formData.name);
    setLoading(false);
    if (res.success) {
      setCountdown(60);
      setSuccessMsg('A new verification code has been sent to your email.');
      if (res.otp) {
        setDemoOtpHint(res.otp);
      }
    }
  };

  const handleFinalSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    const rawOtp = localStorage.getItem(`vyrith_otp_${formData.email.toLowerCase().trim()}`);
    if (!rawOtp) {
      setError('Verification code is invalid or expired.');
      return;
    }

    const { otp, expiry } = JSON.parse(rawOtp);
    if (Date.now() > expiry || otp !== otpCode.trim()) {
      setError('Verification code is invalid or expired.');
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
      localStorage.removeItem(`vyrith_otp_${formData.email.toLowerCase().trim()}`);
      router.push('/dashboard');
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-[460px] border border-white/10 bg-[#121826]/80 backdrop-blur-2xl p-6 sm:p-9 rounded-3xl shadow-2xl relative">
        
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400 mb-3 shadow-[0_0_20px_-3px_rgba(59,130,246,0.5)]">
            <Terminal className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">Create Credentials</h1>
          <p className="text-xs text-[#94A3B8]">
            {step === 1 ? '1. Account Information' : '2. Email Security Verification'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {capsLockActive && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>CAPS LOCK is ON</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {demoOtpHint && step === 2 && (
          <div className="mb-4 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-mono flex items-center justify-between">
            <span>Terminal Demo OTP: <strong className="text-white text-xs">{demoOtpHint}</strong></span>
            <button 
              type="button" 
              onClick={() => setOtpCode(demoOtpHint)}
              className="text-[10px] text-blue-400 hover:underline font-bold"
            >
              Auto Fill
            </button>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-3.5">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium block mb-1">
                Full Name *
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
                Email address *
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
                Phone Number *
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium block mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyDown}
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-2.5 text-[#94A3B8] hover:text-white"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium block mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyDown}
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-2.5 top-2.5 text-[#94A3B8] hover:text-white"
                  >
                    {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wider uppercase shadow-[0_0_20px_-3px_rgba(59,130,246,0.5)] transition-all mt-4 disabled:opacity-50"
            >
              <span>{loading ? 'Dispatching OTP...' : 'Send Verification OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleFinalSignup} className="space-y-4">
            <div className="p-3 rounded-xl bg-[#090D16] border border-white/10 space-y-1">
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-mono">OTP Target Email</span>
              <p className="text-xs font-bold text-white font-mono truncate">{formData.email}</p>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-medium block mb-1.5 font-mono">
                6-Digit OTP Code *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-sm font-mono tracking-widest text-center text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[#94A3B8] hover:text-white flex items-center gap-1 font-mono text-[11px]"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || loading}
                className={`flex items-center gap-1 font-mono text-[11px] ${
                  countdown > 0 ? 'text-[#94A3B8]/60 cursor-not-allowed' : 'text-blue-400 hover:underline'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>{countdown > 0 ? `${countdown}s` : 'Resend Code'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wider uppercase shadow-[0_0_20px_-3px_rgba(59,130,246,0.5)] transition-all mt-3 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Verify OTP & Create Credentials'}</span>
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-[#94A3B8]">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}