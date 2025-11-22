import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // Midtrans client hanya jalan di Node

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID diperlukan" }, { status: 400 });
    }

    // Validasi env Midtrans
    if (!process.env.MIDTRANS_SERVER_KEY) {
      return NextResponse.json(
        { error: "MIDTRANS_SERVER_KEY tidak ditemukan di environment" },
        { status: 500 }
      );
    }

    // Ambil data booking + relasi user & field
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, field: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    if (booking.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Booking belum disetujui admin" },
        { status: 403 }
      );
    }

    // Inisialisasi Midtrans Snap
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    });

    // Generate order_id aman
    const orderId = `SPORTBOOK-${booking.id}`.substring(0, 45);

    // Buat transaksi Snap
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: booking.field.price,
      },
      customer_details: {
        first_name: booking.user.name || "User",
        email: booking.user.email,
      },
      item_details: [
        {
          id: booking.field.id,
          name: booking.field.name,
          price: booking.field.price,
          quantity: 1,
        },
      ],
      enabled_payments: ["gopay", "qris", "bca_va", "bni_va", "bri_va"],
    });

    return NextResponse.json({
      ok: true,
      token: transaction.token,
      paymentUrl: transaction.redirect_url,
    });
  } catch (err) {
    console.error("🔥 Midtrans payment error:", err);
    return NextResponse.json(
      { error: "Gagal membuat pembayaran" },
      { status: 500 }
    );
  }
}
