import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validasi
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // Cek email sudah terdaftar
    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Email sudah digunakan" },
        { status: 400 }
      );
    }

    // Hash password
    const hashed = await hash(password, 10);

    // Buat user baru
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "USER", // default user
      },
    });

    console.log("✅ User baru berhasil dibuat:", email);

    // ⚡ Tidak melakukan auto-login di server!
    // Auto-login dilakukan di client setelah response success

    return NextResponse.json(
      { success: true, message: "Akun berhasil dibuat." },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
