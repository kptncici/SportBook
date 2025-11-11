"use client";

import { useEffect, useState } from "react";

export default function OwnerSummaryPage() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/owner/summary")
      .then((res) => res.json())
      .then(setSummary)
      .catch((err) => console.error("❌ Gagal ambil data summary:", err));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-indigo-700">📈 Ringkasan Bulanan</h1>
      {summary ? (
        <div className="bg-white p-4 rounded-lg border shadow-sm space-y-2">
          <p>Total Booking: <strong>{summary.totalBookings ?? 0}</strong></p>
          <p>Pendapatan Bulan Ini: <strong>Rp {summary.totalRevenue?.toLocaleString("id-ID") ?? 0}</strong></p>
        </div>
      ) : (
        <p className="text-gray-500 animate-pulse">Memuat ringkasan...</p>
      )}
    </div>
  );
}
