"use client";

import { useAuth } from "@/components/AuthProvider";
import { ticketData } from "@/data/ticketData";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  AlertCircle,
  User,
} from "lucide-react";

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

  const isTicketValid = userTicket && userTicket.status === "valid";

  return (
    <div className="min-h-screen bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 shadow-2xl rounded-lg overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="px-6 py-4 bg-gray-800 text-white flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-700 rounded-full">
                <User size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-sm text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-200 flex items-center">
              <Ticket className="mr-2" size={24} />
              Your Ticket
            </h2>

            {userTicket ? (
              <div className="space-y-6">
                <div
                  className={`bg-gray-700 p-4 rounded-lg space-y-3 ${
                    !isTicketValid
                      ? "border-2 border-red-500"
                      : "border-2 border-green-500"
                  }`}
                >
                  {/* Ticket details */}
                  {[
                    {
                      icon: Calendar,
                      label: "Event",
                      value: userTicket.eventName,
                    },
                    { icon: Calendar, label: "Date", value: userTicket.date },
                    { icon: Clock, label: "Time", value: userTicket.time },
                    { icon: MapPin, label: "Area", value: userTicket.area },
                    { icon: MapPin, label: "Seat", value: userTicket.seat },
                    {
                      icon: CreditCard,
                      label: "Price",
                      value: `$${userTicket.price.toFixed(2)}`,
                    },
                    {
                      icon: AlertCircle,
                      label: "Status",
                      value: userTicket.status,
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <p
                      key={label}
                      className={`flex items-center ${
                        !isTicketValid ? "text-gray-400" : "text-gray-300"
                      }`}
                    >
                      <Icon
                        className={`mr-2 ${
                          !isTicketValid ? "text-gray-400" : "text-gray-400"
                        }`}
                        size={18}
                      />
                      <strong
                        className={`mr-2 ${
                          !isTicketValid ? "text-gray-300" : "text-gray-200"
                        }`}
                      >
                        {label}:
                      </strong>
                      <span
                        className={
                          label === "Status"
                            ? isTicketValid
                              ? "text-green-400"
                              : "text-red-400"
                            : ""
                        }
                      >
                        {value}
                      </span>
                    </p>
                  ))}
                </div>
                <div className="flex justify-center bg-white p-4 rounded-lg w-fit mx-auto">
                  <Image
                    src={qrCodeUrl}
                    alt="Ticket QR Code"
                    width={150}
                    height={150}
                  />
                </div>
              </div>
            ) : (
              <p className="mb-4 text-red-400 flex items-center">
                <AlertCircle className="mr-2" size={18} />
                No ticket found for this user.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
