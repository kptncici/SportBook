import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/bookings/history
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") ?? "";
    const status = url.searchParams.get("status") ?? "";
    const from = url.searchParams.get("from") ?? "";
    const to = url.searchParams.get("to") ?? "";

    const where: any = {
      userId: session.user.id, // ✅ hanya tampilkan data milik user ini
    };

    if (status) {
      where.status = status;
    }

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from + "T00:00:00");
      if (to) where.date.lte = new Date(to + "T23:59:59");
    }

    if (search) {
      where.OR = [
        { field: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const data = await prisma.booking.findMany({
      where,
      include: {
        field: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(data);
  } catch (e) {
    console.error("❌ Error fetch user history:", e);
    return NextResponse.json([], { status: 200 });
  }
}
