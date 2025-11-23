"use client";

import { useEffect, useState } from "react";

type Tx = {
  id: string;
  orderId: string;
  status: string;
  paymentType?: string;
  grossAmount?: number;
  createdAt: string;
  booking?: {
    id: string;
    status?: string;
    date?: string;
    timeStart?: string;
    timeEnd?: string;
  } | null;
};

export default function MidtransViewer() {
  const [rows, setRows] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/midtrans/transactions?${params.toString()}`);
    const data = await res.json();
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Midtrans Transactions</h1>

      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="search orderId / type" className="border px-2 py-1" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border px-2 py-1">
          <option value="">All status</option>
          <option value="settlement">settlement</option>
          <option value="pending">pending</option>
          <option value="deny">deny</option>
        </select>
        <button onClick={load} className="bg-indigo-600 text-white px-3 py-1 rounded">Refresh</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Order</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Type</th>
              <th className="p-2">Status</th>
              <th className="p-2">Booking</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.orderId}</td>
                <td className="p-2">{r.grossAmount ? `Rp ${r.grossAmount.toLocaleString("id-ID")}` : "-"}</td>
                <td className="p-2">{r.paymentType}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2">{r.booking ? r.booking.id : "-"}</td>
                <td className="p-2">
                  {/* manual reconcile / refresh single tx */}
                  <button onClick={async () => {
                    await fetch(`/api/admin/midtrans/transactions/${r.id}/refresh`, { method: "POST" });
                    load();
                  }} className="text-sm text-indigo-600">Refresh</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
