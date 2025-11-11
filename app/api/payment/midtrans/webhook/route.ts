import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, transaction_status, payment_type, gross_amount } = body;

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    console.log("📩 Midtrans Webhook:", body);

    // Simpan atau update transaksi
    const tx = await prisma.transaction.upsert({
      where: { orderId: order_id },
      update: {
        status: transaction_status,
        paymentType: payment_type,
        grossAmount: parseInt(gross_amount || "0"),
        raw: body,
      },
      create: {
        orderId: order_id,
        status: transaction_status,
        paymentType: payment_type,
        grossAmount: parseInt(gross_amount || "0"),
        raw: body,
      },
    });

    // Update status booking
    if (transaction_status === "settlement" || transaction_status === "capture") {
      await prisma.booking.updateMany({
        where: { transactionId: tx.id },
        data: { status: "PAID" },
      });
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "expire" ||
      transaction_status === "deny"
    ) {
      await prisma.booking.updateMany({
        where: { transactionId: tx.id },
        data: { status: "CANCELED" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Midtrans Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
