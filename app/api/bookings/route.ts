import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/* =========================================================
   🟦 GET → Ambil daftar booking (Admin atau filter user)
   ========================================================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const statusParam = searchParams.get("status") || "PENDING";
    const dateParam = searchParams.get("date");

    const allowedStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELED", "PAID", "ALL"];
    const status = allowedStatuses.includes(statusParam)
      ? statusParam
      : "PENDING";

    const where: Record<string, any> = {};
    if (status !== "ALL") where.status = status;

    if (dateParam) {
      const start = new Date(`${dateParam}T00:00:00.000Z`);
      const end = new Date(`${dateParam}T23:59:59.999Z`);
      where.date = { gte: start, lte: end };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        field: { select: { id: true, name: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("❌ GET /api/bookings error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* =========================================================
   🟩 POST → Buat booking baru (User)
   ========================================================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, fieldId, date, timeStart, timeEnd, paymentMethod } = body;

    // 🔹 Validasi input
    if (!userId || !fieldId || !date || !timeStart || !timeEnd) {
      return NextResponse.json(
        { error: "Data booking tidak lengkap" },
        { status: 400 }
      );
    }

    // 🔹 Pastikan lapangan ada
    const field = await prisma.field.findUnique({ where: { id: fieldId } });
    if (!field) {
      return NextResponse.json(
        { error: "Lapangan tidak ditemukan" },
        { status: 404 }
      );
    }

    // 🔹 Cek jadwal bentrok
    const overlap = await prisma.booking.findFirst({
      where: {
        fieldId,
        date: new Date(date),
        status: { notIn: ["REJECTED", "CANCELED"] },
        OR: [
          {
            AND: [
              { timeStart: { lt: timeEnd } },
              { timeEnd: { gt: timeStart } },
            ],
          },
        ],
      },
    });

    if (overlap) {
      return NextResponse.json(
        { error: "Waktu tersebut sudah dibooking orang lain" },
        { status: 409 }
      );
    }

    // ---------------------------------------------------------
    // 🎯 FIX UTAMA: paymentMethod HARUS hanya MIDTRANS
    // ---------------------------------------------------------
    const finalPaymentMethod = "MIDTRANS"; // default dan satu-satunya pilihan

    // 🔹 Simpan booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        fieldId,
        date: new Date(date),
        timeStart,
        timeEnd,
        paymentMethod: finalPaymentMethod,
        status: "PENDING",
      },
      include: {
        user: { select: { name: true, email: true } },
        field: { select: { name: true, price: true } },
      },
    });

    console.log("✅ Booking baru dibuat:", booking.id);
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/bookings error:", error);
    return NextResponse.json(
      { error: "Gagal membuat booking" },
      { status: 500 }
    );
  }
}
