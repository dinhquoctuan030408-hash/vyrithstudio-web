'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { STUDIO_CONFIG } from '@/data/config';

export interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  sendEmailOtp: (email: string, name: string) => Promise<{ success: boolean; otp?: string; error?: string }>;
  signup: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updatedData: Partial<User>) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('vyrith_user_session');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('vyrith_user_session');
      }
    }
  }, []);

  const sendEmailOtp = async (email: string, name: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000;

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp, name }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to dispatch email verification code.' };
      }

      localStorage.setItem(`vyrith_otp_${email.toLowerCase().trim()}`, JSON.stringify({ otp, expiry }));
      return { success: true, otp };
    } catch {
      return { success: false, error: 'Network error connecting to email server.' };
    }
  };

  const signup = async (data: { name: string; email: string; phone: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Registration failed.' };
      }

      setUser(json.user);
      localStorage.setItem('vyrith_user_session', JSON.stringify(json.user));
      return { success: true };
    } catch {
      return { success: false, error: 'Cannot connect to authentication server.' };
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Incorrect email or password.' };
      }

      setUser(json.user);
      localStorage.setItem('vyrith_user_session', JSON.stringify(json.user));
      return { success: true };
    } catch {
      return { success: false, error: 'Cannot connect to authentication server.' };
    }
  };

  const updateProfile = async (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('vyrith_user_session', JSON.stringify(updated));

    try {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_profile', email: user.email, profileData: updatedData }),
      });
    } catch {}
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    if (!user) return { success: false, error: 'Not authenticated.' };

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_password', email: user.email, oldPassword: oldPass, newPassword: newPass }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Failed to update password.' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Cannot connect to authentication server.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vyrith_user_session');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, sendEmailOtp, updateProfile, changePassword, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};