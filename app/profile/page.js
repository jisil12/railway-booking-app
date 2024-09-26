"use client";

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/app/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    address: '',
    phoneNumber: '',
  });
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.id) {
        try {
          const userDoc = await getDoc(doc(db, 'users', session.user.id));
          if (userDoc.exists()) {
            setProfile(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast({
            title: "Error",
            description: "Failed to fetch profile details",
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
      fetchProfile();
    }
  }, [session, status, router, toast]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', session.user.id), profile);
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
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
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-700">Your Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-lg">Name</Label>
              <Input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
                className="mt-1"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber" className="text-lg">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                required
                className="mt-1"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address" className="text-lg">Address</Label>
            <Input
              id="address"
              name="address"
              value={profile.address}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="Enter your address"
            />
          </div>
          <Button type="submit" className="w-full text-lg py-3">
            Update Profile
          </Button>
        </form>
      </div>
    </div>
  );
}
