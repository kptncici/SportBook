"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type Booking = {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  status: string;
  checkedIn?: boolean;
  createdAt: string;
  user?: { name?: string; email?: string };
  field?: { name?: string; price?: number };
};

// ✅ Helper format Rupiah agar tidak error walau undefined/null
const formatRupiah = (num?: number) => {
  if (!num || isNaN(num)) return "Rp 0";
  return `Rp ${num.toLocaleString("id-ID")}`;
};

// ✅ Helper warna status
const statusClass = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "APPROVED":
      return "bg-green-100 text-green-700";
    case "PAID":
      return "bg-blue-100 text-blue-700";
    case "CANCELED":
      return "bg-gray-200 text-gray-600";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

export default function AdminBookingHistoryPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // ✅ Load data
  async function load() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (search) qs.set("search", search);
      if (status && status !== "ALL") qs.set("status", status);
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);

      const res = await fetch(`/api/bookings/all?${qs.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("❌ Gagal memuat data:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ✅ Total harga semua data
  const total = useMemo(() => {
    return rows.reduce((sum, b) => sum + (b.field?.price ?? 0), 0);
  }, [rows]);

  // ✅ Export Excel (.xlsx)
  function exportExcel() {
    if (rows.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    const data = rows.map((b) => ({
      "Nama User": b.user?.name ?? "-",
      Email: b.user?.email ?? "-",
      Lapangan: b.field?.name ?? "-",
      Tanggal: new Date(b.date).toLocaleDateString("id-ID"),
      Waktu: `${b.timeStart} - ${b.timeEnd}`,
      Status: b.status,
      Harga: b.field?.price ?? 0,
      "Sudah Check-in": b.checkedIn ? "Ya" : "Belum",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Riwayat Booking");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `Riwayat-Booking-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    saveAs(blob, fileName);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <h1 className="text-2xl font-bold">📊 Riwayat Booking Semua User</h1>
        <button
          onClick={exportExcel}
          className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-medium"
        >
          📤 Export Excel
        </button>
      </div>

      {/* 🔍 Filter */}
      <div className="bg-white border rounded-lg p-4 grid md:grid-cols-5 gap-3">
        <input
          placeholder="Cari nama/email/lapangan"
          className="border rounded px-3 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">Semua Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="PAID">Paid</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELED">Canceled</option>
        </select>
        <input
          type="date"
          className="border rounded px-3 py-2"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-3 py-2"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <button
          onClick={load}
          className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded font-medium"
        >
          Terapkan
        </button>
      </div>

      {/* 📋 Tabel */}
      <div className="bg-white border rounded-lg overflow-x-auto shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr className="text-left">
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Lapangan</th>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Waktu</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Harga</th>
            </tr>
          </thead>

          <tbody>
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Tidak ada data.
                </td>
              </tr>
            )}

            {rows.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{b.user?.name ?? "-"}</td>
                <td className="p-3">{b.user?.email ?? "-"}</td>
                <td className="p-3">{b.field?.name ?? "-"}</td>
                <td className="p-3">
                  {new Date(b.date).toLocaleDateString("id-ID")}
                </td>
                <td className="p-3">
                  {b.timeStart} - {b.timeEnd}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${statusClass(
                      b.status
                    )}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="p-3 text-right">{formatRupiah(b.field?.price)}</td>
              </tr>
            ))}
          </tbody>

          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-indigo-50 font-semibold">
                <td colSpan={6} className="p-3 text-right">
                  Total
                </td>
                <td className="p-3 text-right">{formatRupiah(total)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
