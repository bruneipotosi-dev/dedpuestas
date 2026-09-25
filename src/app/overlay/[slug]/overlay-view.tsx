"use client";

import { useEffect, useState } from "react";

type OverlayData = {
  nick: string;
  sentiment: { pct: number; label: string } | null;
};

const POLL_MS = 20_000;

export function OverlayView({ slug }: { slug: string }) {
  const [data, setData] = useState<OverlayData | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/overlay/${slug}`, { cache: "no-store" });
        if (res.ok && !cancelled) setData(await res.json());
      } catch {
        // Si falla un poll, el overlay simplemente sigue mostrando el último valor.
      }
    }
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [slug]);

  if (!data) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "var(--font-display)",
        color: "#ffffff",
        textShadow: "0 2px 8px rgba(0,0,0,0.8)",
      }}
    >
      <div style={{ fontSize: 28, opacity: 0.8 }}>{data.nick}</div>
      {data.sentiment ? (
        <div style={{ fontSize: 56, color: "#ff5f4f" }} className="num">
          {data.sentiment.pct}% cree que muero esta semana
        </div>
      ) : (
        <div style={{ fontSize: 32, opacity: 0.6 }}>Sin mercado abierto</div>
      )}
    </div>
  );
}
