"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Stats() {
  const { data, error } = useSWR("/dashboard/owner/stats", fetcher);

  if (error) return <p>Error loading stats</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-gray-500">Total Booking</h3>
        <p className="text-2xl font-bold">{data.totalBookings}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-gray-500">Total Users</h3>
        <p className="text-2xl font-bold">{data.totalUsers}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-gray-500">Total Field</h3>
        <p className="text-2xl font-bold">{data.totalFields}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-gray-500">Revenue</h3>
        <p className="text-xl font-bold text-green-600">Rp {data.totalRevenue}</p>
      </div>
    </div>
  );
}
