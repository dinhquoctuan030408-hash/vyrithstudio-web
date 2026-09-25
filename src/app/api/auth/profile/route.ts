import { NextResponse } from 'next/server';
import { redis } from '@/lib/db';
import { STUDIO_CONFIG } from '@/data/config';

export async function POST(req: Request) {
  try {
    const { action, email, oldPassword, newPassword, profileData } = await req.json();
    const normalizedEmail = email.trim().toLowerCase();

    // Hành động: Đổi mật khẩu
    if (action === 'change_password') {
      if (normalizedEmail === STUDIO_CONFIG.founderAuth.email.toLowerCase()) {
        let currentPass = STUDIO_CONFIG.founderAuth.password;
        if (redis) {
          const savedPass = await redis.get('founder_password');
          if (savedPass) currentPass = savedPass as string;
        }

        if (oldPassword !== currentPass) {
          return NextResponse.json({ success: false, error: 'Current password is not correct.' }, { status: 400 });
        }

        if (redis) {
          await redis.set('founder_password', newPassword);
        }
        return NextResponse.json({ success: true, message: 'Password updated globally across all devices.' });
      }

      if (redis) {
        const userData: any = await redis.get(`user:${normalizedEmail}`);
        if (!userData || userData.password !== oldPassword) {
          return NextResponse.json({ success: false, error: 'Current password is not correct.' }, { status: 400 });
        }

        userData.password = newPassword;
        await redis.set(`user:${normalizedEmail}`, userData);
        return NextResponse.json({ success: true, message: 'Password updated globally across all devices.' });
      }
    }

    // Hành động: Cập nhật thông tin / Avatar
    if (action === 'update_profile') {
      if (normalizedEmail === STUDIO_CONFIG.founderAuth.email.toLowerCase()) {
        if (redis && profileData.avatar) {
          await redis.set('founder_avatar', profileData.avatar);
        }
        return NextResponse.json({ success: true });
      }

      if (redis) {
        const userData: any = await redis.get(`user:${normalizedEmail}`);
        if (userData) {
          const updated = { ...userData, ...profileData };
          await redis.set(`user:${normalizedEmail}`, updated);
        }
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}