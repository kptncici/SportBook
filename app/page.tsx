"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const slides = ["/w4.jpeg", "/w5.jpeg"]; // hanya 2 gambar bro

export default function PortalPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  // Auto-slide tiap 3 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/stadium.jpg')",
      }}
    >
      {/* Overlay Gelap */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 max-w-2xl text-center text-white px-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/sportbook-logo.png"
            width={140}
            height={140}
            alt="SportBook Logo"
            className="drop-shadow-lg"
          />
        </div>

        {/* Judul */}
        <h1 className="text-4xl font-extrabold leading-tight drop-shadow-lg">
          Selamat Datang di <span className="text-green-400">SportBook</span>
        </h1>

        <p className="mt-3 text-lg text-gray-200">
          Booking lapangan futsal dengan cepat, mudah, dan nyaman.
        </p>

        {/* 🔥 FULL ILLUSTRATION SLIDER (tanpa kotak) */}
        <div className="mt-10 relative w-full h-[260px] overflow-hidden">
          <Image
            src={slides[current]}
            alt="Sport Slide"
            fill
            className="object-contain transition-all duration-700 ease-in-out"
          />
        </div>

        {/* Tombol */}
        <div className="mt-10 flex flex-col gap-4">
          <Button
            onClick={() => router.push("/login")}
            className="text-lg py-6 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg"
          >
            Masuk Sekarang
          </Button>

          <Button
            onClick={() => router.push("/register")}
            className="text-lg py-6 bg-green-500 hover:bg-green-600 rounded-xl shadow-lg"
          >
            Daftar Akun Baru
          </Button>
        </div>
      </div>
    </div>
  );
}
