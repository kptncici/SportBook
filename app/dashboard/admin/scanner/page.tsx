"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "@/lib/qr";

export default function AdminQRScannerPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [message, setMessage] = useState("Arahkan kamera ke QR...");
  const [lastScan, setLastScan] = useState("");

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      async (result) => {
        // ✅ normalize text (string only)
        const code = typeof result === "string" ? result : result.data;

        if (!code) return;
        if (code === lastScan) return; // jangan spam

        setLastScan(code);
        setMessage("✅ QR terbaca, cek booking...");

        try {
          const res = await fetch(`/api/bookings/${code}/checkin`, {
            method: "PATCH",
          });

          if (res.ok) {
            setMessage("✅ Check-in berhasil!");
          } else {
            setMessage("❌ QR tidak valid / belum approved!");
          }
        } catch {
          setMessage("⚠️ Error server");
        }
      },
      { returnDetailedScanResult: true }
    );

    scanner.start();

    return () => scanner.stop();
  }, [lastScan]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-2">Scan QR Booking</h1>
      <p className="text-gray-600">
        Gunakan kamera belakang untuk scan QR booking user
      </p>

      <video
        ref={videoRef}
        className="w-full rounded-lg border shadow"
        style={{ maxWidth: 420 }}
      />

      <div className="px-4 py-2 bg-gray-100 rounded-md border text-sm">
        {message}
      </div>
    </div>
  );
}
