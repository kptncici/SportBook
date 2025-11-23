"use client";

import { useSession } from "next-auth/react";
import { Users, CalendarCheck, MapPin, DollarSign } from "lucide-react";

export default function AdminHome() {
  const { data: session } = useSession();

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-gray-500">
            Selamat datang kembali, {session?.user?.name || "Admin"} 👋
          </p>
        </div>
      </div>

      {/* Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={<Users size={26} />} label="Total User" value="6" />
        <Card icon={<CalendarCheck size={26} />} label="Total Booking" value="5" />
        <Card icon={<MapPin size={26} />} label="Lapangan Aktif" value="2" />
        <Card icon={<DollarSign size={26} />} label="Pendapatan Bulan Ini" value="Rp 300.000" />
      </div>

      {/* Info section */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-2">📢 Informasi Sistem</h2>
        <p className="text-gray-600">
          Gunakan menu di sidebar kiri untuk mengelola Booking, Lapangan, dan User.
          Pastikan setiap perubahan dilakukan dengan hati-hati agar integritas sistem tetap terjaga.
        </p>
      </div>

    </div>
  );
}

function Card({ icon, label, value }: any) {
  return (
    <div className="bg-white border shadow rounded-xl p-5 flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      {icon}
    </div>
  );
}
