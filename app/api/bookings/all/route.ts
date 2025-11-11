import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { search, status, from, to } = Object.fromEntries(
      new URL(req.url).searchParams
    );

    const allowedStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELED", "ALL"];
    const statusParam = (status || "ALL").toUpperCase();

    const where: any = {};
    if (allowedStatuses.includes(statusParam) && statusParam !== "ALL") {
      where.status = statusParam;
    }

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from + "T00:00:00Z");
      if (to) where.date.lte = new Date(to + "T23:59:59Z");
    }

    if (search && search.trim()) {
      const keyword = search.trim();
      where.OR = [
        { user: { name: { contains: keyword, mode: "insensitive" } } },
        { user: { email: { contains: keyword, mode: "insensitive" } } },
        { field: { name: { contains: keyword, mode: "insensitive" } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        field: { select: { name: true, price: true, location: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("❌ Error fetch all bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
