"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function EditFieldPage() {
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState({
    name: "",
    location: "",
    price: ""
  });

  // load existing field data
  useEffect(() => {
    async function fetchField() {
      const res = await fetch(`/api/fields/${id}`);
      const data = await res.json();
      setForm({
        name: data.name,
        location: data.location,
        price: String(data.price),
      });
    }
    fetchField();
  }, [id]);

  async function updateField() {
    await fetch(`/api/fields/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    alert("Berhasil update lapangan!");
    router.push("/dashboard/admin/fields");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Edit Lapangan</h1>

      <div className="bg-white p-4 shadow rounded-lg">
        <input
          className="border p-2 mb-2 rounded w-full"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nama lapangan"
        />

        <input
          className="border p-2 mb-2 rounded w-full"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Lokasi"
        />

        <input
          type="number"
          className="border p-2 mb-2 rounded w-full"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Harga"
        />

        <div className="flex gap-2 mt-3">
          <Button onClick={updateField}>Simpan Perubahan</Button>
          <Button
            onClick={() => router.push("/dashboard/admin/fields")}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}
