import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function PATCH(req: Request, context: any) {
  try {
    // ✅ Next.js 16 params adalah Promise
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
    }

    // ✅ Update status ke APPROVED
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: "APPROVED" },
      include: { user: true, field: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // ✅ Generate QR Code
    const qrBase64 = await QRCode.toDataURL(booking.id);
    const qrBuffer = Buffer.from(qrBase64.split(",")[1], "base64");

    // ✅ Buat PDF Ticket tanpa Helvetica.afm error
    const doc = new PDFDocument({ size: "A5", margin: 40 });
    const buffers: Buffer[] = [];
    doc.on("data", (chunk) => buffers.push(chunk));

    // ✅ Coba pakai font sistem yang aman
    try {
      const fontPaths = [
        "C:\\Windows\\Fonts\\arial.ttf", // Windows
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", // Linux
        path.join(process.cwd(), "public", "fonts", "Arial.ttf"), // fallback proyek
      ];

      const foundFont = fontPaths.find((f) => fs.existsSync(f));

      if (foundFont) {
        doc.registerFont("SafeFont", foundFont);
        doc.font("SafeFont");
      } else {
        console.warn("⚠️ Font lokal tidak ditemukan, fallback ke Times-Roman");
        doc.font("Times-Roman");
      }
    } catch (err) {
      console.warn("⚠️ Font load gagal, fallback ke Times-Roman:", err);
      doc.font("Times-Roman");
    }

    // ✅ Header
    doc.rect(0, 0, doc.page.width, 60).fill("#1e3a8a");
    doc.fillColor("white").fontSize(20).text("SPORTBOOK E-TICKET", 40, 20);
    doc.moveDown(2);

    // ✅ QR Code
    doc.image(qrBuffer, 150, 110, { width: 100, height: 100 });

    // ✅ Informasi booking
    const info: [string, string][] = [
      ["Nama", booking.user?.name ?? booking.user?.email ?? "-"],
      ["Lapangan", booking.field?.name ?? "-"],
      ["Tanggal", booking.date.toISOString().slice(0, 10)],
      ["Waktu", `${booking.timeStart} - ${booking.timeEnd}`],
      ["Harga", `Rp ${(booking.field?.price ?? 0).toLocaleString("id-ID")}`],
      ["Status", "✅ Disetujui"],
    ];

    let y = 230;
    for (const [label, val] of info) {
      doc.fillColor("#111827").fontSize(12).text(`${label}:`, 40, y);
      doc.fillColor("#2563eb").text(val, 140, y);
      y += 22;
    }

    // ✅ Footer
    doc.moveDown(2);
    doc.fontSize(10)
      .fillColor("#374151")
      .text("Terima kasih telah menggunakan SportBook!", { align: "center" })
      .text("Tunjukkan E-Ticket ini saat Check-in.", { align: "center" });

    doc.end();

    // ✅ Tunggu PDF selesai
    const pdfBuffer = await new Promise<Buffer>((resolve) =>
      doc.on("end", () => resolve(Buffer.concat(buffers)))
    );

    // ✅ Kirim email ke user
    await sendMail({
      to: booking.user.email,
      subject: "E-Ticket SportBook — Booking Anda Disetujui ✅",
      html: `
        <h3>Halo ${booking.user.name ?? booking.user.email},</h3>
        <p>Booking Anda telah <b style="color:#16a34a">DITERIMA</b>.</p>
        <p>E-Ticket terlampir. Tunjukkan QR Code saat check-in.</p>
      `,
      attachments: [
        {
          filename: `E-Ticket-${booking.id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "✅ Booking disetujui & e-ticket berhasil dikirim.",
    });
  } catch (error) {
    console.error("❌ Approve booking error:", error);
    return NextResponse.json(
      { error: "Gagal approve booking" },
      { status: 500 }
    );
  }
}
