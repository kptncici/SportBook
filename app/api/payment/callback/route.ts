import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

// ✅ Ambil enum BookingStatus dari Prisma v6+
const BookingStatusEnum = (Prisma as any).$Enums?.BookingStatus;

// Type helper supaya aman dari enum string mismatch
type BookingStatusStr = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | "PAID";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, transaction_status, fraud_status } = body;

    console.log("📥 Callback diterima dari Midtrans:", {
      order_id,
      transaction_status,
      fraud_status,
    });

    // 🔍 Cari booking berdasarkan ID
    const booking = await prisma.booking.findUnique({
      where: { id: order_id },
      select: { id: true, status: true },
    });

    if (!booking) {
      console.error("❌ Booking tidak ditemukan:", order_id);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 💡 Tentukan status baru berdasarkan callback Midtrans
    let newStatus: BookingStatusStr | undefined;

    switch (transaction_status) {
      case "capture":
      case "settlement":
        if (fraud_status === "accept") newStatus = "PAID";
        break;
      case "pending":
        newStatus = "PENDING";
        break;
      case "deny":
      case "cancel":
      case "expire":
        newStatus = "CANCELED";
        break;
      default:
        break;
    }

    // 🔄 Update status jika berubah
    if (newStatus && newStatus !== booking.status) {
      const statusValue = BookingStatusEnum?.[newStatus] ?? newStatus;

      await prisma.booking.update({
        where: { id: order_id },
        data: { status: statusValue as any },
      });

      console.log(`✅ Booking ${order_id} diperbarui menjadi ${newStatus}`);

      // 📩 Jika status menjadi PAID → kirim invoice otomatis
      if (newStatus === "PAID") {
        const paidBooking = await prisma.booking.findUnique({
          where: { id: order_id },
          include: { user: true, field: true },
        });

        if (paidBooking) {
          import("@/lib/invoice").then(({ generateAndSendInvoice }) =>
            generateAndSendInvoice(paidBooking)
          );
        }
      }
    } else {
      console.log(`ℹ️ Tidak ada perubahan status untuk ${order_id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error pada callback Midtrans:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
