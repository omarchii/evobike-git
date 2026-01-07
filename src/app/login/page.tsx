"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (!r.ok) {
        const data = await r.json().catch(() => null);
        setError(data?.error || "Credenciales inválidas.");
        setLoading(false);
        return;
      }

      router.push("/clientes");
    } catch {
      setError("Error de red. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-[#eef6f1] relative overflow-hidden">
      {/* Fondo base + hojas */}
      <div className="pointer-events-none absolute inset-0">
        {/* glow suave */}
        <div className="absolute -top-28 -left-28 h-[420px] w-[420px] rounded-full bg-emerald-200/45 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-emerald-100/75 blur-3xl" />
        <div className="absolute top-14 right-16 h-[220px] w-[220px] rounded-full bg-emerald-300/20 blur-2xl" />

        {/* hojas */}
        <div
          className="absolute inset-0 opacity-[1] bg-no-repeat bg-cover bg-center"
          style={{ backgroundImage: "url('/leaves.png')" }}
        />
      </div>

      {/* Card principal */}
      <section className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center p-6">
        <div className="w-full overflow-hidden rounded-[28px] border border-black/10 bg-white/70 shadow-[0_22px_70px_rgba(0,0,0,0.14)] backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Izquierda: Login */}
            <div className="p-10 md:p-12">
              {/* Logo */}
              <div className="flex justify-center">
                <Image
                  src="/evobike-logo.webp"
                  alt="Evobike"
                  width={260}
                  height={90}
                  priority
                  className="h-auto w-[240px] md:w-[270px]"
                />
              </div>

              <div className="mt-8 max-w-md mx-auto">
                <h1 className="text-3xl font-semibold text-[#1a3b2f]">
                  Iniciar Sesión
                </h1>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  {/* Email */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2f6a54]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M4 6h16v12H4V6Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                        <path
                          d="m4 7 8 6 8-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="Correo"
                      className="w-full rounded-xl border border-black/10 bg-white/80 px-11 py-3 text-[#1f2d27] outline-none placeholder:text-black/35 focus:border-emerald-500/40 focus:bg-white"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2f6a54]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M7 11V8a5 5 0 0 1 10 0v3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M6 11h12v10H6V11Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPass ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      placeholder="Contraseña"
                      className="w-full rounded-xl border border-black/10 bg-white/80 px-11 py-3 pr-12 text-[#1f2d27] outline-none placeholder:text-black/35 focus:border-emerald-500/40 focus:bg-white"
                    />

                    {/* ✅ Botón ojo FIX: z-index + área clickeable + no submit */}
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-auto cursor-pointer p-2 rounded-lg text-black/45 hover:text-black/70 hover:bg-black/5"
                      aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#2f6a54] py-3 font-semibold text-white shadow-[0_12px_28px_rgba(47,106,84,0.25)] hover:bg-[#2a5e4b] disabled:opacity-60"
                  >
                    {loading ? "Entrando..." : "Iniciar Sesión"}
                  </button>

                  <div className="pt-2 text-center">
                    <Link href="#" className="text-sm text-[#2f6a54] hover:underline">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  <div className="pt-8 text-center text-xs text-black/40">
                    © {new Date().getFullYear()} Evobike POS · Todos los derechos reservados.
                  </div>
                </form>
              </div>
            </div>

            {/* Derecha: Hero */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/70 via-white/20 to-emerald-100/60" />
              <div
                className="absolute inset-0 opacity-[0.18] bg-no-repeat bg-cover bg-center"
                style={{ backgroundImage: "url('/leaves.png')" }}
              />

              <div className="relative h-full">
                <div className="absolute right-10 top-1/2 h-[360px] w-[360px] -translate-y-1/2 rounded-full bg-emerald-200/25 blur-3xl" />

                {/* ✅ Tailwind fix: -right-45 no existe */}
                <div className="absolute bottom-0 -right-10 lg:-right-16 xl:-right-24 p-8">
                  <div className="relative w-[820px] max-w-[70vw] h-[620px]">
                    <Image
                      src="/login-hero.png"
                      alt="Evobike"
                      fill
                      priority
                      className="object-contain translate-x-10 lg:translate-x-16 xl:translate-x-24 drop-shadow-[0_30px_55px_rgba(0,0,0,0.22)]"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* fin hero */}
          </div>
        </div>
      </section>
    </main>
  );
}
