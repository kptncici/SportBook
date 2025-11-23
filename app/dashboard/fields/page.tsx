"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/LogoutButton";

export default function FieldsPage() {
  const [fields, setFields] = useState([]);
  const [form, setForm] = useState({ name: "", location: "", price: "" });

  async function load() {
    const res = await fetch("/api/fields");
    setFields(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function saveField() {
    await fetch("/api/fields", {
      method: "POST",
      body: JSON.stringify({ 
        name: form.name, 
        location: form.location, 
        price: Number(form.price)
      }),
    });
    setForm({ name: "", location: "", price: "" });
    load();
  }

  async function deleteField(id: string) {
    await fetch(`/api/fields/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-5">
        <h1 className="text-xl font-bold">Manajemen Lapangan</h1>
        <LogoutButton />
      </div>

      {/* Form */}
      <div className="bg-white p-4 rounded-lg shadow mb-5">
        <h2 className="font-semibold mb-3">Tambah Lapangan</h2>
        <input
          className="border p-2 mr-2 rounded"
          placeholder="Nama Lapangan"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border p-2 mr-2 rounded"
          placeholder="Lokasi"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <input
          className="border p-2 mr-2 rounded"
          placeholder="Harga"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <Button onClick={saveField}>Simpan</Button>
      </div>

      {/* Table */}
      <table className="w-full bg-white text-sm rounded-lg shadow">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-2 text-left">Nama</th>
            <th className="p-2 text-left">Lokasi</th>
            <th className="p-2 text-left">Harga</th>
            <th className="p-2 text-left">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {fields.map((f: any) => (
            <tr key={f.id} className="border-b">
              <td className="p-2">{f.name}</td>
              <td className="p-2">{f.location}</td>
              <td className="p-2">Rp {f.price.toLocaleString("id-ID")}</td>
              <td className="p-2">
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => deleteField(f.id)}>
                  Hapus
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
