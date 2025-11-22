import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ FIX RESMI: params adalah Promise

    if (!id) {
      return NextResponse.json(
        { error: "Missing booking ID" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking tidak ditemukan" },
        { status: 404 }
      );
    }

    if (["CANCELED", "REJECTED"].includes(booking.status)) {
      return NextResponse.json(
        { error: `Booking sudah ${booking.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    if (booking.status === "PAID") {
      return NextResponse.json(
        { error: "Tidak dapat membatalkan booking yang sudah dibayar." },
        { status: 400 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELED" },
    });

    return NextResponse.json({
      success: true,
      message: "❌ Booking berhasil dibatalkan",
      booking: updated,
    });
  } catch (error) {
    console.error("❌ Cancel booking error:", error);
    return NextResponse.json(
      { error: "Gagal membatalkan booking" },
      { status: 500 }
    );
  }
}
