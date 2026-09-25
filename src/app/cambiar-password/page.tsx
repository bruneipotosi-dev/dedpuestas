import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { ChangePasswordForm } from "./change-password-form";

export const metadata = { title: "Cambiar contraseña · Dedpuestas" };

export default async function CambiarPasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main style={{ flex: 1, display: "flex", alignItems: "center" }}>
      <ChangePasswordForm />
    </main>
  );
}
