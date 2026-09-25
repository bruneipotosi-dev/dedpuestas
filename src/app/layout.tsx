import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { LegalFooter } from "@/components/legal-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dedpuestas",
  description: "Web de fans para apostar Dedines sobre Dedsafio 4.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  // El overlay de OBS (HU-23) es una fuente de navegador: nada de header,
  // pie de página ni fondo opaco.
  const isOverlay = pathname.startsWith("/overlay");

  return (
    <html lang="es">
      <body style={isOverlay ? { background: "transparent" } : undefined}>
        {!isOverlay && <SiteHeader />}
        {children}
        {!isOverlay && <LegalFooter />}
      </body>
    </html>
  );
}
