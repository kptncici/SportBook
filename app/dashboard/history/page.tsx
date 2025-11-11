"use client";

import { useEffect, useState, useMemo } from "react";

// ✅ Tipe data booking
type Booking = {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  status: string;
  checkedIn?: boolean;
  createdAt: string;
  field?: { name?: string; price?: number };
};

// ✅ Helper Format Rupiah
const formatRupiah = (num?: number) =>
  !num || isNaN(num) ? "Rp 0" : `Rp ${num.toLocaleString("id-ID")}`;

export default function UserHistoryPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Load data booking user
  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings/history", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal memuat riwayat");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error load history:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // 🔹 Batalkan booking
  async function handleCancel(id: string) {
    if (!confirm("Yakin ingin membatalkan booking ini?")) return;
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: "PATCH" });
      if (res.ok) {
        alert("✅ Booking berhasil dibatalkan");
        load();
      } else {
        const txt = await res.text();
        alert("❌ Tidak dapat membatalkan: " + txt);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat membatalkan booking");
    }
  }

  // 🔹 Bayar booking (Midtrans)
  async function handlePayment(id: string) {
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.open(data.paymentUrl, "_blank");
      } else {
        alert(data.error || "Gagal membuat pembayaran");
      }
    } catch (err) {
      console.error("❌ Payment error:", err);
      alert("Terjadi kesalahan saat membuat pembayaran");
    }
  }

  // 🔹 Hitung total semua booking user
  const total = useMemo(
    () => rows.reduce((a, b) => a + (b.field?.price ?? 0), 0),
    [rows]
  );

  return (
    <div className="min-h-screen body-sport p-6 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4">📅 Riwayat Booking Saya</h1>

        {/* 🔹 Tombol Export */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => window.open(`/api/bookings/export/excel`, "_blank")}
            className="btn-sport bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded text-white"
          >
            📗 Export Excel
          </button>
        </div>

        {/* 🔹 Tabel Data */}
        <div className="glass-card rounded-xl overflow-x-auto p-4">
          <table className="w-full text-sm text-white">
            <thead className="bg-white/10">
              <tr>
                <th className="p-2 text-left">Lapangan</th>
                <th className="p-2 text-left">Tanggal</th>
                <th className="p-2 text-left">Waktu</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-center">Invoice</th>
                <th className="p-2 text-center">Aksi</th>
                <th className="p-2 text-right">Harga</th>
              </tr>
            </thead>

            <tbody>
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-300 py-5">
                    Belum ada booking.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-5">
                    ⏳ Memuat data...
                  </td>
                </tr>
              )}

              {rows.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-white/10 hover:bg-white/5 transition"
                >
                  <td className="p-2">{b.field?.name ?? "-"}</td>
                  <td className="p-2">
                    {new Date(b.date).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-2">
                    {b.timeStart} - {b.timeEnd}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        b.status === "APPROVED"
                          ? "bg-green-500 text-black"
                          : b.status === "PENDING"
                          ? "bg-yellow-400 text-black"
                          : b.status === "PAID"
                          ? "bg-blue-500 text-white"
                          : b.status === "CANCELED"
                          ? "bg-gray-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>

                  {/* 🔹 Invoice */}
                  <td className="p-2 text-center">
                    {b.status === "APPROVED" || b.status === "PAID" ? (
                      <a
                        href={`/api/bookings/${b.id}/invoice`}
                        target="_blank"
                        className="text-blue-300 hover:underline"
                      >
                        Lihat
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* 🔹 Aksi */}
                  <td className="p-2 text-center">
                    {b.status === "APPROVED" && (
                      <button
                        onClick={() => handlePayment(b.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2 py-1 rounded mr-1"
                      >
                        Bayar
                      </button>
                    )}
                    {(b.status === "PENDING" || b.status === "APPROVED") &&
                      !b.checkedIn && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-2 py-1 rounded"
                        >
                          Batal
                        </button>
                      )}
                  </td>

                  {/* 🔹 Harga */}
                  <td className="p-2 text-right">
                    {formatRupiah(b.field?.price)}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* 🔹 Total */}
            {rows.length > 0 && (
              <tfoot>
                <tr className="font-semibold bg-white/10">
                  <td colSpan={6} className="p-2 text-right">
                    Total
                  </td>
                  <td className="p-2 text-right">{formatRupiah(total)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
