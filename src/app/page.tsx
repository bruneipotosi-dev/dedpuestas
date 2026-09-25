export default function Home() {
  return (
    <main
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--s-2)",
        padding: "var(--s-6)",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-2xl)" }}>
        Dedpuestas
      </h1>
      <p style={{ color: "var(--text-2)", fontSize: "var(--fs-md)" }}>
        Próximamente: apostá Dedines sobre Dedsafio 4.
      </p>
    </main>
  );
}
