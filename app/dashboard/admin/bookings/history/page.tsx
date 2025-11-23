"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Booking = {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";
  checkedIn?: boolean;
  createdAt: string;
  user?: { name?: string; email?: string };
  field?: { name?: string; location?: string; price?: number };
};

export default function AdminBookingHistoryPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const lastCount = useRef(0);

  // 🔹 Load booking data
  async function load() {
    try {
      setLoading(true);
      const qs = new URLSearchParams();
      if (search) qs.set("search", search);
      if (status) qs.set("status", status);
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);

      const res = await fetch(`/api/bookings/all?${qs.toString()}`, { cache: "no-store" });
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
      setLoading(false);

      // 🔔 Notifikasi booking baru
      if (lastCount.current && data.length > lastCount.current) {
        alert(`🔔 Ada ${data.length - lastCount.current} booking baru!`);
      }
      lastCount.current = data.length;
    } catch (error) {
      console.error("Gagal memuat data:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // polling otomatis tiap 10 detik
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔹 Apply filter
  function onApplyFilters(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  // 🔹 Export CSV
  function exportCSV() {
    if (rows.length === 0) {
      alert("Tidak ada data untuk diexport!");
      return;
    }

    const header = ["User", "Email", "Lapangan", "Tanggal", "Waktu", "Status", "Check-in", "Harga"];
    const lines = [header.join(",")];

    rows.forEach((b) => {
      lines.push([
        b.user?.name ?? "-",
        b.user?.email ?? "-",
        b.field?.name ?? "-",
        new Date(b.date).toLocaleDateString("id-ID"),
        `${b.timeStart}-${b.timeEnd}`,
        b.status,
        b.checkedIn ? "Sudah" : "Belum",
        `Rp ${(b.field?.price ?? 0).toLocaleString("id-ID")}`,
      ].join(","));
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riwayat-booking-${from || "all"}-${to || "now"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 🔹 Tandai check-in
  async function markCheckIn(id: string) {
    if (!confirm("Tandai sudah hadir?")) return;
    const res = await fetch(`/api/bookings/${id}/checkin`, { method: "PATCH" });
    if (res.ok) {
      await load();
      alert("✅ Check-in berhasil!");
    } else {
      alert("❌ Gagal melakukan check-in!");
    }
  }

  // 🔹 Hitung total
  const total = useMemo(() => rows.reduce((sum, b) => sum + (b.field?.price ?? 0), 0), [rows]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold">📊 Riwayat Booking Semua User</h1>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            📤 Export CSV
          </button>
        </div>
      </div>

      {/* Filter */}
      <form
        onSubmit={onApplyFilters}
        className="bg-white border rounded-lg p-4 grid md:grid-cols-5 gap-3"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama/email/lapangan"
          className="border rounded px-3 py-2"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Semua Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELED">Canceled</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="px-3 py-2 rounded bg-gray-900 text-white hover:bg-gray-800"
        >
          Terapkan
        </button>
      </form>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Lapangan</th>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Waktu</th>
              <th className="p-3">Status</th>
              <th className="p-3">Check-in</th>
              <th className="p-3">Invoice</th>
              <th className="p-3 text-right">Harga</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500">
                  Tidak ada data.
                </td>
              </tr>
            )}
            {rows.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{b.user?.name ?? "-"}</td>
                <td className="p-3">{b.user?.email ?? "-"}</td>
                <td className="p-3">{b.field?.name ?? "-"}</td>
                <td className="p-3">{new Date(b.date).toLocaleDateString("id-ID")}</td>
                <td className="p-3">{b.timeStart} - {b.timeEnd}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                      b.status === "APPROVED"
                        ? "bg-green-600"
                        : b.status === "REJECTED"
                        ? "bg-red-600"
                        : b.status === "CANCELED"
                        ? "bg-gray-500"
                        : "bg-yellow-600"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="p-3">
                  {b.checkedIn ? (
                    <span className="text-green-700 font-semibold">Sudah</span>
                  ) : (
                    <button
                      onClick={() => markCheckIn(b.id)}
                      className="px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-xs"
                    >
                      Check-in
                    </button>
                  )}
                </td>
                <td className="p-3">
                  <a
                    href={`/api/bookings/${b.id}/invoice`}
                    target="_blank"
                    className="text-blue-600 hover:underline text-xs"
                  >
                    PDF
                  </a>
                </td>
                <td className="p-3 text-right">
                  Rp {(b.field?.price ?? 0).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-indigo-50 font-semibold">
                <td className="p-3" colSpan={8}>Total</td>
                <td className="p-3 text-right">Rp {total.toLocaleString("id-ID")}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
