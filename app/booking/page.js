"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BookingForm from "@/app/components/BookingForm";
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function BookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Book Your Train</h1>
      <BookingForm />
    </div>
  );
}
