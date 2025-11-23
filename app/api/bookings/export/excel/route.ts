import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    // 🧭 Filter booking user + periode tanggal
    const where: any = { userId: session.user.id };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from + "T00:00:00");
      if (to) where.date.lte = new Date(to + "T23:59:59");
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: { field: true },
      orderBy: { date: "desc" },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Riwayat Booking");

    sheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "Lapangan", key: "field", width: 20 },
      { header: "Tanggal", key: "date", width: 15 },
      { header: "Waktu", key: "time", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Harga", key: "price", width: 15 },
    ];

    bookings.forEach((b: any, i: number) => {
      sheet.addRow({
        no: i + 1,
        field: b.field?.name ?? "-",
        date: new Date(b.date).toLocaleDateString("id-ID"),
        time: `${b.timeStart} - ${b.timeEnd}`,
        status: b.status,
        price: `Rp ${(b.field?.price ?? 0).toLocaleString("id-ID")}`,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="riwayat-booking-${
          from || "all"
        }-${to || "now"}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("❌ Export Excel Error:", err);
    return NextResponse.json(
      { error: "Failed to export Excel" },
      { status: 500 }
    );
  }
}
