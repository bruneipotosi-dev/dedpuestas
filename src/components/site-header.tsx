import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getUserBalance } from "@/lib/ledger";
import { logoutAction } from "@/app/(auth)/actions";

const linkStyle = { color: "var(--text)", textDecoration: "none" };

export async function SiteHeader() {
  const user = await getCurrentUser();
  const balance = user ? await getUserBalance(user.id) : null;

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--s-4)",
        padding: "var(--s-3) var(--s-4)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <Link href="/" style={{ ...linkStyle, fontFamily: "var(--font-display)", fontSize: "var(--fs-lg)" }}>
        Dedpuestas
      </Link>

      {user ? (
        <nav style={{ display: "flex", alignItems: "center", gap: "var(--s-4)", fontSize: "var(--fs-sm)" }}>
          <Link href="/mis-apuestas" style={linkStyle}>
            Mis apuestas
          </Link>
          <Link href="/ranking" style={linkStyle}>
            Ranking
          </Link>
          {user.role === "admin" && (
            <Link href="/admin" style={{ ...linkStyle, color: "var(--admin)" }}>
              Admin
            </Link>
          )}
          <span className="num" style={{ color: "var(--dedines)" }}>
            {balance?.toString()} Dedines
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              style={{
                background: "none",
                border: "1px solid var(--line)",
                color: "var(--text-2)",
                borderRadius: "var(--r-md)",
                padding: "var(--s-1) var(--s-2)",
                cursor: "pointer",
              }}
            >
              Salir
            </button>
          </form>
        </nav>
      ) : (
        <nav style={{ display: "flex", gap: "var(--s-3)", fontSize: "var(--fs-sm)" }}>
          <Link href="/login" style={linkStyle}>
            Iniciar sesión
          </Link>
          <Link href="/registro" style={{ ...linkStyle, color: "var(--brand-text)" }}>
            Crear cuenta
          </Link>
        </nav>
      )}
    </header>
  );
}
