"use client";

import { useAuth } from "@/components/AuthProvider";
import { ticketData } from "@/data/ticketData";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function UserPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user || user.role !== "user") {
    router.push("/login");
    return null;
  }

  const userTicket = ticketData.find((ticket) => ticket.userId === user.id);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    JSON.stringify(userTicket)
  )}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="p-6 max-w-md w-full bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>

        {userTicket ? (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Your Ticket</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p>
                <strong>Event:</strong> {userTicket.eventName}
              </p>
              <p>
                <strong>Date:</strong> {userTicket.date}
              </p>
              <p>
                <strong>Time:</strong> {userTicket.time}
              </p>
              <p>
                <strong>Area:</strong> {userTicket.area}
              </p>
              <p>
                <strong>Seat:</strong> {userTicket.seat}
              </p>
              <p>
                <strong>Price:</strong> ${userTicket.price.toFixed(2)}
              </p>
              <p>
                <strong>Status:</strong> {userTicket.status}
              </p>
            </div>
            <div className="mt-4 flex justify-center">
              <Image
                src={qrCodeUrl}
                alt="Ticket QR Code"
                width={150}
                height={150}
              />
            </div>
          </div>
        ) : (
          <p className="mb-4 text-red-500">No ticket found for this user.</p>
        )}

        <button
          onClick={logout}
          className="w-full bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
