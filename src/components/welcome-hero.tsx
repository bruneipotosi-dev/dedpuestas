import Link from "next/link";
import { DedinIcon } from "./dedin-icon";

export function WelcomeHero() {
  return (
    <div
      style={{
        display: "grid",
        gap: "var(--s-4)",
        justifyItems: "center",
        textAlign: "center",
        padding: "var(--s-8) var(--s-4) var(--s-6)",
        borderBottom: "1px solid var(--line)",
        marginBottom: "var(--s-4)",
      }}
    >
      <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--fs-hero)", lineHeight: 1 }}>
        Ded<span style={{ color: "var(--brand)" }}>puestas</span>
      </h1>
      <p style={{ margin: 0, color: "var(--text-2)", fontSize: "var(--fs-lg)", maxWidth: "32ch" }}>
        Apostá Dedines a quién cae en <strong style={{ color: "var(--text)" }}>Dedsafio 4</strong>.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--s-2)",
          background: "var(--dedines-soft)",
          border: "1px solid var(--dedines-border)",
          borderRadius: "var(--r-lg)",
          padding: "var(--s-2) var(--s-4)",
          fontSize: "var(--fs-sm)",
        }}
      >
        <DedinIcon size={22} />
        <span>
          Empezás con <strong className="num" style={{ color: "var(--dedines)" }}>1.000 Dedines</strong> y un bono
          cada día
        </span>
      </div>

      <div style={{ display: "flex", gap: "var(--s-3)", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/registro"
          style={{
            background: "var(--brand)",
            color: "var(--bg)",
            fontWeight: 700,
            padding: "var(--s-3) var(--s-6)",
            borderRadius: "var(--r-lg)",
            textDecoration: "none",
          }}
        >
          Crear cuenta
        </Link>
        <Link
          href="/login"
          style={{
            background: "transparent",
            color: "var(--text)",
            fontWeight: 700,
            padding: "var(--s-3) var(--s-6)",
            borderRadius: "var(--r-lg)",
            border: "1px solid var(--line)",
            textDecoration: "none",
          }}
        >
          Ya tengo cuenta
        </Link>
      </div>

      <p style={{ margin: 0, color: "var(--text-2)", fontSize: "var(--fs-xs)", maxWidth: "38ch" }}>
        Los Dedines no valen dinero real: no se compran, no se venden. Es solo para competir con otros fans.
      </p>
    </div>
  );
}
