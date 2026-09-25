type Props = { avatarUrl: string | null; nick: string; size?: number };

export function PlayerAvatar({ avatarUrl, nick, size = 40 }: Props) {
  if (!avatarUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          flex: "none",
          borderRadius: "var(--r-xs)",
          background: "var(--surface)",
          border: "1px solid var(--line)",
        }}
        aria-hidden="true"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- avatares externos (mc-heads.net), no vale la pena optimizarlos con next/image
    <img
      src={avatarUrl}
      alt={nick}
      width={size}
      height={size}
      style={{ flex: "none", borderRadius: "var(--r-xs)", imageRendering: "pixelated" }}
    />
  );
}
