import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Ambil data utama secara paralel
    const [totalUsers, totalFields, bookings] = await Promise.all([
      prisma.user.count(),
      prisma.field.count(),
      prisma.booking.findMany({
        include: { field: true },
      }),
    ]);

    // Hitung total booking
    const totalBookings = bookings.length;

    // Hitung pendapatan dari booking yang sudah approved/paid
    const totalRevenue = bookings
      .filter((b) => b.status === "APPROVED" || b.status === "PAID")
      .reduce((sum, b) => sum + (b.field?.price ?? 0), 0);

    // Buat data summary
    const summary = {
      totalUsers,
      totalBookings,
      totalFields,
      totalRevenue,
    };

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("❌ Error di /api/dashboard/admin/summary:", error);
    return NextResponse.json(
      { error: "Gagal memuat data dashboard" },
      { status: 500 }
    );
  }
}
