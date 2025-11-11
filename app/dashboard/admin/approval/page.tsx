"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminApprovalPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/bookings?status=PENDING", {
        cache: "no-store",
      });
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: string) {
    await fetch(`/api/bookings/${id}/approve`, { method: "PATCH" });
    load();
  }

  async function reject(id: string) {
    await fetch(`/api/bookings/${id}/reject`, { method: "PATCH" });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">
        Manajemen Booking (Admin)
      </h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">Lapangan</th>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-left">Waktu</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  ✅ Tidak ada booking pending.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3">{b.user?.name ?? "-"}</td>
                  <td className="p-3">{b.field?.name ?? "-"}</td>
                  <td className="p-3">
                    {new Date(b.date).toISOString().slice(0, 10)}
                  </td>
                  <td className="p-3">
                    {b.timeStart} - {b.timeEnd}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        onClick={() => approve(b.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => reject(b.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
