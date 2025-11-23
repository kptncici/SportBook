import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Ambil 1 field
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // WAJIB DI-AWAIT

    const field = await prisma.field.findUnique({
      where: { id },
    });

    return NextResponse.json(field);
  } catch (err) {
    console.error("GET field error:", err);
    return NextResponse.json(
      { error: "Failed to load field" },
      { status: 500 }
    );
  }
}

// Update field
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // WAJIB DI-AWAIT
    const data = await req.json();

    const field = await prisma.field.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location,
        price: Number(data.price),
      },
    });

    return NextResponse.json({ message: "Updated", field });
  } catch (err) {
    console.error("UPDATE field error:", err);
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}

// Hapus field
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // WAJIB DI-AWAIT

    await prisma.field.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE field error:", err);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
