import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const fields = [
    { name: "Lapangan 1", price: 50000 },
    { name: "Lapangan 2", price: 50000 },
  ]
  for (const f of fields) {
    await prisma.field.upsert({
      where: { name: f.name },
      update: {},
      create: f
    })
  }
}
main().finally(()=>prisma.$disconnect())
