"use client";

import { useEffect, useState } from "react";

export default function OwnerTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/owner/transactions");
      const data = await res.json();

      // ✅ pastikan data selalu array
      if (Array.isArray(data)) {
        setTransactions(data);
      } else if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      } else {
        setTransactions([]); // fallback empty array
        console.warn("Unexpected transactions data:", data);
      }
    } catch (err) {
      console.error("❌ Gagal mengambil transaksi:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return <p className="p-6 text-gray-500 animate-pulse">⏳ Memuat data transaksi...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-800 mb-4">💳 Transaksi</h1>

      {transactions.length === 0 ? (
        <p className="text-gray-400">Belum ada transaksi bulan ini.</p>
      ) : (
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="py-2 px-4 text-left">ID Transaksi</th>
              <th className="py-2 px-4 text-left">Tanggal</th>
              <th className="py-2 px-4 text-left">Nominal</th>
              <th className="py-2 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((trx) => (
              <tr key={trx.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{trx.id}</td>
                <td className="py-2 px-4">
                  {new Date(trx.updatedAt).toLocaleDateString("id-ID")}
                </td>
                <td className="py-2 px-4">Rp {trx.grossAmount?.toLocaleString("id-ID")}</td>
                <td className="py-2 px-4 capitalize">{trx.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
