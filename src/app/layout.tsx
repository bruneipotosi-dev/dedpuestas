import type { Metadata } from "next";
import { LegalFooter } from "@/components/legal-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dedpuestas",
  description: "Web de fans para apostar Dedines sobre Dedsafio 4.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>
        {children}
        <LegalFooter />
      </body>
    </html>
  );
}
