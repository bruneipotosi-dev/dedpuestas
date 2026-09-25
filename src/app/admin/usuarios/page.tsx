import { listUsersForAdmin } from "@/lib/admin/users";
import { ResetPasswordForm } from "@/components/admin/reset-password-form";

export const metadata = { title: "Usuarios · Admin · Dedpuestas" };

export default async function AdminUsuariosPage() {
  const users = await listUsersForAdmin();

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-xl)", marginBottom: "var(--s-4)" }}>
        Usuarios
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
        {users.map((user) => (
          <div
            key={user.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-md)",
              padding: "var(--s-2) var(--s-3)",
              gap: "var(--s-3)",
            }}
          >
            <div>
              <strong>{user.username}</strong>{" "}
              <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-2)" }}>
                {user.role} · <span className="num">{user.balance.toString()}</span> Dedines
              </span>
            </div>
            <ResetPasswordForm userId={user.id} username={user.username} />
          </div>
        ))}
      </div>
    </div>
  );
}
