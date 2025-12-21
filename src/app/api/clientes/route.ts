import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";

async function requireUser() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("evobike_uid")?.value;
  if (!uid) return null;

  const user = await prisma.usuario.findUnique({
    where: { id: uid },
    select: { id: true, sucursalId: true },
  });

  if (!user?.sucursalId) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const me = await requireUser();
  if (!me) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  const clientes = await prisma.cliente.findMany({
    where: {
      sucursalId: me.sucursalId,
      ...(q
        ? {
            OR: [
              { nombre: { contains: q, mode: "insensitive" } },
              { correo: { contains: q, mode: "insensitive" } },
              { telefono: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ ok: true, clientes });
}

export async function POST(req: NextRequest) {
  try {
    const me = await requireUser();
    if (!me) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json().catch(() => null);

    const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";
    const telefono = typeof body?.telefono === "string" ? body.telefono.trim() : null;
    const correo = typeof body?.correo === "string" ? body.correo.trim().toLowerCase() : null;
    const direccion = typeof body?.direccion === "string" ? body.direccion.trim() : null;
    const notas = typeof body?.notas === "string" ? body.notas.trim() : null;

    if (!nombre) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    const cliente = await prisma.cliente.create({
      data: { nombre, telefono, correo, direccion, notas, sucursalId: me.sucursalId },
    });

    return NextResponse.json({ ok: true, cliente }, { status: 201 });
  } catch (e) {
    console.error("POST /api/clientes error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
