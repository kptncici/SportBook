import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

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

    // ✅ Cegah check-in ganda
    if (booking.checkedIn) {
      return NextResponse.json(
        { error: "Booking ini sudah di-check-in sebelumnya" },
        { status: 400 }
      );
    }

    // ✅ Hanya bisa check-in kalau sudah APPROVED
    if (booking.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Booking belum disetujui (APPROVED) oleh admin" },
        { status: 400 }
      );
    }

    // ✅ Update status jadi sudah check-in
    const updated = await prisma.booking.update({
      where: { id },
      data: { checkedIn: true },
    });

    return NextResponse.json({
      success: true,
      message: "✅ Check-in berhasil",
      booking: updated,
    });
  } catch (err) {
    console.error("❌ Check-in error:", err);
    return NextResponse.json(
      { error: "Gagal memproses check-in" },
      { status: 500 }
    );
  }
}
