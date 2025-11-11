"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/LogoutButton";

// ✅ Helper format Rupiah
const formatRupiah = (num?: number | string) => {
  const n = Number(num);
  if (isNaN(n)) return "Rp 0";
  return `Rp ${n.toLocaleString("id-ID")}`;
};

export default function FieldsPage() {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    price: "",
  });

  // ✅ Load data lapangan dari API
  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/fields", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setFields(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Load fields error:", err);
      alert("Gagal memuat data lapangan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ✅ Simpan lapangan baru
  async function saveField() {
    if (!form.name || !form.price) {
      alert("Nama & Harga wajib diisi!");
      return;
    }

    try {
      const res = await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price.replace(/\./g, "")), // pastikan jadi angka
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("✅ Lapangan berhasil ditambahkan!");
      setForm({ name: "", location: "", price: "" });
      load();
    } catch (err) {
      console.error("❌ Save field error:", err);
      alert("Gagal menyimpan lapangan.");
    }
  }

  // ✅ Hapus lapangan
  async function deleteField(id: string) {
    if (!confirm("Yakin ingin menghapus lapangan ini?")) return;
    try {
      const res = await fetch(`/api/fields/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      alert("🗑️ Lapangan dihapus.");
      load();
    } catch (err) {
      console.error("❌ Delete field error:", err);
      alert("Gagal menghapus lapangan.");
    }
  }

  // ✅ Format otomatis input harga saat diketik
  function handlePriceInput(value: string) {
    const raw = value.replace(/[^\d]/g, ""); // hanya angka
    const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setForm({ ...form, price: formatted });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manajemen Lapangan</h1>
        <LogoutButton />
      </div>

      {/* Form Tambah Lapangan */}
      <div className="bg-white p-5 rounded-xl shadow border">
        <h2 className="font-semibold mb-3 text-lg">Tambah Lapangan</h2>

        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <input
            className="border p-2 rounded w-full"
            placeholder="Nama Lapangan"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border p-2 rounded w-full"
            placeholder="Lokasi (opsional)"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <input
            className="border p-2 rounded w-full"
            placeholder="Harga (contoh: 200.000)"
            value={form.price}
            onChange={(e) => handlePriceInput(e.target.value)}
          />
        </div>

        <Button onClick={saveField} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Lapangan"}
        </Button>
      </div>

      {/* Tabel Data Lapangan */}
      <div className="bg-white rounded-xl shadow border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left p-3">Nama</th>
              <th className="text-left p-3">Lokasi</th>
              <th className="text-left p-3">Harga</th>
              <th className="text-left p-3">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {fields.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  {loading ? "Memuat data..." : "Belum ada lapangan"}
                </td>
              </tr>
            )}

            {fields.map((f) => (
              <tr key={f.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{f.name}</td>
                <td className="p-3">{f.location || "-"}</td>
                <td className="p-3 font-semibold">{formatRupiah(f.price)}</td>
                <td className="p-3 flex items-center gap-2">
                  <a
                    href={`/dashboard/admin/fields/${f.id}/edit`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </a>

                  <Button
                    onClick={() => deleteField(f.id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    Hapus
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
