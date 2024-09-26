"use client";

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CancelBookingModal from '@/app/components/CancelBookingModal';

export default function BookingsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      if (session?.user?.id) {
        try {
          const q = query(collection(db, 'bookings'), where("userId", "==", session.user.id));
          const querySnapshot = await getDocs(q);
          const bookingsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setBookings(bookingsData);
        } catch (error) {
          console.error("Error fetching bookings:", error);
          toast({
            title: "Error",
            description: "Failed to fetch booking history",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    if (status === "unauthenticated") {
      router.push('/');
    } else if (status === "authenticated") {
      fetchBookings();
    }
  }, [session, status, router, toast]);

  const handleCancelBooking = (bookingId) => {
    setSelectedBookingId(bookingId);
    setCancelModalOpen(true);
  };

  const confirmCancelBooking = async (bookingId) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled'
      });

      setBookings(bookings.map(booking => 
        booking.id === bookingId ? {...booking, status: 'cancelled'} : booking
      ));

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully. Refund will be processed within 5-7 working days.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelModalOpen(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">Your Booking History</h1>
      {bookings.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-xl text-gray-600">You have no bookings yet.</p>
          <Button onClick={() => router.push('/booking')} className="mt-4 text-lg py-2 px-4">
            Book a Train
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Booking ID: {booking.id}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 text-lg">
                  <p><span className="font-semibold">Train ID:</span> {booking.trainId}</p>
                  <p><span className="font-semibold">Class:</span> {booking.class}</p>
                  <p><span className="font-semibold">Fare:</span> ₹{booking.fare}</p>
                  <p><span className="font-semibold">Total Amount:</span> ₹{booking.totalAmount}</p>
                  <p><span className="font-semibold">Status:</span> <span className={`font-bold ${booking.status === 'confirmed' ? 'text-green-600' : 'text-red-600'}`}>{booking.status}</span></p>
                  <p><span className="font-semibold">Booked on:</span> {booking.createdAt.toDate().toLocaleString()}</p>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 rounded-b-lg">
                {booking.status !== 'cancelled' && (
                  <Button variant="destructive" onClick={() => handleCancelBooking(booking.id)} className="w-full text-lg py-2">
                    Cancel Booking
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <CancelBookingModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={confirmCancelBooking}
        bookingId={selectedBookingId}
      />
    </div>
  );
}
