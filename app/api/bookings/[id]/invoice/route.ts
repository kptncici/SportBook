import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { user: true, field: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // === Font aman ===
    let fontPath: string | null = null;
    const winFont = "C:\\Windows\\Fonts\\arial.ttf";
    const linuxFont = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
    const bundledFont = path.join(process.cwd(), "public", "fonts", "DejaVuSans.ttf");
    if (fs.existsSync(winFont)) fontPath = winFont;
    else if (fs.existsSync(linuxFont)) fontPath = linuxFont;
    else if (fs.existsSync(bundledFont)) fontPath = bundledFont;

    // === Init PDF ===
    const doc = new PDFDocument({
      size: "A5",
      layout: "portrait",
      margin: 40,
      font: fontPath || "Times-Roman",
    });

    const buffers: Buffer[] = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    const endPromise = new Promise<Buffer>((resolve) =>
      doc.on("end", () => resolve(Buffer.concat(buffers)))
    );

    // === Header ===
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 30, { width: 60 });
    }

    doc
      .fontSize(20)
      .fillColor("#1E3A8A")
      .text("SPORTBOOK", 110, 40)
      .fontSize(10)
      .fillColor("#555")
      .text("E-Ticket Booking Lapangan", 110, 65);

    doc.moveDown(2);

    // === Garis Pembatas ===
    doc
      .moveTo(40, 100)
      .lineTo(380, 100)
      .strokeColor("#1E3A8A")
      .stroke();

    // === Info Utama ===
    const infoY = 120;
    doc.fontSize(12).fillColor("#111");

    const info = [
      [`Nama`, booking.user?.name ?? booking.user?.email ?? "-"],
      [`Lapangan`, booking.field?.name ?? "-"],
      [`Tanggal`, booking.date.toISOString().slice(0, 10)],
      [`Waktu`, `${booking.timeStart} - ${booking.timeEnd}`],
      [`Status`, booking.status],
      [`Booking ID`, booking.id],
    ];

    info.forEach(([label, value], i) => {
      doc.text(`${label}:`, 50, infoY + i * 25);
      doc.text(value, 160, infoY + i * 25);
    });

    // === Harga ===
    const price = booking.field?.price ?? 0;
    doc
      .fontSize(12)
      .fillColor("#1E3A8A")
      .text("Total Pembayaran", 50, infoY + 160);
    doc
      .fontSize(16)
      .fillColor("#111")
      .text(`Rp ${price.toLocaleString("id-ID")}`, 50, infoY + 180);

    // === QR Code ===
    const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify/${booking.id}`;
    const qrData = await QRCode.toDataURL(verifyUrl);
    const qrImage = Buffer.from(qrData.split(",")[1], "base64");
    doc.image(qrImage, 230, infoY + 140, { width: 100 });

    doc
      .fontSize(8)
      .fillColor("#666")
      .text("Scan untuk verifikasi booking", 230, infoY + 245, {
        width: 120,
        align: "center",
      });

    // === Footer ===
    doc
      .fontSize(10)
      .fillColor("#555")
      .text("Terima kasih telah menggunakan SportBook", 0, 400, {
        align: "center",
      });

    // === End ===
    doc.end();
    const pdfBuffer = await endPromise;
    const pdfBytes = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="eticket-${booking.id}.pdf"`,
      },
    });
  } catch (err) {
    console.error("❌ E-Ticket Error:", err);
    return NextResponse.json({ error: "Failed to generate E-Ticket" }, { status: 500 });
  }
}
