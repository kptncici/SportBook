"use client";

import { useEffect, useState, useMemo } from "react";

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

const formatRupiah = (num?: number) =>
  !num || isNaN(num) ? "Rp 0" : `Rp ${num.toLocaleString("id-ID")}`;

export default function UserHistoryPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings/history", { cache: "no-store" });
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // 🔥 HANDLE PAYMENT
  async function handlePayment(id: string) {
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id }),
      });

      const data = await res.json();

      if (!data?.token) {
        alert("Gagal membuat pembayaran");
        console.error(data);
        return;
      }

      // 🔥 Midtrans Snap Popup
      (window as any).snap.pay(data.token, {
        onSuccess: function () {
          alert("Pembayaran berhasil");
          load();
        },
        onPending: function () {
          alert("Pembayaran pending");
          load();
        },
        onError: function () {
          alert("Pembayaran gagal");
        },
        onClose: function () {
          console.log("Popup ditutup");
        },
      });

    } catch (err) {
      console.error("Payment Error:", err);
      alert("Gagal memproses pembayaran");
    }
  }

  const total = useMemo(
    () => rows.reduce((a, b) => a + (b.field?.price ?? 0), 0),
    [rows]
  );

  return (
    <div className="min-h-screen p-6 text-white bg-gradient-to-b from-blue-900 to-blue-700">
      <div className="max-w-5xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold">📅 Riwayat Booking Saya</h1>

        <button
          onClick={() => window.open(`/api/bookings/export/excel`, "_blank")}
          className="bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded text-white"
        >
          📗 Export Excel
        </button>

        <div className="glass-card rounded-xl overflow-x-auto p-4">
          <table className="w-full text-sm text-white">

            <thead className="bg-white/10">
              <tr>
                <th className="p-2">Lapangan</th>
                <th className="p-2">Tanggal</th>
                <th className="p-2">Waktu</th>
                <th className="p-2">Status</th>
                <th className="p-2 text-center">Invoice</th>
                <th className="p-2 text-center">Aksi</th>
                <th className="p-2 text-right">Harga</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-gray-300">
                    ⏳ Memuat data...
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-gray-300">
                    Belum ada booking.
                  </td>
                </tr>
              )}

              {rows.map((b) => (
                <tr key={b.id} className="border-b border-white/10">
                  <td className="p-2">{b.field?.name ?? "-"}</td>
                  <td className="p-2">{new Date(b.date).toLocaleDateString("id-ID")}</td>
                  <td className="p-2">{b.timeStart} - {b.timeEnd}</td>

                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        b.status === "APPROVED"
                          ? "bg-green-500 text-black"
                          : b.status === "PENDING"
                          ? "bg-yellow-400 text-black"
                          : b.status === "PAID"
                          ? "bg-blue-500"
                          : b.status === "CANCELED"
                          ? "bg-gray-500"
                          : "bg-red-500"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>

                  <td className="p-2 text-center">
                    {b.status === "APPROVED" || b.status === "PAID" ? (
                      <a
                        href={`/api/bookings/${b.id}/invoice`}
                        target="_blank"
                        className="text-blue-300"
                      >
                        Lihat
                      </a>
                    ) : "-"}
                  </td>

                  <td className="p-2 text-center">
                    {b.status === "APPROVED" && (
                      <button
                        onClick={() => handlePayment(b.id)}
                        className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs text-white"
                      >
                        Bayar
                      </button>
                    )}
                  </td>

                  <td className="p-2 text-right">{formatRupiah(b.field?.price)}</td>
                </tr>
              ))}

            </tbody>

            {rows.length > 0 && (
              <tfoot>
                <tr className="bg-white/10 font-semibold">
                  <td colSpan={6} className="p-2 text-right">Total</td>
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
