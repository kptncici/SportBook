"use client";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ReportPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => setRows(data.bookings ?? [])); // ✅ Ambil array bookings saja
  }, []);

  // ✅ Hitung pendapatan per bulan
  const monthly = useMemo(() => {
    if (!Array.isArray(rows)) return [];

    const map: Record<string, { month: string; total: number; count: number }> =
      {};

    rows
      .filter((r) => r.status === "APPROVED")
      .forEach((r) => {
        const d = new Date(r.date);
        const key =
          d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0");

        if (!map[key]) {
          map[key] = {
            month: d.toLocaleString("id-ID", { month: "long" }),
            total: 0,
            count: 0,
          };
        }

        map[key].total += r.field?.price ?? 0;
        map[key].count += 1;
      });

    return Object.values(map);
  }, [rows]);

  // ✅ Download CSV
  function downloadCSV() {
    const header = ["Periode", "Jumlah Transaksi", "Total Pendapatan (Rp)"];
    const lines = [header.join(",")];

    monthly.forEach((m) => {
      lines.push([m.month, m.count, m.total].join(","));
    });

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-sportbook.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalCount = monthly.reduce((a, b) => a + b.count, 0);
  const totalAmount = monthly.reduce((a, b) => a + b.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">💰 Laporan Pemilik</h1>
        <button
          onClick={downloadCSV}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Export Excel (CSV)
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ✅ Table */}
        <div className="bg-white border rounded-xl p-4">
          <div className="font-semibold mb-3">📄 Laporan Pendapatan</div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Periode</th>
                <th className="p-2 text-left">Jumlah Transaksi</th>
                <th className="p-2 text-left">Total Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m) => (
                <tr key={m.month} className="border-t">
                  <td className="p-2">{m.month}</td>
                  <td className="p-2">{m.count}</td>
                  <td className="p-2 text-emerald-700 font-semibold">
                    Rp {m.total.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
              <tr className="bg-indigo-50 font-semibold border-t">
                <td className="p-2">Total</td>
                <td className="p-2">{totalCount}</td>
                <td className="p-2 text-indigo-700">
                  Rp {totalAmount.toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ✅ Chart */}
        <div className="bg-white border rounded-xl p-4">
          <div className="font-semibold mb-3">📊 Grafik Pendapatan Bulanan</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ✅ Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl p-4">
          <div className="text-sm opacity-90">Total Transaksi</div>
          <div className="text-2xl font-bold">{totalCount}</div>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-4">
          <div className="text-sm opacity-90">Total Pendapatan</div>
          <div className="text-2xl font-bold">
            Rp {totalAmount.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="bg-violet-600 text-white rounded-xl p-4">
          <div className="text-sm opacity-90">Rata-rata/Bulan</div>
          <div className="text-2xl font-bold">
            Rp{" "}
            {monthly.length
              ? Math.round(totalAmount / monthly.length).toLocaleString("id-ID")
              : 0}
          </div>
        </div>
      </div>
    </div>
  );
}
