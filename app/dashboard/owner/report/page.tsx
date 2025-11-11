"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OwnerReportPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/owner/revenue");
      const data = await res.json();
      setData(data);
    } catch (err) {
      console.error("❌ Error ambil laporan:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-800">📊 Laporan Pendapatan</h1>
        <Button onClick={fetchReport} className="bg-indigo-600 hover:bg-indigo-700">
          🔄 Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 overflow-x-auto">
          {loading ? (
            <p className="text-gray-500">⏳ Memuat laporan...</p>
          ) : data.length === 0 ? (
            <p className="text-gray-500">Belum ada data transaksi bulan ini.</p>
          ) : (
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Tanggal</th>
                  <th className="p-2 border">Order ID</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {data.map((trx) => (
                  <tr key={trx.id} className="border hover:bg-gray-50">
                    <td className="p-2 border">
                      {new Date(trx.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-2 border">{trx.orderId}</td>
                    <td className="p-2 border text-green-600">{trx.status}</td>
                    <td className="p-2 border">
                      Rp {trx.grossAmount?.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
