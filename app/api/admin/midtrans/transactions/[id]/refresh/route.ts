// app/api/admin/midtrans/transactions/[id]/refresh/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const MIDTRANS_IS_PROD = (process.env.MIDTRANS_IS_PRODUCTION || "false").toLowerCase() === "true";

export async function GET(_req: Request, context: any) {
  try {
    // Next.js 16: params may be a Promise
    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });
    }

    const tx = await prisma.transaction.findUnique({ where: { id } });
    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (!MIDTRANS_SERVER_KEY) {
      console.warn("MIDTRANS_SERVER_KEY not set - cannot refresh");
      return NextResponse.json({ error: "MIDTRANS_SERVER_KEY not configured" }, { status: 500 });
    }

    const base = MIDTRANS_IS_PROD ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
    const url = `${base}/v2/${tx.orderId}/status`;

    const authHeader = "Basic " + Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64");

    const res = await fetch(url, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => null);
      console.error("Midtrans status API returned not ok:", res.status, text);
      return NextResponse.json({ error: "midtrans api error", status: res.status, body: text }, { status: 502 });
    }

    const data = await res.json();

    // Update transaction record
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        status: data.transaction_status ?? (data.status_code ? String(data.status_code) : tx.status),
        paymentType: data.payment_type ?? tx.paymentType,
        grossAmount: data.gross_amount ? parseInt(String(data.gross_amount)) : tx.grossAmount,
        raw: data,
        updatedAt: new Date(),
      },
    });

    // Sync booking status if transaction is linked to booking (transactionId stored in booking)
    // We update booking(s) where transactionId === tx.id
    if (data.transaction_status === "settlement" || data.transaction_status === "capture") {
      await prisma.booking.updateMany({
        where: { transactionId: id },
        data: { status: "PAID" },
      });
    } else if (
      data.transaction_status === "cancel" ||
      data.transaction_status === "expire" ||
      data.transaction_status === "deny"
    ) {
      await prisma.booking.updateMany({
        where: { transactionId: id },
        data: { status: "CANCELED" },
      });
    }

    return NextResponse.json({ success: true, transaction: updated });
  } catch (error) {
    console.error("❌ Refresh transaction error:", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
