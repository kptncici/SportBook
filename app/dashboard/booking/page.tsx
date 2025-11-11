"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

type Field = { id: string; name: string; price: number };
const SLOTS = [
  { label: "08:00 - 09:00", start: "08:00", end: "09:00" },
  { label: "09:00 - 10:00", start: "09:00", end: "10:00" },
  { label: "14:00 - 15:00", start: "14:00", end: "15:00" },
  { label: "19:00 - 20:00", start: "19:00", end: "20:00" },
];

const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";

export default function BookingPage() {
  const { data: session } = useSession();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [fields, setFields] = useState<Field[]>([]);
  const [fieldId, setFieldId] = useState("");
  const [slot, setSlot] = useState("");
  const [avail, setAvail] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"MIDTRANS" | "CASH">("MIDTRANS");
  const [loading, setLoading] = useState(false);

  const selectedField = fields.find((f) => f.id === fieldId);
  const total = selectedField ? selectedField.price : 0;

  // 🔹 Load lapangan
  useEffect(() => {
    fetch("/api/fields")
      .then((res) => res.json())
      .then(setFields)
      .catch(console.error);
  }, []);

  // 🔹 Cek ketersediaan jadwal
  useEffect(() => {
    if (!fieldId) return;
    fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, fieldId }),
    })
      .then((res) => res.json())
      .then(setAvail)
      .catch(console.error);
  }, [date, fieldId]);

  // 🔹 Submit Booking
  async function submit() {
    if (!session) return alert("Harus login dulu!");
    if (!fieldId || !slot) return alert("Lengkapi form!");

    setLoading(true);

    try {
      const [timeStart, timeEnd] = slot.split("|");

      // ✅ Kirim userId dari session
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id, // 🟩 FIX UTAMA
          fieldId,
          date,
          timeStart,
          timeEnd,
          paymentMethod,
        }),
      });

      if (!bookingRes.ok) throw new Error("Gagal membuat booking");
      const booking = await bookingRes.json();

      // 🔹 Pembayaran MIDTRANS
      if (paymentMethod === "MIDTRANS") {
        const res = await fetch("/api/payment/snap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: booking.id }),
        });

        const data = await res.json();
        if (data?.token) {
          const script = document.createElement("script");
          script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
          script.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);
          document.body.appendChild(script);

          script.onload = () => {
            // @ts-ignore
            window.snap.pay(data.token, {
              onSuccess: () => alert("✅ Pembayaran berhasil!"),
              onPending: () => alert("🕒 Menunggu pembayaran..."),
              onError: () => alert("❌ Pembayaran gagal!"),
            });
          };
        } else {
          alert("Gagal memulai pembayaran Midtrans.");
        }
      } else {
        alert("✅ Booking berhasil! Silakan bayar di lokasi.");
      }
    } catch (err) {
      console.error("❌ Error saat booking:", err);
      alert("Terjadi kesalahan saat booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">📅 Booking Lapangan</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Form Booking */}
        <div className="bg-white p-5 rounded-xl border shadow">
          <label className="text-sm text-gray-600">Pilih Tanggal</label>
          <Input
            type="date"
            className="mt-1 mb-4"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label className="text-sm text-gray-600">Pilih Lapangan</label>
          <select
            className="w-full mt-1 mb-2 border rounded-md px-3 py-2"
            value={fieldId}
            onChange={(e) => setFieldId(e.target.value)}
          >
            <option value="">-- Pilih Lapangan --</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {selectedField && (
            <p className="text-sm text-gray-700 mb-3">
              💰 Harga:{" "}
              <span className="font-semibold text-green-700">
                Rp {selectedField.price.toLocaleString("id-ID")} / jam
              </span>
            </p>
          )}

          <label className="text-sm text-gray-600">Jam Booking</label>
          <select
            className="w-full mt-1 mb-4 border rounded-md px-3 py-2"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
          >
            <option value="">-- Pilih Jam --</option>
            {SLOTS.map((s) => (
              <option key={s.label} value={`${s.start}|${s.end}`}>
                {s.label}
              </option>
            ))}
          </select>

          <label className="text-sm text-gray-600">Metode Pembayaran</label>
          <select
            className="w-full mt-1 mb-4 border rounded-md px-3 py-2"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as "MIDTRANS" | "CASH")}
          >
            <option value="MIDTRANS">Transfer / QRIS (Midtrans)</option>
            <option value="CASH">Bayar di Tempat</option>
          </select>

          {selectedField && slot && (
            <div className="text-sm mb-4 text-gray-700">
              <p>
                🧾 Estimasi Total Pembayaran:{" "}
                <span className="font-semibold text-indigo-700">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </p>
            </div>
          )}

          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Konfirmasi Booking"}
          </Button>
        </div>

        {/* Jadwal Lapangan */}
        <div className="bg-white p-5 rounded-xl border shadow">
          <div className="font-semibold mb-3">🗓️ Jadwal Lapangan Hari Ini</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2">Jam</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {avail.length > 0 ? (
                avail.map((a) => (
                  <tr key={a.start} className="border-t">
                    <td className="py-2">{a.start}-{a.end}</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          a.status === "Tersedia"
                            ? "bg-green-100 text-green-700"
                            : a.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="py-3 text-gray-400 text-center">
                    Pilih lapangan untuk melihat jadwal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
