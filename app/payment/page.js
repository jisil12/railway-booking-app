"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/app/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import LoadingSpinner from '@/app/components/LoadingSpinner';

function PaymentPageContent() {
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const trainId = searchParams.get('trainId');
  const selectedClass = searchParams.get('class');
  const selectedFare = searchParams.get('fare');
  const passengers = JSON.parse(searchParams.get('passengers') || '[]');
  const totalAmount = parseInt(selectedFare) * passengers.length;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  // Function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add booking to Firestore
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        userId: session.user.id,
        trainId,
        class: selectedClass,
        fare: selectedFare,
        passengers,
        totalAmount,
        paymentMethod,
        status: 'confirmed',
        createdAt: new Date(),
      });

      toast({
        title: "Payment Successful",
        description: "Your booking has been confirmed.",
        variant: "success",
      });

      router.push(`/booking/success?order_id=${bookingRef.id}`);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">Payment</h1>
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Booking Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-lg">
          <p><span className="font-semibold">Train ID:</span> {trainId}</p>
          <p><span className="font-semibold">Class:</span> {selectedClass}</p>
          <p><span className="font-semibold">Fare per passenger:</span> {formatCurrency(parseInt(selectedFare))}</p>
          <p><span className="font-semibold">Number of Passengers:</span> {passengers.length}</p>
          <p className="col-span-2 text-xl font-bold text-blue-600">
            Total Amount: {formatCurrency(totalAmount)} ({formatCurrency(parseInt(selectedFare))} x {passengers.length})
          </p>
        </div>
      </div>
      <form onSubmit={handlePayment} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
        <div>
          <Label htmlFor="paymentMethod" className="text-lg">Payment Method</Label>
          <Select onValueChange={setPaymentMethod} required>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="debit_card">Debit Card</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber" className="text-lg">Card Number</Label>
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
                className="mt-1"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate" className="text-lg">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cvv" className="text-lg">CVV</Label>
                <Input
                  id="cvv"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="123"
                />
              </div>
            </div>
          </div>
        )}
        {paymentMethod === 'upi' && (
          <div>
            <Label htmlFor="upiId" className="text-lg">UPI ID</Label>
            <Input
              id="upiId"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              required
              className="mt-1"
              placeholder="yourname@upi"
            />
          </div>
        )}
        <Button type="submit" className="w-full text-lg py-3" disabled={loading}>
          {loading ? "Processing..." : `Pay ${formatCurrency(totalAmount)}`}
        </Button>
      </form>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PaymentPageContent />
    </Suspense>
  );
}
