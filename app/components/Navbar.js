"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              Railway Booking
            </Link>
          </div>
          <div className="flex items-center">
            {status === "authenticated" ? (
              <>
                <span className="text-gray-700 mr-4">
                  Welcome, {session.user.email || session.user.phone}
                </span>
                <Link href="/booking">
                  <Button variant="outline" className="mr-2">Book a Train</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="mr-2">Profile</Button>
                </Link>
                <Link href="/bookings">
                  <Button variant="outline" className="mr-2">My Bookings</Button>
                </Link>
                <Button onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
