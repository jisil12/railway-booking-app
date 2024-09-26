"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function BookingCancelPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Booking Cancelled</h1>
      <p className="mb-6">Your booking has been cancelled. No payment has been processed.</p>
      <Button onClick={() => router.push('/booking')} className="w-full">
        Try Booking Again
      </Button>
    </div>
  );
}
