export function DedinIcon({ size = 16 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        flex: "none",
        display: "inline-block",
        borderRadius: "50%",
        background: "var(--dedin-wheel)",
        border: `${Math.max(1, Math.round(size / 8))}px solid var(--dedines)`,
      }}
      aria-hidden="true"
    />
  );
}
