import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // pastikan impor dari { prisma }, bukan default
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: { field: true },
      orderBy: { createdAt: "desc" },
    });

    // kalau tidak ada booking, tetap balikan array kosong biar frontend aman
    return NextResponse.json(bookings ?? []);
  } catch (err) {
    console.error("❌ Error fetching user bookings:", err);
    return NextResponse.json(
      { error: "Failed to fetch booking history" },
      { status: 500 }
    );
  }
}
