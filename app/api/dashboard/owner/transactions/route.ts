import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // kalau kosong pun tetap kembalikan array kosong
    return NextResponse.json(transactions ?? []);
  } catch (err: any) {
    console.error("❌ Gagal ambil data transaksi owner:", err);

    // tampilkan pesan error asli biar kelihatan penyebabnya
    return NextResponse.json(
      {
        error: "Gagal mengambil data transaksi owner",
        message: err.message || "Unknown error",
        stack: err.stack || null,
      },
      { status: 500 }
    );
  }
}
