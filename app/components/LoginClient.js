"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import LoginForm from "@/app/components/LoginForm";
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function LoginClient() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleEmailSignIn = async () => {
      const apiKey = searchParams.get("apiKey");
      const oobCode = searchParams.get("oobCode");
      const mode = searchParams.get("mode");

      if (apiKey && oobCode && mode === "signIn") {
        const email = localStorage.getItem("emailForSignIn");
        if (email) {
          try {
            const result = await signIn("credentials", {
              apiKey,
              oobCode,
              email,
              type: "email",
              callbackUrl: "/booking",
              redirect: false,
            });
            if (result.error) {
              console.error("Error signing in with email link:", result.error);
            } else if (result.ok) {
              localStorage.removeItem("emailForSignIn");
              router.push("/booking");
            }
          } catch (error) {
            console.error("Error signing in with email link:", error);
          }
        } else {
          console.error("No email found for sign in");
        }
      }
    };

    handleEmailSignIn();
  }, [searchParams, router]);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/booking");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  return <LoginForm />;
}
