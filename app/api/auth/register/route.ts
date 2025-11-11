import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { signIn } from "next-auth/react"; // ✅ biar bisa auto-login
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    // 🔹 Jika user lama masih login, logout dulu
    const session = await getServerSession(authOptions);
    if (session) {
      console.log("🧹 Logout session lama sebelum register:", session.user.email);
    }

    // 🔹 Cek apakah email sudah terdaftar
    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
    }

    // 🔹 Hash password
    const hashed = await hash(password, 10);

    // 🔹 Simpan user baru ke database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "USER",
      },
    });

    console.log("✅ User baru dibuat:", newUser.email);

    // 🔹 Langsung login otomatis
    const loginResponse = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (loginResponse?.error) {
      console.error("⚠️ Auto-login gagal:", loginResponse.error);
      return NextResponse.json(
        { success: true, message: "Akun berhasil dibuat, silakan login manual." },
        { status: 200 }
      );
    }

    // ✅ Register + auto-login sukses
    return NextResponse.json(
      { success: true, message: "Akun berhasil dibuat dan login otomatis." },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
