import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // midtrans-client only runs on Node

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID diperlukan" }, { status: 400 });
    }

    // Ambil data booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, field: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    if (booking.status !== "APPROVED") {
      return NextResponse.json({ error: "Booking belum disetujui admin" }, { status: 403 });
    }

    // Inisialisasi Midtrans
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });

    // Buat transaksi
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: `SPORTBOOK-${booking.id}`,
        gross_amount: booking.field.price,
      },
      customer_details: {
        first_name: booking.user.name || "User",
        email: booking.user.email,
      },
      item_details: [
        {
          id: booking.field.id,
          price: booking.field.price,
          quantity: 1,
          name: booking.field.name,
        },
      ],
      enabled_payments: ["gopay", "qris", "bca_va", "bni_va", "bri_va"],
    });

    const paymentUrl = transaction.redirect_url;

    // Simpan status payment pending
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "PENDING" },
    });

    return NextResponse.json({
      ok: true,
      paymentUrl,
      token: transaction.token,
    });
  } catch (err) {
    console.error("Midtrans payment error:", err);
    return NextResponse.json({ error: "Gagal membuat pembayaran" }, { status: 500 });
  }
}
