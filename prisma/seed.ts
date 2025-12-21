import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL!, max: 5 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const leona = await prisma.sucursal.upsert({
    where: { codigo: "LEO" },
    update: { nombre: "Leona Vicario" },
    create: {
      nombre: "Leona Vicario",
      codigo: "LEO",
      folio: { create: { ultimoNumero: 0 } },
    },
  });

  await prisma.sucursal.upsert({
    where: { codigo: "AV135" },
    update: { nombre: "Av. 135" },
    create: {
      nombre: "Av. 135",
      codigo: "AV135",
      folio: { create: { ultimoNumero: 0 } },
    },
  });

  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.usuario.upsert({
    where: { email: "admin@evobike.mx" },
    update: { nombre: "Admin EVOBIKE", passwordHash, rol: "ADMIN" },
    create: {
      nombre: "Admin EVOBIKE",
      email: "admin@evobike.mx",
      passwordHash,
      rol: "ADMIN",
      sucursalId: leona.id,
    },
  });

  console.log("Seed listo ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
