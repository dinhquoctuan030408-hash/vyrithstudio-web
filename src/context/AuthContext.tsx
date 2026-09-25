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
  updateProfile: (updatedData: Partial<User>) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const hashPass = async (password: string) => {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(password));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const generateCyberUid = () => {
  const p1 = Math.floor(1000 + Math.random() * 9000);
  const p2 = Math.floor(1000 + Math.random() * 9000);
  return `VYR-${p1}-${p2}`;
};

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
    const expiry = Date.now() + 5 * 60 * 1000; // Hết hạn sau 5 phút

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp, name }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { 
          success: false, 
          error: data.error || 'Lỗi gửi email từ máy chủ. Vui lòng kiểm tra lại cấu hình .env.local' 
        };
      }

      // Lưu OTP vào bộ nhớ tạm sau khi đã gửi email thành công
      localStorage.setItem(`vyrith_otp_${email.toLowerCase().trim()}`, JSON.stringify({ otp, expiry }));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: 'Không thể kết nối đến máy chủ gửi Email.' };
    }
  };

  const signup = async (data: { name: string; email: string; phone: string; password: string }) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedPhone = data.phone.trim().replace(/\s+/g, '');

    if (normalizedEmail === STUDIO_CONFIG.founderAuth.email.toLowerCase()) {
      return { success: false, error: 'Email này thuộc quyền quản trị sáng lập viên.' };
    }

    const rawDB = localStorage.getItem('vyrith_vault_accounts');
    const accounts: Array<User & { passHash: string }> = rawDB ? JSON.parse(rawDB) : [];

    if (accounts.some(acc => acc.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'Địa chỉ Email này đã tồn tại trong hệ thống.' };
    }

    if (accounts.some(acc => acc.phone === normalizedPhone)) {
      return { success: false, error: 'Số điện thoại này đã được sử dụng.' };
    }

    const passHash = await hashPass(data.password);
    const generatedUid = generateCyberUid();

    const newUser: User = {
      id: 'USR_' + crypto.randomUUID().slice(0, 8).toUpperCase(),
      uid: generatedUid,
      name: data.name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
      role: 'MEMBER'
    };

    accounts.push({ ...newUser, passHash });
    localStorage.setItem('vyrith_vault_accounts', JSON.stringify(accounts));

    setUser(newUser);
    localStorage.setItem('vyrith_user_session', JSON.stringify(newUser));
    return { success: true };
  };

  const login = async (email: string, pass: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === STUDIO_CONFIG.founderAuth.email.toLowerCase()) {
      const founderPass = localStorage.getItem('vyrith_founder_password') || STUDIO_CONFIG.founderAuth.password;
      if (pass !== founderPass) {
        return { success: false, error: 'Tài khoản hoặc mật khẩu không chính xác.' };
      }

      const founderAvatar = localStorage.getItem('vyrith_founder_avatar') || STUDIO_CONFIG.founderAuth.avatar;
      const founderUser: User = {
        id: 'SYS_FOUNDER_00',
        uid: STUDIO_CONFIG.founderAuth.uid,
        name: STUDIO_CONFIG.founderAuth.name,
        email: STUDIO_CONFIG.founderAuth.email,
        phone: STUDIO_CONFIG.founderAuth.phone,
        avatar: founderAvatar,
        role: STUDIO_CONFIG.founderAuth.role
      };
      setUser(founderUser);
      localStorage.setItem('vyrith_user_session', JSON.stringify(founderUser));
      return { success: true };
    }

    const rawDB = localStorage.getItem('vyrith_vault_accounts');
    const accounts: Array<User & { passHash: string }> = rawDB ? JSON.parse(rawDB) : [];
    const target = accounts.find(acc => acc.email.toLowerCase() === normalizedEmail);

    if (!target) {
      return { success: false, error: 'Tài khoản hoặc mật khẩu không chính xác.' };
    }

    const inputHash = await hashPass(pass);
    if (target.passHash !== inputHash) {
      return { success: false, error: 'Tài khoản hoặc mật khẩu không chính xác.' };
    }

    const { passHash, ...safeUser } = target;
    if (!safeUser.uid) {
      safeUser.uid = generateCyberUid();
    }

    setUser(safeUser);
    localStorage.setItem('vyrith_user_session', JSON.stringify(safeUser));
    return { success: true };
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('vyrith_user_session', JSON.stringify(updated));

    if (user.role === 'FOUNDER' || user.email.toLowerCase() === STUDIO_CONFIG.founderAuth.email.toLowerCase()) {
      if (updatedData.avatar) {
        localStorage.setItem('vyrith_founder_avatar', updatedData.avatar);
      }
      return;
    }

    const rawDB = localStorage.getItem('vyrith_vault_accounts');
    if (rawDB) {
      const accounts: Array<User & { passHash: string }> = JSON.parse(rawDB);
      const idx = accounts.findIndex(a => a.id === user.id);
      if (idx !== -1) {
        accounts[idx] = { ...accounts[idx], ...updatedData };
        localStorage.setItem('vyrith_vault_accounts', JSON.stringify(accounts));
      }
    }
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    if (!user) return { success: false, error: 'Chưa đăng nhập' };

    if (user.role === 'FOUNDER' || user.email.toLowerCase() === STUDIO_CONFIG.founderAuth.email.toLowerCase()) {
      const currentFounderPass = localStorage.getItem('vyrith_founder_password') || STUDIO_CONFIG.founderAuth.password;
      if (oldPass !== currentFounderPass) {
        return { success: false, error: 'Mật khẩu hiện tại không chính xác.' };
      }
      localStorage.setItem('vyrith_founder_password', newPass);
      return { success: true };
    }

    const rawDB = localStorage.getItem('vyrith_vault_accounts');
    const accounts: Array<User & { passHash: string }> = rawDB ? JSON.parse(rawDB) : [];
    const idx = accounts.findIndex(a => a.id === user.id);

    if (idx === -1) {
      return { success: false, error: 'Không tìm thấy tài khoản.' };
    }

    const oldHash = await hashPass(oldPass);
    if (accounts[idx].passHash !== oldHash) {
      return { success: false, error: 'Mật khẩu hiện tại không chính xác.' };
    }

    accounts[idx].passHash = await hashPass(newPass);
    localStorage.setItem('vyrith_vault_accounts', JSON.stringify(accounts));
    return { success: true };
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