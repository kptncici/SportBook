import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // 🔥 FIX: params adalah Promise
) {
  try {
    const { id } = await params; // 🔥 FIX: harus di-await

    if (!id) {
      return NextResponse.json(
        { error: "Missing booking ID" },
        { status: 400 }
      );
    }

    // Cek apakah booking ada
    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking tidak ditemukan" },
        { status: 404 }
      );
    }

    // Tidak boleh menolak booking yang sudah batal / ditolak
    if (["CANCELED", "REJECTED"].includes(booking.status)) {
      return NextResponse.json(
        { error: `Booking sudah ${booking.status.toLowerCase()}` },
          { status: 400 }
      );
    }

    // Tidak boleh menolak booking yang sudah disetujui
    if (booking.status === "APPROVED") {
      return NextResponse.json(
        { error: "Tidak bisa menolak booking yang sudah disetujui" },
        { status: 400 }
      );
    }

    // Update status
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
