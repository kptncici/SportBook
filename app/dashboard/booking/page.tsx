"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

type Field = { id: string; name: string; price: number };

export default function BookingPage() {
  const { data: session } = useSession();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [fields, setFields] = useState<Field[]>([]);
  const [fieldId, setFieldId] = useState("");
  const [slot, setSlot] = useState("");
  const [avail, setAvail] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";

  const selectedField = fields.find((f) => f.id === fieldId);
  const total = selectedField ? selectedField.price : 0;

  /* ----------------------- LOAD FIELDS ----------------------- */
  useEffect(() => {
    fetch("/api/fields")
      .then((res) => res.json())
      .then(setFields)
      .catch(console.error);
  }, []);

  /* -------------------- LOAD AVAILABILITY -------------------- */
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

  /* ----------------------- SUBMIT BOOKING ----------------------- */
  async function submit() {
    if (!session) return alert("Harus login dulu!");
    if (!fieldId || !slot) return alert("Lengkapi form!");

    setLoading(true);

    try {
      const [timeStart, timeEnd] = slot.split("|");

      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          fieldId,
          date,
          timeStart,
          timeEnd,
          paymentMethod: "MIDTRANS",
        }),
      });

      if (!bookingRes.ok) throw new Error("Gagal membuat booking");
      const booking = await bookingRes.json();

      // Midtrans
      const snapRes = await fetch("/api/payment/snap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      const data = await snapRes.json();
      if (!data?.token) return alert("Gagal memulai pembayaran Midtrans.");

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
    } catch (error) {
      console.error("❌ Booking error:", error);
      alert("Terjadi kesalahan saat booking.");
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------- UI ------------------------------- */
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl md:text-2xl font-bold mb-4 text-blue-800">
        📅 Booking Lapangan
      </h1>

      {/* GRID RESPONSIVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FORM BOOKING */}
        <div className="bg-white p-5 rounded-xl border shadow space-y-4">

          {/* TANGGAL */}
          <div>
            <label className="text-sm text-gray-600">Pilih Tanggal</label>
            <Input
              type="date"
              className="mt-1"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* LAPANGAN */}
          <div>
            <label className="text-sm text-gray-600">Pilih Lapangan</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-3"
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
          </div>

          {/* HARGA */}
          {selectedField && (
            <p className="text-sm text-gray-700">
              💰 Harga:{" "}
              <span className="font-semibold text-green-700">
                Rp {selectedField.price.toLocaleString("id-ID")} / jam
              </span>
            </p>
          )}

          {/* SLOT */}
          <div>
            <label className="text-sm text-gray-600">Jam Booking</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-3"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
            >
              <option value="">-- Pilih Jam --</option>
              {avail.map((a) => (
                <option
                  key={a.start}
                  value={`${a.start}|${a.end}`}
                  disabled={a.status !== "Tersedia"}
                >
                  {a.label} — {a.status}
                </option>
              ))}
            </select>
          </div>

          {/* TOTAL */}
          {selectedField && slot && (
            <p className="text-sm">
              🧾 Estimasi Total:
              <span className="font-semibold text-indigo-700 ml-1">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </p>
          )}

          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 text-base"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Konfirmasi Booking"}
          </Button>
        </div>

        {/* JADWAL */}
        <div className="bg-white p-5 rounded-xl border shadow">
          <div className="font-semibold mb-3">🗓️ Jadwal Lapangan Hari Ini</div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-[350px] w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-100">
                  <th className="p-2">Jam</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {avail.length > 0 ? (
                  avail.map((a) => (
                    <tr key={a.start} className="border-t">
                      <td className="p-2">{a.label}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            a.status === "Tersedia"
                              ? "bg-green-100 text-green-700"
                              : a.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : a.status === "Lewat Waktu"
                              ? "bg-gray-200 text-gray-600"
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
    </div>
  );
}
