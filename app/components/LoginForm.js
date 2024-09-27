"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { signIn } from 'next-auth/react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, sendSignInLinkToEmail } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "@/app/lib/firebase";
import { useRouter } from 'next/navigation';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const { toast } = useToast();
  const recaptchaVerifierRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    auth.languageCode = "en";

    if (typeof window !== 'undefined' && !recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => { },
        }
      );
    }
  }, []);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/login?email=${email}`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      localStorage.setItem("emailForSignIn", email);
      toast({
        title: 'Success',
        description: 'Email link sent successfully. Please check your email.',
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while sending the login link. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 10-digit phone number.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const formattedPhoneNumber = `+91${phoneNumber}`;

      if (!recaptchaVerifierRef.current) {
        throw new Error('reCAPTCHA not yet loaded');
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        recaptchaVerifierRef.current
      );
      setConfirmationResult(confirmation);
      setStep('otp');
      toast({
        title: 'Success',
        description: 'OTP sent successfully!',
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: 'Error',
        description: 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.join('').length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit OTP.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otp.join(''));
      const user = userCredential.user;
      console.log('User authenticated with UID:', user.uid);

      // Sign in with NextAuth using credentials
      const result = await signIn("credentials", {
        phoneNumber: `+91${phoneNumber}`,
        uid: user.uid,
        type: "phone",
        callbackUrl: "/booking",
        redirect: false,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });

      // Redirect to the booking page
      router.push("/booking");
    } catch (error) {
      console.error('Phone login error:', error);
      toast({
        title: 'Error',
        description: 'Invalid OTP or login failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    } else if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOTP = [...otp];
      newOTP[index - 1] = '';
      setOtp(newOTP);
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="phone">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Login Link"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="phone">
            {step === 'phone' && (
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="tel"
                    placeholder="Enter your 10-digit number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    pattern="[0-9]{10}"
                    className="pl-12 pr-4 py-2 w-full"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500">
                    +91
                  </span>
                </div>
                <Button
                  onClick={handleSendOTP}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Get OTP"}
                </Button>
                <div id="recaptcha-container"></div>
              </div>
            )}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="flex justify-between">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center"
                      required
                    />
                  ))}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
