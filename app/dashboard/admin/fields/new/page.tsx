"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddFieldPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function uploadImage() {
    const formData = new FormData();
    formData.append("file", file!);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    let imageUrl = "";
    if (file) {
      imageUrl = await uploadImage();
    }

    await fetch("/api/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, location, image: imageUrl }),
    });

    router.push("/dashboard/admin/fields");
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-bold mb-4">Tambah Lapangan</h1>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          required placeholder="Nama Lapangan"
          className="w-full p-2 border rounded"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          required type="number" placeholder="Harga"
          className="w-full p-2 border rounded"
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          placeholder="Lokasi"
          className="w-full p-2 border rounded"
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          type="file" accept="image/*"
          className="w-full p-2 border rounded"
          onChange={(e) => setFile(e.target.files?.[1] || e.target.files?.[0] || null)}
        />

        <button className="bg-indigo-600 px-4 py-2 text-white rounded w-full">
          Simpan
        </button>
      </form>
    </div>
  );
}
