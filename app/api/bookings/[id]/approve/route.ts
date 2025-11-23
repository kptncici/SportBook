import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function PATCH(req: Request, context: any) {
  try {
    // Next.js 16 → params adalah promise
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
    }

    // Update booking → APPROVED
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Booking berhasil disetujui (APPROVED).",
    });
  } catch (error) {
    console.error("❌ Approve booking error:", error);
    return NextResponse.json(
      { error: "Gagal approve booking" },
      { status: 500 }
    );
  }
}
