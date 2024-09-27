"use client";

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import LoadingSpinner from '@/app/components/LoadingSpinner';
import BookingSuccessContent from './BookingSuccessContent';

export default function BookingSuccessPage() {
  const router = useRouter();
  const { status } = useSession();

  if (status === "unauthenticated") {
    router.push('/');
    return null;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BookingSuccessContent />
    </Suspense>
  );
}