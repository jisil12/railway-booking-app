import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/firebase';
import { sendSignInLinkToEmail, PhoneAuthProvider } from 'firebase/auth';

export async function POST(request) {
  const body = await request.json();
  const { email, phone, type } = body;

  if (type === 'email') {
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    try {
      await sendSignInLinkToEmail(auth, email, {
        url: process.env.NEXTAUTH_URL,
        handleCodeInApp: true,
      });
      return NextResponse.json({ success: true, message: 'Email link sent successfully' });
    } catch (error) {
      console.error('Failed to send email link:', error);
      return NextResponse.json({ success: false, message: 'Failed to send email link' }, { status: 500 });
    }
  } else if (type === 'phone') {
    if (!phone) {
      return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 });
    }

    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(phone, window.recaptchaVerifier);
      return NextResponse.json({ success: true, message: 'OTP sent successfully', verificationId });
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, message: 'Invalid request type' }, { status: 400 });
}
