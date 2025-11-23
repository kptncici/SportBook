import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateAndSendInvoice } from "@/lib/invoice";

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, field: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    await generateAndSendInvoice(booking);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error generate invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
