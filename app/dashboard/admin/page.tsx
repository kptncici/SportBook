"use client";

import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { useSession } from "next-auth/react";
import { Users, CalendarCheck, MapPin, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Summary = {
  totalUsers: number;
  totalBookings: number;
  totalFields: number;
  totalRevenue: number;
};

export default function AdminHome() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Ambil data summary dari API
  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/dashboard/admin/summary", {
          cache: "no-store",
        });
        const data = await res.json();
        setSummary(data.summary);
      } catch (err) {
        console.error("❌ Gagal mengambil data summary:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">🏠 Dashboard Admin</h1>
          <p className="text-gray-600">
            Selamat datang kembali,{" "}
            <span className="font-semibold text-blue-700">
              {session?.user?.name ?? "Admin"}
            </span>{" "}
            👋
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* Mini Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="text-indigo-600" size={24} />}
          title="Total User"
          value={loading ? "Loading..." : summary?.totalUsers ?? 0}
        />
        <StatCard
          icon={<CalendarCheck className="text-green-600" size={24} />}
          title="Total Booking"
          value={loading ? "Loading..." : summary?.totalBookings ?? 0}
        />
        <StatCard
          icon={<MapPin className="text-red-600" size={24} />}
          title="Lapangan Aktif"
          value={loading ? "Loading..." : summary?.totalFields ?? 0}
        />
        <StatCard
          icon={<DollarSign className="text-yellow-600" size={24} />}
          title="Pendapatan Bulan Ini"
          value={
            loading
              ? "Loading..."
              : `Rp ${(summary?.totalRevenue ?? 0).toLocaleString("id-ID")}`
          }
        />
      </div>

      {/* Info Section */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          📢 Informasi Sistem
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Gunakan menu di sidebar kiri untuk mengelola{" "}
          <span className="font-medium text-blue-700">Booking</span>,{" "}
          <span className="font-medium text-blue-700">Lapangan</span>, dan{" "}
          <span className="font-medium text-blue-700">User</span>.
          <br />
          Pastikan setiap perubahan data dilakukan dengan hati-hati untuk menjaga
          integritas sistem.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}) {
  return (
    <Card className="shadow hover:shadow-md transition-all">
      <CardContent className="flex justify-between items-center p-5">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-bold mt-1">{value}</p>
        </div>
        {icon}
      </CardContent>
    </Card>
  );
}
