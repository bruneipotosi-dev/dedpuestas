import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "var(--s-4)", width: "100%" }}>
      <nav
        style={{
          display: "flex",
          gap: "var(--s-3)",
          marginBottom: "var(--s-4)",
          paddingBottom: "var(--s-3)",
          borderBottom: "1px solid var(--line)",
          fontSize: "var(--fs-sm)",
        }}
      >
        <Link href="/admin" style={{ color: "var(--admin)" }}>
          Admin
        </Link>
        <Link href="/admin/mercados" style={{ color: "var(--text)" }}>
          Mercados
        </Link>
        <Link href="/admin/jugadores" style={{ color: "var(--text)" }}>
          Jugadores
        </Link>
        <Link href="/admin/usuarios" style={{ color: "var(--text)" }}>
          Usuarios
        </Link>
      </nav>
      {children}
    </main>
  );
}
