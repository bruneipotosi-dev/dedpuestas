export function OutcomeBar({ diePct, livePct }: { diePct: number; livePct: number }) {
  return (
    <div style={{ display: "flex", gap: 2, height: 10, borderRadius: "var(--r-xs)", overflow: "hidden" }}>
      <span style={{ flex: Math.max(diePct, 0.001), background: "var(--die)" }} />
      <span style={{ flex: Math.max(livePct, 0.001), background: "var(--live)" }} />
    </div>
  );
}
