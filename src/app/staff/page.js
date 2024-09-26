"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ticketData } from "@/data/ticketData";
import {
  LogOut,
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  List,
  User,
} from "lucide-react";

export default function StaffPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scannedTicket, setScannedTicket] = useState(null);
  const [scannedTicketsList, setScannedTicketsList] = useState([]);

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });
      scanner.render(onScanSuccess, onScanError);
      return () => scanner.clear();
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
        setScannedTicketsList((prevList) => [...prevList, validTicket]);
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

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <style jsx global>{`
        #reader {
          position: relative;
          padding: 0px !important;
          border: none !important;
        }
        #reader__scan_region {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
        }
        #reader__scan_region img {
          opacity: 0.8;
          filter: invert(1);
        }
        #reader__dashboard {
          margin-top: 1rem;
        }
        #reader__dashboard_section_csr button {
          color: white !important;
          background-color: #4b5563 !important;
          border-radius: 0.375rem;
          padding: 0.5rem 1rem;
          font-weight: 600;
          transition: background-color 0.2s;
        }
        #reader__dashboard_section_csr button:hover {
          background-color: #374151 !important;
        }
        #reader__dashboard_section_swaplink {
          display: none !important;
        }
        #reader__status_span {
          color: white !important;
        }
        #reader__header_message {
          display: none !important;
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 shadow-2xl rounded-lg overflow-hidden border border-gray-700">
          {/* Improved Header */}
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
          <main className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-200 flex items-center justify-center">
              <QrCode size={28} className="mr-2" />
              Ticket Scanner
            </h1>

            {/* Scanning Area */}
            {!scanning && !scannedTicket && (
              <div className="border-4 border-dashed border-gray-600 rounded-lg p-6 mb-6 text-center">
                <p className="text-gray-400 mb-4">Ready to scan tickets</p>
                <button
                  onClick={() => setScanning(true)}
                  className="bg-gray-700 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center mx-auto"
                >
                  <Camera size={24} className="mr-2" />
                  Start Scanning
                </button>
              </div>
            )}

            {scanning && (
              <div
                id="reader"
                className="mb-6 border-4 border-gray-600 rounded-lg overflow-hidden"
              ></div>
            )}

            {/* Ticket Info */}
            {scannedTicket && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-200 flex items-center">
                  <List size={24} className="mr-2" />
                  Ticket Information
                </h2>
                {scannedTicket.error ? (
                  <div
                    className="bg-red-900 border-l-4 border-red-500 text-red-200 p-4 rounded-lg flex items-start"
                    role="alert"
                  >
                    <XCircle size={24} className="mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Error</p>
                      <p>{scannedTicket.error}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div
                      className={`p-4 mb-4 rounded-lg flex items-start ${
                        scannedTicket.status === "valid"
                          ? "bg-green-900 text-green-200"
                          : "bg-red-900 text-red-200"
                      }`}
                    >
                      {scannedTicket.status === "valid" ? (
                        <CheckCircle size={24} className="mr-2 flex-shrink-0" />
                      ) : (
                        <XCircle size={24} className="mr-2 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-bold">
                          {scannedTicket.status === "valid"
                            ? "Valid Ticket"
                            : "Invalid Ticket"}
                        </p>
                        <p>
                          {scannedTicket.status === "valid"
                            ? "This ticket is authentic and can be accepted."
                            : "This ticket appears to be fake or has been tampered with."}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
                      <p>
                        <strong className="text-gray-200">Ticket ID:</strong>{" "}
                        {scannedTicket.id}
                      </p>
                      <p>
                        <strong className="text-gray-200">Event:</strong>{" "}
                        {scannedTicket.eventName}
                      </p>
                      <p>
                        <strong className="text-gray-200">Date:</strong>{" "}
                        {scannedTicket.date}
                      </p>
                      <p>
                        <strong className="text-gray-200">Time:</strong>{" "}
                        {scannedTicket.time}
                      </p>
                      <p>
                        <strong className="text-gray-200">Area:</strong>{" "}
                        {scannedTicket.area}
                      </p>
                      <p>
                        <strong className="text-gray-200">Seat:</strong>{" "}
                        {scannedTicket.seat}
                      </p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    setScannedTicket(null);
                    setScanning(true);
                  }}
                  className="w-full bg-gray-700 text-white p-3 rounded-lg text-lg font-semibold hover:bg-gray-600 transition-colors mt-4 flex items-center justify-center"
                >
                  <Camera size={24} className="mr-2" />
                  Scan Another Ticket
                </button>
              </div>
            )}

            {/* Scanned Tickets List */}
            {scannedTicketsList.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-200 flex items-center">
                  <List size={24} className="mr-2" />
                  Scanned Tickets
                </h2>
                <div className="bg-gray-700 p-4 rounded-lg space-y-4">
                  {scannedTicketsList.map((ticket, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg flex items-start ${
                        ticket.status === "valid"
                          ? "bg-green-900 text-green-200"
                          : "bg-red-900 text-red-200"
                      }`}
                    >
                      {ticket.status === "valid" ? (
                        <CheckCircle size={24} className="mr-2 flex-shrink-0" />
                      ) : (
                        <XCircle size={24} className="mr-2 flex-shrink-0" />
                      )}
                      <div>
                        <p>
                          <strong>Ticket ID:</strong> {ticket.id} -{" "}
                          {ticket.status === "valid" ? "Valid" : "Invalid"}
                        </p>
                        <p>
                          <strong>Event:</strong> {ticket.eventName}
                        </p>
                        <p>
                          <strong>Date:</strong> {ticket.date}
                        </p>
                        <p>
                          <strong>Area:</strong> {ticket.area}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
