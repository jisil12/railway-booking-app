import LoginClient from "@/app/components/LoginClient";
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl p-8">
        <div className="flex items-center justify-center mb-8">
          <Image src="/train-icon.jpg" alt="Train Icon" width={60} height={60} />
          <h1 className="text-5xl font-bold text-center ml-4 text-gray-800">Railway Booking App</h1>
        </div>
        <p className="text-xl text-center text-gray-600 mb-8">Your journey begins here. Book your train tickets with ease and comfort.</p>
        <LoginClient />
      </div>
    </div>
  );
}
