"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Transaction = {
  id: string;
  orderId: string;
  status: string;
  paymentType: string | null;
  grossAmount: number | null;
  bookingId?: string | null;
  updatedAt: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function fetchTransactions() {
    try {
      setLoading(true);
      const res = await fetch("/api/payment/midtrans/transactions");
      if (!res.ok) throw new Error("Gagal mengambil data transaksi");
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshTransaction(id: string) {
    try {
      const res = await fetch(`/api/admin/midtrans/transactions/${id}/refresh`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Gagal refresh status transaksi");
      await fetchTransactions();
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui status transaksi.");
    }
  }

  async function refreshAllTransactions() {
    try {
      if (!confirm("Yakin ingin sinkronisasi semua transaksi ke Midtrans?")) return;

      const res = await fetch(`/api/admin/midtrans/transactions/sync-all`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Gagal sinkronisasi semua transaksi");

      await fetchTransactions();
      alert("Semua transaksi berhasil disinkronisasi ✅");
    } catch (err) {
      console.error(err);
      alert("Gagal sinkronisasi semua transaksi ❌");
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const matchSearch = t.orderId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-blue-800">
            💳 Transaksi Midtrans
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Lihat semua transaksi dari pembayaran transfer & QRIS.
          </p>
        </div>

        <Button
          onClick={refreshAllTransactions}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          🔄 Sync Semua
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <input
          type="text"
          placeholder="🔍 Cari Order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-md w-full md:w-1/3 focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded-md w-full md:w-1/4 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Semua Status</option>
          <option value="settlement">Berhasil</option>
          <option value="pending">Pending</option>
          <option value="deny">Ditolak</option>
          <option value="cancel">Dibatalkan</option>
          <option value="expire">Kedaluwarsa</option>
        </select>
      </div>

      {/* TABLE RESPONSIVE */}
      <Card>
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <p className="text-gray-500 p-4">Memuat transaksi...</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-gray-500 text-center p-4">
              Belum ada transaksi ditemukan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[750px] w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-indigo-600 text-white text-left">
                    <th className="p-2">Order ID</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Payment</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Booking</th>
                    <th className="p-2">Updated</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-xs">{t.orderId}</td>
                      <td className="p-2">
                        Rp {t.grossAmount?.toLocaleString("id-ID") ?? 0}
                      </td>
                      <td className="p-2 capitalize">{t.paymentType ?? "-"}</td>

                      <td
                        className={`p-2 font-semibold ${
                          t.status === "settlement"
                            ? "text-green-600"
                            : t.status === "pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {t.status.toUpperCase()}
                      </td>

                      <td className="p-2 font-mono text-xs">
                        {t.bookingId ?? "-"}
                      </td>

                      <td className="p-2 text-xs">
                        {new Date(t.updatedAt).toLocaleString("id-ID")}
                      </td>

                      <td className="p-2 text-center">
                        <Button
                          className="text-xs px-2 py-1 md:text-sm md:px-3 border rounded-md hover:bg-indigo-600 hover:text-white transition"
                          onClick={() => refreshTransaction(t.id)}
                        >
                          🔄 Refresh
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
