"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Cliente = {
  id: string;
  nombre: string;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
  notas?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type MeUser = {
  id: string;
  nombre: string;
  email?: string;
  rol: string;
  sucursalId?: string | null;
  sucursal?: { codigo: string; nombre: string } | null;
};

const emptyForm = {
  nombre: "",
  telefono: "",
  correo: "",
  direccion: "",
  notas: "",
};

export default function ClientesPage() {
  const router = useRouter();

  const [user, setUser] = useState<MeUser | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 350);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  // Paginación (estilo mockup)
  const pageSize = 6;
  const [page, setPage] = useState(1);

  // --- Auth
  useEffect(() => {
    (async () => {
      const r = await fetch("/api/auth/me");
      if (!r.ok) {
        router.push("/login");
        return;
      }
      const data = await r.json();
      setUser(data.user);
    })();
  }, [router]);

  // Load clientes
  async function loadClientes(search: string) {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());

    const r = await fetch(`/api/clientes?${params.toString()}`);
    if (!r.ok) {
      const msg = await safeJsonError(r);
      setError(msg || "No se pudo cargar clientes.");
      setLoading(false);
      return;
    }

    const data = await r.json();
    setClientes(data.clientes || []);
    setLoading(false);
  }

  // recargar cuando cambie búsqueda y haya sesión
  useEffect(() => {
    if (!user) return;
    setPage(1);
    loadClientes(debouncedQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, debouncedQ]);

  // ---- CRUD UI helpers
  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  }

  function openEdit(c: Cliente) {
    setEditing(c);
    setForm({
      nombre: c.nombre ?? "",
      telefono: c.telefono ?? "",
      correo: c.correo ?? "",
      direccion: c.direccion ?? "",
      notas: c.notas ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setForm({ ...emptyForm });
    setError("");
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim() || null,
      correo: form.correo.trim().toLowerCase() || null,
      direccion: form.direccion.trim() || null,
      notas: form.notas.trim() || null,
    };

    if (!payload.nombre) {
      setError("El nombre es obligatorio.");
      setSaving(false);
      return;
    }

    const isEdit = Boolean(editing?.id);
    const url = isEdit ? `/api/clientes/${editing!.id}` : "/api/clientes";
    const method = isEdit ? "PUT" : "POST";

    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const msg = await safeJsonError(r);
      setError(msg || "No se pudo guardar el cliente.");
      setSaving(false);
      return;
    }

    await loadClientes(debouncedQ);
    setSaving(false);
    closeModal();
  }

  async function deleteCliente(id: string) {
    const ok = confirm("¿Seguro que deseas eliminar este cliente?");
    if (!ok) return;

    setError("");
    const r = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const msg = await safeJsonError(r);
      setError(msg || "No se pudo eliminar el cliente.");
      return;
    }
    await loadClientes(debouncedQ);
  }

  // --- Tabla + paginación
  const total = clientes.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const rows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return clientes.slice(start, start + pageSize);
  }, [clientes, safePage]);

  const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(safePage * pageSize, total);

  // ---- Métricas (las 2 últimas las dejamos dummy por ahora)
  const totalClientes = total;
  const serviciosHoy = 0; // luego lo conectamos a /api/servicios
  const recaudacionHoy = 0; // luego lo conectamos a /api/tickets/pagos

  return (
    <div className="min-h-screen w-full bg-[#eef2ee]">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="w-[280px] shrink-0 bg-gradient-to-b from-[#1f4a3b] via-[#183b30] to-[#0f2b23] text-white/90 border-r border-black/10">
          <div className="px-6 py-7">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-44">
                  <Image
                    src="/evobike-logo.webp"
                    alt="Evobike POS"
                    fill
                    priority
                    className="object-contain"
                  />
              </div>
            </div>
          </div>

          <nav className="px-4 space-y-2">
            <SidebarItem label="Inicio" active={false} onClick={() => router.push("/")} />
            <SidebarItem label="Clientes" active onClick={() => router.push("/clientes")} />
            <SidebarItem label="Tickets" active={false} onClick={() => alert("Luego lo conectamos")} />
            <SidebarItem label="Inventario" active={false} onClick={() => alert("Luego lo conectamos")} />
            <SidebarItem label="Reportes" active={false} onClick={() => alert("Luego lo conectamos")} />
            <SidebarItem label="Configuración" active={false} onClick={() => alert("Luego lo conectamos")} />
          </nav>

          <div className="mt-auto px-5 pb-6 pt-10">
            <div className="flex items-center gap-3 rounded-2xl bg-white/8 border border-white/10 p-4">
              <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center font-bold">
                {user?.nombre?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <div className="font-semibold leading-tight truncate">
                  {user?.rol === "ADMIN" ? "Administrador" : user?.rol || "Usuario"}
                </div>
                <div className="text-xs text-white/70 truncate">
                  {user?.email || "sesión activa"}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1">
          <div className="relative">
            {/* Fondo suave tipo mockup */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 -left-20 h-[380px] w-[380px] rounded-full bg-emerald-200/35 blur-3xl" />
              <div className="absolute top-10 right-28 h-[260px] w-[260px] rounded-full bg-emerald-100/60 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-[340px] w-[340px] rounded-full bg-emerald-200/25 blur-3xl" />
            </div>

            <div className="relative px-10 py-8">
              {/* Top bar: breadcrumbs + stats */}
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-sm text-black/50 flex items-center gap-2">
                    <span className="inline-flex items-center gap-2">
                      <span className="opacity-70">⟳</span>
                      <span className="hover:underline cursor-pointer" onClick={() => router.push("/")}>
                        Inicio
                      </span>
                      <span className="opacity-60">/</span>
                      <span className="font-medium text-black/70">Clientes</span>
                    </span>
                  </div>
                  <h1 className="mt-3 text-4xl font-extrabold text-[#1e3d33]">
                    Clientes
                  </h1>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    title="Total Clientes"
                    value={String(totalClientes)}
                    icon="👤"
                  />
                  <StatCard
                    title="Servicios Hoy"
                    value={String(serviciosHoy)}
                    icon="🛠️"
                  />
                  <StatCard
                    title="Recaudación Hoy"
                    value={formatCurrencyMXN(recaudacionHoy)}
                    icon="💲"
                  />
                </div>
              </div>

              {/* Search + Nuevo */}
              <div className="mt-8 rounded-2xl bg-white/75 border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full max-w-xl">
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35">
                        🔎
                      </span>
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar cliente..."
                        className="w-full rounded-xl border border-black/10 bg-white px-10 py-3 text-[#1f2d27] outline-none placeholder:text-black/35 focus:border-emerald-500/40"
                      />
                    </div>
                    <button
                      className="rounded-xl px-5 py-3 bg-[#2f6a54] text-white font-semibold hover:bg-[#2a5e4b] shadow-[0_10px_22px_rgba(47,106,84,0.22)]"
                      onClick={() => loadClientes(q)}
                      disabled={loading}
                    >
                      Buscar
                    </button>
                  </div>

                  <button
                    onClick={openCreate}
                    className="rounded-xl px-5 py-3 bg-[#2f6a54] text-white font-semibold hover:bg-[#2a5e4b] shadow-[0_10px_22px_rgba(47,106,84,0.22)] inline-flex items-center gap-2"
                  >
                    <span className="text-lg leading-none">＋</span>
                    Nuevo Cliente
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Tabla */}
              <div className="mt-6 rounded-2xl bg-white/80 border border-black/10 shadow-[0_16px_40px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="px-6 py-5">
                  <h2 className="text-xl font-bold text-[#1e3d33]">Clientes</h2>
                </div>

                <div className="px-6 pb-6">
                  {loading ? (
                    <p className="text-black/60">Cargando…</p>
                  ) : rows.length === 0 ? (
                    <p className="text-black/60">No hay clientes.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-black/10">
                      <table className="w-full text-sm">
                        <thead className="bg-[#eef3ef] text-[#1e3d33]">
                          <tr>
                            <Th>Nombre <span className="opacity-40">⇅</span></Th>
                            <Th>Teléfono</Th>
                            <Th>Ult.Servicio <span className="opacity-40">⇅</span></Th>
                            <Th className="text-right">Acciones</Th>
                          </tr>
                        </thead>

                        <tbody className="bg-white">
                          {rows.map((c) => (
                            <tr key={c.id} className="border-t border-black/5">
                              <td className="px-5 py-4 font-semibold text-[#1e3d33]">
                                {c.nombre}
                              </td>
                              <td className="px-5 py-4 text-black/70">
                                {c.telefono || "-"}
                              </td>
                              <td className="px-5 py-4 text-black/70">
                                {formatDateES(c.updatedAt || c.createdAt) || "-"}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-3">
                                  <button
                                    onClick={() => openEdit(c)}
                                    className="rounded-lg px-4 py-2 bg-emerald-50 text-[#2f6a54] border border-emerald-200/70 hover:bg-emerald-100 inline-flex items-center gap-2"
                                  >
                                    ✏️ <span className="font-semibold">Editar</span>
                                  </button>

                                  <button
                                    onClick={() => deleteCliente(c.id)}
                                    className="rounded-lg px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 inline-flex items-center gap-2"
                                  >
                                    🗑️ <span className="font-semibold">Eliminar</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Footer paginación */}
                  <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="text-sm text-black/50">
                      Mostrando del {showingFrom} al {showingTo} de {total} resultados
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-lg px-4 py-2 bg-white border border-black/10 text-black/60 hover:bg-black/5 disabled:opacity-50"
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Anterior
                      </button>

                      {/* pages (estilo simple como mockup) */}
                      {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
                        const n = i + 1;
                        const active = n === safePage;
                        return (
                          <button
                            key={n}
                            onClick={() => setPage(n)}
                            className={`h-10 w-10 rounded-lg border text-sm font-semibold ${
                              active
                                ? "bg-[#2f6a54] text-white border-[#2f6a54]"
                                : "bg-white text-black/60 border-black/10 hover:bg-black/5"
                            }`}
                          >
                            {n}
                          </button>
                        );
                      })}

                      <button
                        className="rounded-lg px-5 py-2 bg-[#2f6a54] text-white font-semibold hover:bg-[#2a5e4b] disabled:opacity-50 inline-flex items-center gap-2"
                        disabled={safePage >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Siguiente <span className="text-lg">›</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Create/Edit */}
              {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                  <div className="w-full max-w-lg rounded-2xl bg-white border border-black/10 shadow-[0_30px_90px_rgba(0,0,0,0.25)] overflow-hidden">
                    <div className="px-5 py-4 bg-[#f2f6f3] border-b border-black/5 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-[#1e3d33]">
                        {editing ? "Editar cliente" : "Nuevo cliente"}
                      </h3>
                      <button
                        onClick={closeModal}
                        className="h-9 w-9 rounded-lg bg-white border border-black/10 hover:bg-black/5"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={submitForm} className="p-5 space-y-4">
                      <div>
                        <label className="text-sm text-black/60">Nombre *</label>
                        <input
                          value={form.nombre}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, nombre: e.target.value }))
                          }
                          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-3 outline-none focus:border-emerald-500/40"
                          placeholder="Ej. Juan Pérez"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-black/60">Correo</label>
                          <input
                            value={form.correo}
                            onChange={(e) =>
                              setForm((s) => ({ ...s, correo: e.target.value }))
                            }
                            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-3 outline-none focus:border-emerald-500/40"
                            placeholder="correo@dominio.com"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-black/60">Teléfono</label>
                          <input
                            value={form.telefono}
                            onChange={(e) =>
                              setForm((s) => ({ ...s, telefono: e.target.value }))
                            }
                            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-3 outline-none focus:border-emerald-500/40"
                            placeholder="9991234567"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-black/60">Dirección</label>
                        <input
                          value={form.direccion}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, direccion: e.target.value }))
                          }
                          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-3 outline-none focus:border-emerald-500/40"
                          placeholder="Opcional"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-black/60">Notas</label>
                        <textarea
                          value={form.notas}
                          onChange={(e) =>
                            setForm((s) => ({ ...s, notas: e.target.value }))
                          }
                          className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-3 outline-none focus:border-emerald-500/40 min-h-[90px]"
                          placeholder="Opcional"
                        />
                      </div>

                      {error && (
                        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                          {error}
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={closeModal}
                          disabled={saving}
                          className="rounded-xl px-4 py-3 bg-white border border-black/10 hover:bg-black/5 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="rounded-xl px-5 py-3 bg-[#2f6a54] text-white font-semibold hover:bg-[#2a5e4b] disabled:opacity-60"
                        >
                          {saving ? "Guardando…" : "Guardar"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* -------------------- UI pieces -------------------- */
function SidebarItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition border ${
        active
          ? "bg-white/10 border-white/20"
          : "bg-transparent border-transparent hover:bg-white/8 hover:border-white/10"
      }`}
    >
      <span className="opacity-80">▸</span>
      <span className="font-semibold">{label}</span>
    </button>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl bg-white/80 border border-black/10 shadow-[0_12px_30px_rgba(0,0,0,0.06)] px-4 py-3 min-w-[170px]">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center">
          <span>{icon}</span>
        </div>
        <div>
          <div className="text-xs text-black/50">{title}</div>
          <div className="text-lg font-extrabold text-[#1e3d33]">{value}</div>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: any; className?: string }) {
  return (
    <th className={`text-left px-5 py-3 font-semibold ${className}`}>
      {children}
    </th>
  );
}

/* -------------------- helpers -------------------- */
function useDebouncedValue<T>(value: T, delayMs: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return v;
}

async function safeJsonError(r: Response) {
  try {
    const data = await r.json();
    return data?.error || data?.message || "";
  } catch {
    return "";
  }
}

function formatDateES(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatCurrencyMXN(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(n || 0);
}
