import Link from "next/link";

export const metadata = { title: "Admin · Dedpuestas" };

export default function AdminHomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-xl)" }}>Panel de administración</h1>
      <Link href="/admin/mercados" style={{ color: "var(--brand-text)" }}>
        Gestionar mercados →
      </Link>
      <Link href="/admin/jugadores" style={{ color: "var(--brand-text)" }}>
        Estado de jugadores →
      </Link>
      <Link href="/admin/usuarios" style={{ color: "var(--brand-text)" }}>
        Usuarios (restablecer contraseña) →
      </Link>
      <Link href="/admin/reportes" style={{ color: "var(--brand-text)" }}>
        Reportes de la comunidad →
      </Link>
    </div>
  );
}
