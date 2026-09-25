import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata = { title: "Iniciar sesión · Dedpuestas" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <main style={{ flex: 1, display: "flex", alignItems: "center" }}>
      <LoginForm />
    </main>
  );
}
