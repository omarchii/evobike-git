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

// 🔥 agarra id desde params (si sirve) o desde la URL (fallback seguro)
async function getId(req: NextRequest, ctx: any) {
  const p = await ctx?.params; // si params es Promise, esto lo resuelve; si no, no pasa nada
  let id = p?.id;

  if (!id) {
    const pathname = req.nextUrl?.pathname ?? new URL(req.url).pathname;
    id = pathname.split("/").filter(Boolean).pop();
  }

  return typeof id === "string" ? id : "";
}

export async function PUT(req: NextRequest, ctx: any) {
  try {
    const me = await requireUser();
    if (!me) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const id = await getId(req, ctx);
    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

    const body = await req.json().catch(() => null);

    const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";
    const telefono = typeof body?.telefono === "string" ? body.telefono.trim() : null;
    const correo = typeof body?.correo === "string" ? body.correo.trim().toLowerCase() : null;
    const direccion = typeof body?.direccion === "string" ? body.direccion.trim() : null;
    const notas = typeof body?.notas === "string" ? body.notas.trim() : null;

    if (!nombre) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    // asegurar que sea de SU sucursal
    const existing = await prisma.cliente.findFirst({
      where: { id, sucursalId: me.sucursalId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: { nombre, telefono, correo, direccion, notas },
    });

    return NextResponse.json({ ok: true, cliente });
  } catch (e) {
    console.error("PUT /api/clientes/[id] error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: any) {
  try {
    const me = await requireUser();
    if (!me) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const id = await getId(req, ctx);
    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

    const existing = await prisma.cliente.findFirst({
      where: { id, sucursalId: me.sucursalId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    await prisma.cliente.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/clientes/[id] error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
