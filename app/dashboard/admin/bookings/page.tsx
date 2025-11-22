"use client";

import { useEffect, useMemo, useState } from "react";

type Booking = {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user?: { name?: string; email?: string };
  field?: { name?: string; price?: number };
};

export default function AdminApprovalPage() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Load data
  async function load() {
    try {
      setLoading(true);
      const qs = new URLSearchParams();
      if (search) qs.set("search", search);
      if (status !== "ALL") qs.set("status", status);
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);

      const res = await fetch(`/api/bookings?${qs.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Filter submit
  function onApplyFilters(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  // Approve / Reject
  async function handleAction(id: string, action: "approve" | "reject") {
    const confirmMsg =
      action === "approve"
        ? "Yakin ingin menyetujui booking ini?"
        : "Yakin ingin menolak booking ini?";

    if (!confirm(confirmMsg)) return;

    const res = await fetch(`/api/bookings/${id}/${action}`, {
      method: "PATCH",
    });

    if (res.ok) {
      alert(action === "approve" ? "✅ Booking disetujui!" : "❌ Booking ditolak!");
      load();
    } else {
      alert("Gagal memperbarui status booking!");
    }
  }

  // Hitung total
  const total = useMemo(
    () => rows.reduce((sum, b) => sum + (b.field?.price ?? 0), 0),
    [rows]
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold">✅ Approval Booking</h1>
      </div>

      {/* FILTER */}
      <form
        onSubmit={onApplyFilters}
        className="bg-white border rounded-lg p-4 grid grid-cols-1 md:grid-cols-5 gap-3"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama/email/lapangan"
          className="border rounded px-3 py-2 text-sm"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="ALL">Semua Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />

        <button
          type="submit"
          className="px-3 py-2 rounded bg-gray-900 text-white hover:bg-gray-800 text-sm"
        >
          Terapkan
        </button>
      </form>

      {/* TABLE RESPONSIVE */}
      <div className="bg-white border rounded-lg overflow-x-auto shadow-sm">
        <table className="min-w-[850px] w-full text-sm">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Lapangan</th>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Waktu</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Aksi</th>
              <th className="p-3 text-right">Harga</th>
            </tr>
          </thead>

          <tbody>
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  Tidak ada booking ditemukan.
                </td>
              </tr>
            )}

            {rows.map((b) => (
              <tr
                key={b.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-3">{b.user?.name ?? "-"}</td>
                <td className="p-3">{b.user?.email ?? "-"}</td>
                <td className="p-3">{b.field?.name ?? "-"}</td>
                <td className="p-3">
                  {new Date(b.date).toLocaleDateString("id-ID")}
                </td>
                <td className="p-3">
                  {b.timeStart} - {b.timeEnd}
                </td>

                <td className="p-3 font-semibold">
                  <span
                    className={`px-2 py-1 rounded text-xs text-white ${
                      b.status === "APPROVED"
                        ? "bg-green-600"
                        : b.status === "REJECTED"
                        ? "bg-red-600"
                        : "bg-yellow-600"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>

                <td className="p-3 text-center">
                  {b.status === "PENDING" ? (
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => handleAction(b.id, "approve")}
                        className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 text-xs"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleAction(b.id, "reject")}
                        className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">
                      Tidak ada aksi
                    </span>
                  )}
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
                <td className="p-3" colSpan={7}>Total</td>
                <td className="p-3 text-right">
                  Rp {total.toLocaleString("id-ID")}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
