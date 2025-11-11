import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(req: Request, context: any) {
  try {
    // ✅ Ambil params secara aman (karena di Next.js 16 params bisa Promise)
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
    }

    // ✅ Cek apakah booking ada
    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking tidak ditemukan" },
        { status: 404 }
      );
    }

    // ✅ Tidak boleh tolak booking yang sudah dibatalkan atau disetujui
    if (["CANCELED", "REJECTED"].includes(booking.status)) {
      return NextResponse.json(
        { error: `Booking sudah ${booking.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    if (booking.status === "APPROVED") {
      return NextResponse.json(
        { error: "Tidak bisa menolak booking yang sudah disetujui" },
        { status: 400 }
      );
    }

    // ✅ Update status ke REJECTED
    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    return NextResponse.json({
      success: true,
      message: "❌ Booking berhasil ditolak",
      booking: updated,
    });
  } catch (error) {
    console.error("❌ Reject booking error:", error);
    return NextResponse.json(
      { error: "Gagal menolak booking" },
      { status: 500 }
    );
  }
}
