import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    // 🛑 Validasi bookingId
    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // 🔍 Ambil booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, field: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // 💰 Harga lapangan
    const amount = booking.field?.price || 0;
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Invalid price" },
        { status: 400 }
      );
    }

    // ================================
    // 🔥 MIDTRANS SNAP PAYMENT ONLY
    // ================================

    const snap = new midtransClient.Snap({
      isProduction: false, // ganti true kalau sudah pakai live mode
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });

    const parameter = {
      transaction_details: {
        order_id: booking.id,
        gross_amount: amount,
      },
      customer_details: {
        first_name: booking.user?.name || "User",
        email: booking.user?.email || "user@example.com",
      },
      item_details: [
        {
          id: booking.fieldId,
          name: booking.field?.name || "Lapangan",
          price: amount,
          quantity: 1,
        },
      ],
      callbacks: {
        finish: `${process.env.APP_URL}/dashboard/history`,
      },
    };

    // 🚀 Buat transaksi Midtrans
    const transaction = await snap.createTransaction(parameter);

    // Simpan metode pembayaran
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentMethod: "MIDTRANS", // ENUM aman
      },
    });

    return NextResponse.json({
      token: transaction.token,
      paymentUrl: transaction.redirect_url,
    });
  } catch (error: any) {
    console.error("❌ Midtrans error:", error.message);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
