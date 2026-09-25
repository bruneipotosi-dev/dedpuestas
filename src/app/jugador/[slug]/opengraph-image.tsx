import { ImageResponse } from "next/og";
import { getPlayerProfile } from "@/lib/players";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: { slug: string } }) {
  const profile = await getPlayerProfile(params.slug);
  const nick = profile?.player.nick ?? "Jugador";
  const sentiment = profile?.sentiment;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700 }}>{nick}</div>
        {sentiment ? (
          <div style={{ fontSize: 40, marginTop: 24, color: "#ff5f4f", display: "flex" }}>
            {sentiment.pct}% cree que muere esta semana
          </div>
        ) : (
          <div style={{ fontSize: 32, marginTop: 24, color: "#a8a8a8", display: "flex" }}>
            Dedpuestas · web de fans de Dedsafio 4
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
