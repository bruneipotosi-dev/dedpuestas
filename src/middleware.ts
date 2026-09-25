import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Expone el pathname actual como header para que el root layout (Server
 * Component, sin acceso a usePathname) pueda decidir si mostrar el header y
 * el pie de página normales, o el layout "limpio" del overlay de OBS
 * (HU-23) — ver src/app/layout.tsx.
 */
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: "/:path*",
};
