"use client";

import { useEffect, useState } from "react";

export default function OwnerRevenuePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/owner/revenue")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("❌ Gagal ambil data revenue:", err));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-indigo-700">💰 Laporan Pendapatan</h1>
      {data ? (
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p>Total Pendapatan: <strong>Rp {data.total?.toLocaleString("id-ID") ?? 0}</strong></p>
        </div>
      ) : (
        <p className="text-gray-500 animate-pulse">Memuat data...</p>
      )}
    </div>
  );
}
