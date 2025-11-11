import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const bookings = await prisma.booking.findMany({
    where: { status: "APPROVED" },
    include: { field: true },
  });

  const monthly: any = {};

  bookings.forEach((b) => {
    const month = new Date(b.date).toLocaleString("id-ID", { month: "short" });
    monthly[month] = (monthly[month] || 0) + (b.field?.price || 0);
  });

  const result = Object.entries(monthly).map(([month, revenue]) => ({
    month,
    revenue,
  }));

  return NextResponse.json(result);
}
