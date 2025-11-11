"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CalendarDays, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { signOut, useSession } from "next-auth/react";

export default function OwnerDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    fetchSummary();
  }, []);

  async function fetchSummary() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/owner/summary");
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("❌ Gagal ambil data owner summary:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="p-6">
        <p className="text-gray-500 animate-pulse">⏳ Memuat data...</p>
      </div>
    );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* 🔹 Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">💼 Dashboard Owner</h1>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={fetchSummary}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            🔄 Refresh Data
          </Button>
          <Button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-red-500 hover:bg-red-600"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* 🔹 Statistik Atas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pendapatan Bulan Ini"
          value={`Rp ${summary.totalRevenue.toLocaleString("id-ID")}`}
          icon={<DollarSign className="text-green-600" size={24} />}
        />
        <StatCard
          title="Booking Selesai"
          value={summary.totalBookings}
          icon={<CheckCircle className="text-blue-600" size={24} />}
        />
        <StatCard
          title="Lapangan Aktif"
          value={summary.totalFields}
          icon={<MapPin className="text-red-600" size={24} />}
        />
        <StatCard
          title="Booking Bulan Ini"
          value={summary.monthlyBookings}
          icon={<CalendarDays className="text-yellow-600" size={24} />}
        />
      </div>

      {/* 🔹 Grafik Booking Harian */}
      <Card className="mt-6 shadow">
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">
            📈 Grafik Booking 7 Hari Terakhir
          </h2>
          {summary.dailyStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={summary.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">
              Belum ada data booking minggu ini.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
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
