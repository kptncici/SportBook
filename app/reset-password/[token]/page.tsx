"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");

  async function submit(e: any) {
    e.preventDefault();

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Password berhasil direset!");
      router.push("/login");
    } else {
      alert(data.error);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={submit} className="space-y-4 p-6 border rounded w-80">
        <h1 className="text-xl font-bold">Reset Password</h1>

        <Input
          type="password"
          placeholder="Password baru"
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button className="w-full">Reset Password</Button>
      </form>
    </div>
  );
}
