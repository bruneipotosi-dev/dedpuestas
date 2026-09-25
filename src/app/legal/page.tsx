export const metadata = { title: "Aviso legal · Dedpuestas" };

export default function LegalPage() {
  return (
    <main
      style={{
        flex: 1,
        maxWidth: 640,
        margin: "0 auto",
        padding: "var(--s-6) var(--s-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--s-4)",
      }}
    >
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-xl)" }}>
        Aviso legal y términos
      </h1>

      <section>
        <h2 style={{ fontSize: "var(--fs-lg)" }}>Los Dedines no valen dinero real</h2>
        <p style={{ color: "var(--text-2)" }}>
          Dedines es una moneda virtual sin ningún valor monetario. No se puede comprar, vender,
          transferir ni canjear por dinero real, bienes ni servicios. Se usa exclusivamente para
          apostar dentro de este sitio, por diversión.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "var(--fs-lg)" }}>Sitio de fans no oficial</h2>
        <p style={{ color: "var(--text-2)" }}>
          Dedpuestas es un proyecto de fans, sin relación con los organizadores de Dedsafio 4, sus
          participantes, Eufonia Studios ni Kick. Todos los derechos de la serie pertenecen a sus
          creadores.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "var(--fs-lg)" }}>Datos y cuentas</h2>
        <p style={{ color: "var(--text-2)" }}>
          El registro solo pide un nombre de usuario y una contraseña; no pedimos ni guardamos tu
          email. Si perdés tu contraseña, un administrador puede restablecerla manualmente.
        </p>
      </section>
    </main>
  );
}
