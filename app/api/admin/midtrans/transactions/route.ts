import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          include: {
            user: true,
            field: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: transactions.map((trx) => ({
        id: trx.id,
        orderId: trx.orderId,
        status: trx.status,
        paymentType: trx.paymentType,
        grossAmount: trx.grossAmount,
        createdAt: trx.createdAt,
        updatedAt: trx.updatedAt,
        booking: {
          id: trx.booking?.id,
          user: trx.booking?.user?.name,
          field: trx.booking?.field?.name,
          date: trx.booking?.date,
          timeStart: trx.booking?.timeStart,
          timeEnd: trx.booking?.timeEnd,
        },
      })),
    });
  } catch (err) {
    console.error("❌ Error ambil data transaksi:", err);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data transaksi." },
      { status: 500 }
    );
  }
}
