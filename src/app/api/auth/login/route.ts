import { NextResponse } from 'next/server';
import { redis } from '@/lib/db';
import { STUDIO_CONFIG } from '@/data/config';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Kiểm tra tài khoản Founder
    if (normalizedEmail === STUDIO_CONFIG.founderAuth.email.toLowerCase()) {
      let founderPass = STUDIO_CONFIG.founderAuth.password;
      let founderAvatar = STUDIO_CONFIG.founderAuth.avatar;

      if (redis) {
        const savedPass = await redis.get('founder_password');
        const savedAvatar = await redis.get('founder_avatar');
        if (savedPass) founderPass = savedPass as string;
        if (savedAvatar) founderAvatar = savedAvatar as string;
      }

      if (password !== founderPass) {
        return NextResponse.json({ success: false, error: 'Incorrect email or password.' }, { status: 400 });
      }

      const founderUser = {
        id: 'SYS_FOUNDER_00',
        uid: STUDIO_CONFIG.founderAuth.uid,
        name: STUDIO_CONFIG.founderAuth.name,
        email: STUDIO_CONFIG.founderAuth.email,
        phone: STUDIO_CONFIG.founderAuth.phone,
        avatar: founderAvatar,
        role: STUDIO_CONFIG.founderAuth.role,
      };

      return NextResponse.json({ success: true, user: founderUser });
    }

    // 2. Kiểm tra tài khoản User qua Cloud Database
    if (redis) {
      const userData: any = await redis.get(`user:${normalizedEmail}`);
      if (!userData || userData.password !== password) {
        return NextResponse.json({ success: false, error: 'Incorrect email or password.' }, { status: 400 });
      }

      const { password: _, ...safeUser } = userData;
      return NextResponse.json({ success: true, user: safeUser });
    }

    // Fallback tạm thời nếu chưa bật Redis
    return NextResponse.json({
      success: true,
      user: {
        id: 'USR_TEMP',
        uid: 'VYR-1000-2000',
        name: email.split('@')[0].toUpperCase(),
        email: normalizedEmail,
        phone: '0976853340',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        role: 'MEMBER'
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}