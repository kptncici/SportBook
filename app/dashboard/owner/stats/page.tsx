"use client";

import { useEffect, useState } from "react";

export default function OwnerStatsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/owner/stats")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("❌ Gagal ambil data statistik:", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-indigo-700">📊 Statistik Pemesanan</h1>
      {data ? (
        <pre className="mt-4 bg-gray-100 p-4 rounded-lg border">{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p className="text-gray-500 animate-pulse">Memuat statistik...</p>
      )}
    </div>
  );
}
