import { NextResponse } from "next/server";
import { getPlayerProfile } from "@/lib/players";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getPlayerProfile(slug);
  if (!profile) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({
    nick: profile.player.nick,
    sentiment: profile.sentiment,
  });
}
