import { NextResponse } from 'next/server';
import { redis } from '@/lib/db';
import { STUDIO_CONFIG } from '@/data/config';

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim().replace(/\s+/g, '');

    if (normalizedEmail === STUDIO_CONFIG.founderAuth.email.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'This email is reserved for Studio Leadership.' }, { status: 400 });
    }

    // Nếu có Redis Database
    if (redis) {
      const existingUser = await redis.get(`user:${normalizedEmail}`);
      if (existingUser) {
        return NextResponse.json({ success: false, error: 'This email is already registered.' }, { status: 400 });
      }

      const p1 = Math.floor(1000 + Math.random() * 9000);
      const p2 = Math.floor(1000 + Math.random() * 9000);
      const uid = `VYR-${p1}-${p2}`;

      const userData = {
        id: 'USR_' + crypto.randomUUID().slice(0, 8).toUpperCase(),
        uid,
        name: name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        password, // Lưu trữ server-side
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}`,
        role: 'MEMBER',
      };

      await redis.set(`user:${normalizedEmail}`, userData);
      const { password: _, ...safeUser } = userData;
      return NextResponse.json({ success: true, user: safeUser });
    }

    // Fallback nếu chưa kết nối Redis
    const uid = `VYR-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const mockUser = {
      id: 'USR_' + crypto.randomUUID().slice(0, 8).toUpperCase(),
      uid,
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}`,
      role: 'MEMBER',
    };
    return NextResponse.json({ success: true, user: mockUser });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}