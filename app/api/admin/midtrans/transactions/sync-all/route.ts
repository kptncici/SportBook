import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const MIDTRANS_API_URL = "https://api.sandbox.midtrans.com/v2";

export async function POST() {
  try {
    // 🔹 Ambil semua transaksi yang masih perlu di-sync
    const transactions = await prisma.transaction.findMany({
      where: {
        status: {
          notIn: ["settlement", "expire", "cancel", "deny"],
        },
      },
    });

    if (transactions.length === 0) {
      return NextResponse.json({
        message: "Tidak ada transaksi yang perlu disinkronisasi.",
      });
    }

    console.log(`🔄 Menyinkronkan ${transactions.length} transaksi ke Midtrans...`);

    // 🔹 Jalankan refresh ke Midtrans untuk setiap transaksi
    for (const trx of transactions) {
      const response = await fetch(`${MIDTRANS_API_URL}/${trx.orderId}/status`, {
        headers: {
          Authorization: `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn(`⚠️ Gagal ambil status untuk ${trx.orderId}`);
        continue;
      }

      const data = await response.json();

      // 🔹 Update data transaksi di database
      await prisma.transaction.update({
        where: { id: trx.id },
        data: {
          status: data.transaction_status,
          paymentType: data.payment_type ?? trx.paymentType,
          grossAmount: parseInt(data.gross_amount || trx.grossAmount?.toString() || "0"),
          raw: data,
          updatedAt: new Date(),
        },
      });

      // 🔹 Jika transaksi berhasil, tandai booking sebagai "PAID"
      if (data.transaction_status === "settlement") {
        await prisma.booking.updateMany({
          where: { transactionId: trx.id },
          data: { status: "PAID" },
        });
      }
    }

    console.log("✅ Semua transaksi berhasil diperbarui.");

    return NextResponse.json({
      success: true,
      message: "Semua transaksi berhasil disinkronisasi dari Midtrans.",
    });
  } catch (error) {
    console.error("❌ Gagal sinkronisasi transaksi:", error);
    return NextResponse.json(
      { error: "Gagal sinkronisasi transaksi dari Midtrans" },
      { status: 500 }
    );
  }
}
