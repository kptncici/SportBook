"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      alert("Semua field harus diisi!");
      return;
    }

    setLoading(true);

    try {
      // 🔹 Register user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Registrasi gagal!");
        setLoading(false);
        return;
      }

      // ===============================
      // 🔥 AUTO LOGIN SETELAH REGISTER
      // ===============================
      const login = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (login?.error) {
        alert("Akun dibuat, tapi auto-login gagal. Silakan login manual.");
        router.push("/login");
        return;
      }

      // 🔥 Jika auto-login sukses → langsung ke dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Register error:", err);
      alert("Terjadi kesalahan server!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-700 to-blue-900">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-80 shadow-xl text-white animate-fade-in"
      >
        <h1 className="text-2xl font-bold text-center tracking-wide drop-shadow-md">
          BUAT AKUN BARU
        </h1>

        <Input
          className="bg-white/20 text-white placeholder-white/60 border-white/30 focus:ring-white"
          placeholder="Nama Lengkap"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Input
          type="email"
          className="bg-white/20 text-white placeholder-white/60 border-white/30 focus:ring-white"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <Input
          type="password"
          className="bg-white/20 text-white placeholder-white/60 border-white/30 focus:ring-white"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <Button
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg shadow-lg transition-all"
          disabled={loading}
        >
          {loading ? "Memproses..." : "Daftar"}
        </Button>

        <p className="text-center text-sm text-gray-200">
          Sudah punya akun?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-green-300 cursor-pointer hover:text-green-200"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
