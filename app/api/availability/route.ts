import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const SLOTS = [
  { start: "08:00", end: "09:00" },
  { start: "09:00", end: "10:00" },
  { start: "14:00", end: "15:00" },
  { start: "19:00", end: "20:00" },
]

export async function POST(req: Request) {
  const { date, fieldId } = await req.json()

  const bookings = await prisma.booking.findMany({
    where: { fieldId, date: new Date(date) },
    select: { timeStart: true, status: true }
  })

  const availability = SLOTS.map(slot => {
    const booked = bookings.find(b => b.timeStart === slot.start)

    if (!booked) return { ...slot, status: "Tersedia" }
    if (booked.status === "PENDING") return { ...slot, status: "Pending" }
    if (booked.status === "APPROVED") return { ...slot, status: "Booked" }

    return { ...slot, status: "Tersedia" }
  })

  return NextResponse.json(availability)
}
