"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  async function submit(e: any) {
    e.preventDefault();

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    alert(data.message);
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={submit} className="space-y-4 p-6 border rounded w-80">
        <h1 className="text-xl font-bold">Lupa Password</h1>

        <Input
          type="email"
          placeholder="Masukkan Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button className="w-full">Kirim Link Reset</Button>
      </form>
    </div>
  );
}
