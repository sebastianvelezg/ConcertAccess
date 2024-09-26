"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ticketData } from "@/data/ticketData";

export default function StaffPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scannedTicket, setScannedTicket] = useState(null);

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

      scanner.render(onScanSuccess, onScanError);

      return () => {
        scanner.clear();
      };
    }
  }, [scanning]);

  if (!user || user.role !== "staff") {
    router.push("/login");
    return null;
  }

  const onScanSuccess = (decodedText) => {
    try {
      const ticketInfo = JSON.parse(decodedText);
      const validTicket = ticketData.find(
        (ticket) => ticket.id === ticketInfo.id
      );
      if (validTicket) {
        setScannedTicket(validTicket);
      } else {
        setScannedTicket({ error: "Invalid ticket" });
      }
    } catch (error) {
      setScannedTicket({ error: "Invalid QR code" });
    }
    setScanning(false);
  };

  const onScanError = (error) => {
    console.warn(error);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="p-6 max-w-md w-full bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-bold mb-4">Welcome, Staff {user.name}</h1>

        {!scanning && !scannedTicket && (
          <button
            onClick={() => setScanning(true)}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4"
          >
            Scan QR Code
          </button>
        )}

        {scanning && <div id="reader" className="mb-4"></div>}

        {scannedTicket && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Scanned Ticket Info</h2>
            {scannedTicket.error ? (
              <p className="text-red-500">{scannedTicket.error}</p>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <p>
                  <strong>Ticket ID:</strong> {scannedTicket.id}
                </p>
                <p>
                  <strong>Event:</strong> {scannedTicket.eventName}
                </p>
                <p>
                  <strong>Date:</strong> {scannedTicket.date}
                </p>
                <p>
                  <strong>Time:</strong> {scannedTicket.time}
                </p>
                <p>
                  <strong>Area:</strong> {scannedTicket.area}
                </p>
                <p>
                  <strong>Seat:</strong> {scannedTicket.seat}
                </p>
                <p>
                  <strong>Status:</strong> {scannedTicket.status}
                </p>
              </div>
            )}
            <button
              onClick={() => {
                setScannedTicket(null);
                setScanning(true);
              }}
              className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 mt-2"
            >
              Scan Another Ticket
            </button>
          </div>
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
