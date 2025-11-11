"use client"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })

  async function handleSubmit(e: any) {
    e.preventDefault()

    const res: any = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password
    })

    if (!res.error) router.push("/dashboard")
    else alert("Invalid credentials")
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded w-80">
        <h1 className="text-xl font-bold">Login</h1>

        <Input type="email" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <Button className="w-full">Login</Button>
      </form>
    </div>
  )
}
