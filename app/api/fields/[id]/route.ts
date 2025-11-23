import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Tipe params yang benar
type Params = {
  params: { id: string };
};

// Ambil 1 field
export async function GET(req: Request, { params }: Params) {
  try {
    const field = await prisma.field.findUnique({
      where: { id: params.id },
    });

    return NextResponse.json(field);
  } catch (err) {
    console.error("GET field error:", err);
    return NextResponse.json({ error: "Failed to load field" }, { status: 500 });
  }
}

// Update field
export async function PUT(req: Request, { params }: Params) {
  try {
    const data = await req.json();

    const field = await prisma.field.update({
      where: { id: params.id },
      data: {
        name: data.name,
        location: data.location,
        price: Number(data.price),
      },
    });

    return NextResponse.json({ message: "Updated", field });
  } catch (err) {
    console.error("UPDATE field error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// Hapus field
export async function DELETE(req: Request, { params }: Params) {
  try {
    await prisma.field.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE field error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
