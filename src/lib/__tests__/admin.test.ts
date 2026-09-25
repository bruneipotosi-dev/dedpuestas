import { describe, it, expect, beforeEach } from "vitest";
import { getTestPrisma, resetDb } from "../../../tests/db";
import { registerUser } from "@/lib/users";
import { attemptLogin } from "@/lib/auth";
import { createWeeklyMarkets } from "@/lib/markets";
import { updatePlayerStatus } from "@/lib/admin/players";
import { resetUserPassword } from "@/lib/admin/users";

describe("admin", () => {
  beforeEach(async () => {
    const prisma = await getTestPrisma();
    await resetDb(prisma);
  });

  it("crea un mercado por cada jugador vivo, ninguno para los eliminados", async () => {
    const prisma = await getTestPrisma();
    const team = await prisma.team.create({ data: { id: "t1", name: "Equipo 1" } });
    await prisma.player.createMany({
      data: [
        { slug: "vivo1", nick: "Vivo1", teamId: team.id, status: "alive" },
        { slug: "vivo2", nick: "Vivo2", teamId: team.id, status: "alive" },
        { slug: "muerto1", nick: "Muerto1", teamId: team.id, status: "eliminated" },
      ],
    });

    const result = await createWeeklyMarkets();
    expect(result.created).toBe(2);

    const markets = await prisma.market.findMany({ include: { outcomes: true } });
    expect(markets).toHaveLength(2);
    for (const market of markets) {
      expect(market.outcomes.map((o) => o.label).sort()).toEqual(["Muere", "Sobrevive"]);
    }
  });

  it("no duplica mercados si ya hay uno abierto para el jugador", async () => {
    const prisma = await getTestPrisma();
    const team = await prisma.team.create({ data: { id: "t2", name: "Equipo 2" } });
    await prisma.player.create({ data: { slug: "vivo3", nick: "Vivo3", teamId: team.id, status: "alive" } });

    await createWeeklyMarkets();
    const second = await createWeeklyMarkets();
    expect(second.created).toBe(0);

    const markets = await prisma.market.findMany();
    expect(markets).toHaveLength(1);
  });

  it("marca a un jugador como eliminado y guarda la fecha (RN-9)", async () => {
    const prisma = await getTestPrisma();
    const team = await prisma.team.create({ data: { id: "t3", name: "Equipo 3" } });
    const player = await prisma.player.create({
      data: { slug: "vivo4", nick: "Vivo4", teamId: team.id, status: "alive" },
    });

    await updatePlayerStatus(player.id, "eliminated");

    const updated = await prisma.player.findUniqueOrThrow({ where: { id: player.id } });
    expect(updated.status).toBe("eliminated");
    expect(updated.eliminatedAt).not.toBeNull();
  });

  it("restablece la contraseña de un usuario y lo obliga a cambiarla al entrar (HU-33)", async () => {
    const result = await registerUser("resetuser", "contraseñaoriginal");
    if (!result.ok) throw new Error("setup falló");

    const reset = await resetUserPassword(result.userId);
    expect(reset.ok).toBe(true);
    if (!reset.ok) return;

    // La vieja contraseña ya no funciona.
    const oldLogin = await attemptLogin("resetuser", "contraseñaoriginal");
    expect(oldLogin.ok).toBe(false);

    // La temporal sí funciona, y marca que hay que cambiarla.
    const newLogin = await attemptLogin("resetuser", reset.tempPassword);
    expect(newLogin).toEqual({ ok: true, userId: result.userId, mustChangePassword: true });
  });
});
