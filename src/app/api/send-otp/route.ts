import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, otp, name } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: 'Missing email or OTP code.' }, { status: 400 });
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.error('Missing EMAIL_USER or EMAIL_PASS environment variables.');
      return NextResponse.json({ 
        success: false, 
        error: 'Chưa cấu hình EMAIL_USER và EMAIL_PASS trên máy chủ (.env.local hoặc Vercel).' 
      }, { status: 500 });
    }

    // Cấu hình SMTP Gmail của Google
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090D16; color: #FFFFFF; margin: 0; padding: 20px; }
          .container { max-width: 520px; margin: 0 auto; background-color: #121826; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px; padding: 32px; box-shadow: 0 0 25px rgba(59, 130, 246, 0.15); }
          .header { text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 20px; margin-bottom: 24px; }
          .brand { font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #38BDF8; margin: 0; }
          .sub { font-size: 11px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
          .otp-box { background-color: #090D16; border: 1px dashed #3B82F6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #38BDF8; margin: 0; }
          .text { font-size: 13px; line-height: 1.6; color: #94A3B8; margin-bottom: 16px; }
          .footer { font-size: 11px; color: #64748B; text-align: center; margin-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand">VYRITH STUDIO</h1>
            <div class="sub">Security Terminal Verification</div>
          </div>
          <p class="text">Hello <strong>${name || 'Developer'}</strong>,</p>
          <p class="text">You have requested a verification OTP on <strong>Vyrith Studio (vyrithstudio.id.vn)</strong>. Use the security code below to proceed:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          
          <p class="text">This verification code is valid for <strong>5 minutes</strong>. Never share this code with anyone.</p>
          
          <div class="footer">
            &copy; 2026 Vyrith Studio. Core Systems & Next-Gen Game Hub.<br>
            Automated security dispatch via Google Mail.
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Vyrith Studio" <${emailUser}>`,
      to: email,
      subject: `[Vyrith Studio] ${otp} is your verification code`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, message: 'OTP sent successfully via Gmail' });
  } catch (error: any) {
    console.error('Gmail SMTP Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to dispatch email' }, { status: 500 });
  }
}