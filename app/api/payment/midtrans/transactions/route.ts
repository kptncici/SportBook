import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const q = searchParams.get("q") || undefined;
    const take = parseInt(searchParams.get("take") || "50");

    const where: any = {};
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { orderId: { contains: q } },
        { paymentType: { contains: q } },
      ];
    }

    const rows = await prisma.transaction.findMany({
      where,
      include: {
        booking: {
          select: { id: true, userId: true, fieldId: true, date: true, timeStart: true, timeEnd: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take,
    });

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET transactions error:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
