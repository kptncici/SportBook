import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { sendMail } from "@/lib/mailer";

export async function generateAndSendInvoice(booking: any) {
  // ✅ Pastikan tanggal valid
  const bookingDate =
    booking.date instanceof Date ? booking.date : new Date(booking.date);

  // ✅ Buat QR Code
  const qrData = `SportBook-Invoice-${booking.id}`;
  const qrBase64 = await QRCode.toDataURL(qrData);
  const qrBytes = Buffer.from(qrBase64.split(",")[1], "base64");

  // ✅ Buat PDF baru
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([500, 700]);

  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdf.embedFont(StandardFonts.Helvetica);
  const qrImage = await pdf.embedPng(qrBytes);

  const blue = rgb(0.0, 0.35, 0.9);

  // 🔵 Header
  page.drawRectangle({ x: 0, y: 640, width: 500, height: 60, color: blue });
  page.drawText("SportBook — Invoice Pembayaran", {
    x: 90,
    y: 660,
    font: fontBold,
    size: 16,
    color: rgb(1, 1, 1),
  });

  // 🧾 QR Code di tengah
  page.drawImage(qrImage, { x: 190, y: 470, width: 120, height: 120 });

  // 📄 Informasi booking
  const info: Array<[string, string]> = [
    ["Nama", booking.user?.name ?? booking.user?.email],
    ["Lapangan", booking.field?.name],
    ["Tanggal", bookingDate.toISOString().slice(0, 10)],
    ["Jam", `${booking.timeStart} - ${booking.timeEnd}`],
    ["Harga", `Rp ${booking.field?.price?.toLocaleString("id-ID")}`],
    ["Status", booking.status],
    ["Booking ID", booking.id],
  ];

  let y = 420;
  for (const [label, val] of info) {
    page.drawText(`${label}:`, { x: 70, y, font: fontBold, size: 12 });
    page.drawText(val || "-", { x: 180, y, font: fontReg, size: 12 });
    y -= 25;
  }

  // 📘 Footer (tanpa emoji agar tidak error)
  page.drawText("Terima kasih telah melakukan pembayaran di SportBook.", {
    x: 70,
    y: 40,
    font: fontReg,
    size: 11,
  });
  page.drawText("Simpan invoice ini sebagai bukti transaksi resmi Anda.", {
    x: 70,
    y: 25,
    font: fontReg,
    size: 10,
  });

  // ✅ Simpan PDF ke buffer
  const pdfBytes = await pdf.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  // ✅ Kirim Email ke User
  await sendMail({
    to: booking.user.email,
    subject: "Invoice Pembayaran SportBook ✅",
    html: `
      <div style="font-family:Inter,Arial,sans-serif">
        <h2>Halo ${booking.user.name ?? booking.user.email},</h2>
        <p>Pembayaran Anda telah kami terima 🎉</p>
        <ul>
          <li><b>Lapangan:</b> ${booking.field.name}</li>
          <li><b>Tanggal:</b> ${bookingDate.toISOString().slice(0, 10)}</li>
          <li><b>Jam:</b> ${booking.timeStart} - ${booking.timeEnd}</li>
          <li><b>Harga:</b> Rp ${booking.field.price.toLocaleString("id-ID")}</li>
        </ul>
        <p>Invoice terlampir pada email ini, dan juga bisa diunduh melalui dashboard SportBook Anda.</p>
        <p>Terima kasih telah mempercayai SportBook ⚽</p>
      </div>
    `,
    attachments: [
      {
        filename: `invoice-${booking.id}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  console.log(`📤 Invoice terkirim ke ${booking.user.email}`);
}
