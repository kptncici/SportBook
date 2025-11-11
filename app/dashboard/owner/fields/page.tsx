"use client";

import { useState, useEffect } from "react";

export default function FieldsPage() {
  const [fields, setFields] = useState([]);
  const [form, setForm] = useState({ name: "", location: "", price: "" });

  async function load() {
    const res = await fetch("/api/fields");
    setFields(await res.json());
  }

  async function createField(e: any) {
    e.preventDefault();
    await fetch("/api/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", location: "", price: "" });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Kelola Lapangan</h1>

      <form onSubmit={createField} className="flex gap-3 mb-6">
        <input
          placeholder="Nama Lapangan"
          className="border p-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Lokasi"
          className="border p-2 rounded"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <input
          type="number"
          placeholder="Harga"
          className="border p-2 rounded"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <button className="bg-indigo-600 text-white px-4 rounded">
          Tambah
        </button>
      </form>

      <table className="w-full text-sm bg-white border rounded">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2">Nama</th>
            <th className="p-2">Lokasi</th>
            <th className="p-2">Harga</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f: any) => (
            <tr key={f.id} className="border-t">
              <td className="p-2">{f.name}</td>
              <td className="p-2">{f.location}</td>
              <td className="p-2">Rp {f.price.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
