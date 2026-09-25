import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { RegistroForm } from "./registro-form";

export const metadata = { title: "Crear cuenta · Dedpuestas" };

export default async function RegistroPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <main style={{ flex: 1, display: "flex", alignItems: "center" }}>
      <RegistroForm />
    </main>
  );
}
