import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ MUST await

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { field: true, user: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // ✅ QR Code
  const qrData = `SportBook-${booking.id}`;
  const qrBase64 = await QRCode.toDataURL(qrData);
  const qrBytes = Buffer.from(qrBase64.split(",")[1], "base64");

  // ✅ Create PDF
  const pdf = await PDFDocument.create();
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdf.embedFont(StandardFonts.Helvetica);
  const qrImg = await pdf.embedPng(qrBytes);

  const page = pdf.addPage([420, 600]);
  const primary = rgb(0.11, 0.36, 0.9);

  // Header
  page.drawRectangle({ x: 0, y: 540, width: 420, height: 60, color: primary });
  page.drawText("SportBook - E-Ticket", {
    x: 120,
    y: 560,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // QR
  page.drawImage(qrImg, { x: 150, y: 350, width: 120, height: 120 });

  // Details
  const info = [
    ["Nama", booking.user.name],
    ["Lapangan", booking.field.name],
    ["Tanggal", booking.date.toISOString().slice(0, 10)],
    ["Waktu", `${booking.timeStart} - ${booking.timeEnd}`],
    ["Status", booking.status],
    ["Booking ID", booking.id],
  ];

  let y = 310;
  info.forEach(([label, val]) => {
    page.drawText(`${label}:`, { x: 50, y, size: 12, font: fontBold });
    page.drawText(String(val), { x: 150, y, size: 12, font: fontReg });
    y -= 25;
  });

  // Watermark
  page.drawText("SPORTBOOK", {
    x: 80,
    y: 250,
    size: 40,
    font: fontBold,
    color: rgb(0.8, 0.8, 0.8),
    opacity: 0.15,
  });

  // Signature
  page.drawText("Disetujui oleh Admin", {
    x: 240,
    y: 90,
    size: 10,
    font: fontReg,
  });
  page.drawLine({
    start: { x: 240, y: 110 },
    end: { x: 360, y: 110 },
    thickness: 1,
  });

  // Footer
  page.drawRectangle({ x: 0, y: 0, width: 420, height: 40, color: rgb(0.95, 0.95, 0.95) });
  page.drawText("Terima kasih telah booking di SportBook!", {
    x: 60,
    y: 15,
    size: 12,
    font: fontReg,
  });

  const bytes = await pdf.save();
  const file = Buffer.from(bytes);

  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=e-ticket-${booking.id}.pdf`,
    },
  });
}
