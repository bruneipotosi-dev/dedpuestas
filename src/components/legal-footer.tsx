import Link from "next/link";

export function LegalFooter() {
  return (
    <footer
      style={{
        marginTop: "auto",
        padding: "var(--s-4)",
        textAlign: "center",
        fontSize: "var(--fs-xs)",
        color: "var(--text-2)",
        borderTop: "1px solid var(--line)",
      }}
    >
      Dedines sin valor real · Sitio de fans no oficial ·{" "}
      <Link href="/legal" style={{ color: "var(--text-2)", textDecoration: "underline" }}>
        Aviso legal
      </Link>
    </footer>
  );
}
