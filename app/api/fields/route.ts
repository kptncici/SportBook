import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const fields = await prisma.field.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(fields);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, location, price } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Nama & harga wajib diisi" }, { status: 400 });
    }

    const field = await prisma.field.create({
      data: {
        name,
        location,
        price: Number(price),
      },
    });

    return NextResponse.json(field, { status: 201 });
  } catch (err) {
    console.error("POST field error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
