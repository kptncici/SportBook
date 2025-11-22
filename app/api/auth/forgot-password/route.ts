import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "Email tidak terdaftar" },
        { status: 404 }
      );
    }

    // 🔐 Generate token reset password
    const token = crypto.randomBytes(32).toString("hex");
    const expire = new Date(Date.now() + 30 * 60 * 1000); // 30 menit

    // 🔄 Simpan token ke database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expire,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${token}`;

    // 📩 Kirim email
    await sendMail({
      to: email,
      subject: "Reset Password SportBook",
      html: `
        <h3>Reset Password</h3>
        <p>Klik link berikut untuk reset password:</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        <p>Link hanya berlaku selama <b>30 menit</b>.</p>
      `,
    });

    return NextResponse.json({
      message: "Email reset password telah dikirim!",
    });
  } catch (error) {
    console.error("Forgot-password error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
