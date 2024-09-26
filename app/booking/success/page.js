"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/app/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function BookingSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookingDoc = await getDoc(doc(db, 'bookings', orderId));
        if (bookingDoc.exists()) {
          setBooking({ id: bookingDoc.id, ...bookingDoc.data() });
        } else {
          throw new Error('Booking not found');
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
        toast({
          title: "Error",
          description: "Failed to fetch booking details",
          variant: "destructive",
        });
        router.push('/booking');
      } finally {
        setLoading(false);
      }
    };

    if (status === "unauthenticated") {
      router.push('/');
    } else if (status === "authenticated" && orderId) {
      fetchBooking();
    }
  }, [status, orderId, router, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="mt-2">Fetching booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return <div>Booking not found</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-6 text-center text-green-600">Booking Confirmed</h1>
        <div className="mb-8 bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <h2 className="text-2xl font-semibold mb-4 text-green-700">Booking Details</h2>
          <div className="grid grid-cols-2 gap-4 text-lg">
            <p><span className="font-semibold">Booking ID:</span> {booking.id}</p>
            <p><span className="font-semibold">Train ID:</span> {booking.trainId}</p>
            <p><span className="font-semibold">Class:</span> {booking.class}</p>
            <p><span className="font-semibold">Fare:</span> ₹{booking.fare}</p>
            <p><span className="font-semibold">Number of Passengers:</span> {booking.passengers.length}</p>
            <p><span className="font-semibold">Total Amount:</span> ₹{booking.totalAmount}</p>
            <p><span className="font-semibold">Payment Method:</span> {booking.paymentMethod}</p>
            <p><span className="font-semibold">Status:</span> <span className="text-green-600 font-bold">{booking.status}</span></p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl mb-4">Thank you for choosing our service!</p>
          <Button onClick={() => router.push('/booking')} className="w-full max-w-md text-lg py-3">
            Book Another Train
          </Button>
        </div>
      </div>
    </div>
  );
}
