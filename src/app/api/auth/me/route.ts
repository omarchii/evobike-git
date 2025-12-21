import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const cookieStore = await cookies(); // ✅ en Next 15/16 se hace await
  const uid = cookieStore.get("evobike_uid")?.value;

  if (!uid) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const user = await prisma.usuario.findUnique({
    where: { id: uid },
    select: { id: true, 
      nombre: true, 
      email: true,
      rol: true, 
      sucursalId: true, 
      sucursal: { select: { codigo: true, nombre: true } },
    },
  });

  if (!user) { // ✅ estaba al revés
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true, user });
}
