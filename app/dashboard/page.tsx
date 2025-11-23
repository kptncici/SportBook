"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, CheckCircle, XCircle } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

interface Booking {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  field: { name: string };
}

export default function DashboardHome() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;

    fetch(`/api/bookings/history?userId=${session.user.id}`)
      .then((r) => r.json())
      .then(setBookings);
  }, [session]);

  const upcoming = bookings.find((b) => b.status !== "REJECTED");

  return (
    <div className="space-y-6 pb-24 md:pb-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-2xl font-bold">
            Halo, {session?.user?.name || "User"} 👋
          </h1>
          <p className="text-gray-500 text-sm">Selamat datang di SportBook</p>
        </div>
        <div className="hidden md:block">
          <LogoutButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <CheckCircle className="mx-auto text-green-600 mb-1" />
          <div className="font-bold text-lg">
            {bookings.filter((b) => b.status === "APPROVED").length}
          </div>
          <div className="text-xs text-gray-500">Disetujui</div>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <Clock className="mx-auto text-yellow-600 mb-1" />
          <div className="font-bold text-lg">
            {bookings.filter((b) => b.status === "PENDING").length}
          </div>
          <div className="text-xs text-gray-500">Menunggu</div>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
          <XCircle className="mx-auto text-red-600 mb-1" />
          <div className="font-bold text-lg">
            {bookings.filter((b) => b.status === "REJECTED").length}
          </div>
          <div className="text-xs text-gray-500">Ditolak</div>
        </div>
      </div>

      {/* Upcoming Booking */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <CalendarDays size={18} /> Jadwal Terdekat
        </h2>

        {upcoming ? (
          <div className="text-sm space-y-1">
            <div className="font-semibold break-words">{upcoming.field.name}</div>
            <div>{upcoming.date.slice(0, 10)}</div>
            <div className="text-gray-600">
              {upcoming.timeStart} - {upcoming.timeEnd}
            </div>
            <span
              className={`text-xs font-bold ${
                upcoming.status === "APPROVED"
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            >
              {upcoming.status === "APPROVED" ? "✔ Disetujui" : "⏳ Pending"}
            </span>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Belum ada jadwal aktif.</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Link
            href="/dashboard/booking"
            className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            + Booking Lapangan
          </Link>

          <Link
            href="/dashboard/history"
            className="flex-1 text-center px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
          >
            Lihat Riwayat
          </Link>
        </div>
      </div>
    </div>
  );
}
