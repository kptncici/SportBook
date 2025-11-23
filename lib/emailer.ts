import nodemailer from "nodemailer";

export async function sendBookingEmail(
  email: string,
  pdfBuffer: Buffer,
  bookingId: string
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // 🟩 FIX UTAMA - konsisten
      to: email,
      subject: `E-Ticket Booking #${bookingId}`,
      html: `
        <h2>Terima kasih telah booking di <b>SportBook</b>!</h2>
        <p>Berikut adalah e-ticket kamu:</p>
        <p><b>Booking ID:</b> ${bookingId}</p>
        <p>Silakan download tiket terlampir.</p>
      `,
      attachments: [
        {
          filename: `ticket-${bookingId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf", // 🟩 tambahan biar aman di Gmail
        },
      ],
    });

    console.log("✅ Email terkirim ke:", email);
  } catch (err) {
    console.error("❌ Gagal kirim email:", err);
  }
}
