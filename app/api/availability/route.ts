import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const SLOTS = [
  { label: "08:00 - 09:00", start: "08:00", end: "09:00" },
  { label: "09:00 - 10:00", start: "09:00", end: "10:00" },
  { label: "14:00 - 15:00", start: "14:00", end: "15:00" },
  { label: "19:00 - 20:00", start: "19:00", end: "20:00" },
];

export async function POST(req: Request) {
  try {
    const { fieldId, date } = await req.json();

    if (!fieldId || !date) {
      return NextResponse.json({ error: "FieldId dan tanggal wajib diisi" }, { status: 400 });
    }

    const selectedDate = new Date(date);
    const now = new Date();

    const isToday = selectedDate.toDateString() === now.toDateString();
    const nowTime = now.toTimeString().slice(0, 5); // "HH:MM"

    // ⏳ Ambil semua booking hari itu
    const bookings = await prisma.booking.findMany({
      where: {
        fieldId,
        date: selectedDate,
        status: { notIn: ["REJECTED", "CANCELED"] },
      },
      select: { timeStart: true, timeEnd: true, status: true },
    });

    // 🔍 Tentukan status tiap slot
    const availability = SLOTS.map((s) => {
      let status = "Tersedia";

      // ❌ Jika hari ini dan jam slot sudah lewat
      if (isToday && s.end <= nowTime) {
        status = "Lewat Waktu";
        return { ...s, status };
      }

      // ❌ Cek bentrok booking (true overlap)
      const overlap = bookings.find(
        (b) => b.timeStart < s.end && b.timeEnd > s.start
      );

      if (overlap) {
        if (overlap.status === "PENDING") status = "Pending";
        if (overlap.status === "APPROVED") status = "Booked";
      }

      return { ...s, status };
    });

    return NextResponse.json(availability);
  } catch (err) {
    console.error("Availability Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
