"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import PassengerForm from '@/app/components/PassengerForm';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/app/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function BookingPage({ params }) {
  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passengers, setPassengers] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const trainId = params.id;
  const selectedClass = searchParams.get('class');
  const selectedFare = searchParams.get('fare');

  useEffect(() => {
    const fetchTrain = async () => {
      try {
        const trainDoc = await getDoc(doc(db, 'trains', trainId));
        if (trainDoc.exists()) {
          setTrain({ id: trainDoc.id, ...trainDoc.data() });
        } else {
          toast({
            title: "Error",
            description: "Train not found",
            variant: "destructive",
          });
          router.push('/booking');
        }
      } catch (error) {
        console.error("Error fetching train:", error);
        toast({
          title: "Error",
          description: "Failed to fetch train details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === "unauthenticated") {
      router.push('/');
    } else if (status === "authenticated") {
      fetchTrain();
    }
  }, [trainId, status, router, toast]);

  const handlePassengerSubmit = (passengerData) => {
    setPassengers(passengerData);
    router.push(`/payment?trainId=${trainId}&class=${selectedClass}&fare=${selectedFare}&passengers=${JSON.stringify(passengerData)}`);
  };

  if (status === "loading" || loading) {
    return <LoadingSpinner />;
  }

  if (!train) {
    return <div>Train not found</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Book Your Train</h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">{train.name} ({train.id})</h2>
        <p>From: {train.source} - To: {train.destination}</p>
        <p>Departure: {train.departure_time} - Arrival: {train.arrival_time}</p>
        <p>Selected Class: {selectedClass}</p>
        <p>Fare: ₹{selectedFare}</p>
      </div>
      <PassengerForm onSubmit={handlePassengerSubmit} />
    </div>
  );
}
