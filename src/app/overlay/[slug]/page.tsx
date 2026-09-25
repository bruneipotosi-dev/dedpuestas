import { notFound } from "next/navigation";
import { getPlayerProfile } from "@/lib/players";
import { OverlayView } from "./overlay-view";

export const metadata = { title: "Overlay · Dedpuestas" };

/**
 * Fuente de navegador para OBS (HU-23): agregá esta URL como "Browser
 * Source" con fondo transparente. Se actualiza sola cada 20s, no hace falta
 * refrescar la fuente en OBS.
 */
export default async function OverlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getPlayerProfile(slug);
  if (!profile) notFound();

  return <OverlayView slug={slug} />;
}
