import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import midtransClient from "midtrans-client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { bookingId, method } = await req.json();

    // ✅ Validasi bookingId
    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // 🔍 Ambil data booking
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

    // ⚡ Validasi harga
    const amount = booking.field?.price || 0;
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Invalid field price" },
        { status: 400 }
      );
    }

    // 🏧 Jika user pilih bayar tunai di tempat
    if (method === "CASH") {
      // Update status menjadi APPROVED agar bisa langsung main
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "APPROVED",
          paymentMethod: "CASH",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Pembayaran tunai dipilih. Silakan bayar di lokasi.",
      });
    }

    // 💳 Midtrans (Transfer / E-Wallet / QRIS)
    const snap = new midtransClient.Snap({
      isProduction: false, // ⚠️ ubah ke true saat deploy ke live mode
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });

    // 💰 Detail transaksi
    const parameter = {
      transaction_details: {
        order_id: booking.id,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: booking.user?.name || "User",
        email: booking.user?.email || "user@example.com",
      },
      item_details: [
        {
          id: booking.fieldId,
          price: amount,
          quantity: 1,
          name: booking.field?.name || "Lapangan Futsal",
        },
      ],
      callbacks: {
        finish: `${process.env.APP_URL}/dashboard/user/history`,
      },
    };

    // 🚀 Buat transaksi Midtrans
    const transaction = await snap.createTransaction(parameter);
    console.log("🎟️ Snap token created:", transaction.token);

    // Simpan metode pembayaran
    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentMethod: "MIDTRANS" },
    });

    return NextResponse.json({
      token: transaction.token,
      paymentUrl: transaction.redirect_url,
    });
  } catch (error: any) {
    console.error("❌ Midtrans Snap error:", error.message);
    return NextResponse.json(
      { error: "Failed to create Snap transaction" },
      { status: 500 }
    );
  }
}
