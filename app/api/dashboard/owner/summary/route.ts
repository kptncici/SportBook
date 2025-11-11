import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);

    // 🔹 Ambil semua data paralel
    const [fields, bookings, transactions] = await Promise.all([
      prisma.field.count(),
      prisma.booking.findMany({
        where: { date: { gte: startOfMonth } },
      }),
      prisma.transaction.findMany({
        where: {
          status: "settlement",
          updatedAt: { gte: startOfMonth },
        },
      }),
    ]);

    // 🔹 Hitung total revenue dari transaksi sukses
    const totalRevenue = transactions.reduce(
      (sum, trx) => sum + (trx.grossAmount || 0),
      0
    );

    // 🔹 Hitung total booking sukses
    const totalBookings = bookings.length;

    // 🔹 Hitung booking bulanan
    const monthlyBookings = bookings.filter(
      (b) => b.status === "PAID" || b.status === "APPROVED"
    ).length;

    // 🔹 Hitung statistik harian (7 hari terakhir)
    const dailyStats = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      const formattedDate = date.toISOString().slice(5, 10); // MM-DD

      const count = bookings.filter(
        (b) => b.date.toISOString().slice(5, 10) === formattedDate
      ).length;

      dailyStats.push({ date: formattedDate, count });
    }

    return NextResponse.json({
      totalFields: fields,
      totalBookings,
      monthlyBookings,
      totalRevenue,
      dailyStats,
    });
  } catch (err) {
    console.error("❌ Error owner summary:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data summary owner" },
      { status: 500 }
    );
  }
}
