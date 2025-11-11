import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>
}

// ✅ GET field by id
export async function GET(req: Request, context: Params) {
  const { id } = await context.params;

  const field = await prisma.field.findUnique({
    where: { id }
  });

  return NextResponse.json(field);
}

// ✅ UPDATE field
export async function PUT(req: Request, context: Params) {
  const { id } = await context.params;
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
}

// ✅ DELETE field
export async function DELETE(req: Request, context: Params) {
  const { id } = await context.params;

  await prisma.field.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Deleted" });
}
