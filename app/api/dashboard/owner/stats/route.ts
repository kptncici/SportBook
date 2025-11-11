import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalBookings = await prisma.booking.count();
    const totalUsers = await prisma.user.count();
    const totalFields = await prisma.field.count();

    // Hitung revenue dengan join Field (karena harga ada di table Field)
    const approvedBookings = await prisma.booking.findMany({
      where: { status: "APPROVED" },
      include: { field: true },
    });

    const totalRevenue = approvedBookings.reduce(
      (sum, b) => sum + (b.field?.price || 0),
      0
    );

    return NextResponse.json({
      totalBookings,
      totalUsers,
      totalFields,
      totalRevenue,
    });
  } catch (error) {
    console.error("Owner stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
