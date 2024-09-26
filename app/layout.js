import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/app/components/Navbar";
import AuthProvider from "@/app/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Railway Booking App",
  description: "Book your train tickets easily",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto mt-8">{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
