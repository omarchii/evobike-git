import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    const user = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nombre: true,
        rol: true,
        sucursalId: true,
        passwordHash: true,
      },
    });

    // ✅ OJO: aquí va con !
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, nombre: user.nombre, rol: user.rol, sucursalId: user.sucursalId },
    });

    res.cookies.set("evobike_uid", String(user.id), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

