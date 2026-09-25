"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import {
  createWeeklyMarkets,
  createGulagMarkets,
  createTeamSurvivalMarket,
  createDeathCountMarket,
  resolveMarket,
  voidMarket,
} from "@/lib/markets";
import { updatePlayerStatus, setPlayerOptedOut } from "@/lib/admin/players";
import { resetUserPassword } from "@/lib/admin/users";
import { markReportReviewed } from "@/lib/admin/reports";
import type { PlayerStatus } from "@/generated/prisma/client";

export async function createWeeklyMarketsAction(): Promise<void> {
  await requireAdmin();
  await createWeeklyMarkets();
  revalidatePath("/admin/mercados");
  revalidatePath("/");
}

export async function createGulagMarketsAction(): Promise<void> {
  await requireAdmin();
  await createGulagMarkets();
  revalidatePath("/admin/mercados");
  revalidatePath("/");
}

export async function createTeamSurvivalMarketAction(): Promise<void> {
  await requireAdmin();
  await createTeamSurvivalMarket();
  revalidatePath("/admin/mercados");
  revalidatePath("/");
}

export type DeathCountFormState = { error: string | null };

export async function createDeathCountMarketAction(
  _prev: DeathCountFormState,
  formData: FormData,
): Promise<DeathCountFormState> {
  await requireAdmin();

  const threshold = Number(formData.get("threshold"));
  const question = String(formData.get("question") ?? "").trim();
  const closesAtRaw = String(formData.get("closesAt") ?? "");
  const closesAt = new Date(closesAtRaw);

  if (!question) return { error: "Falta la pregunta." };
  if (Number.isNaN(closesAt.getTime())) return { error: "Fecha de cierre inválida." };

  const result = await createDeathCountMarket(threshold, question, closesAt);
  if (!result.created) return { error: result.error ?? "No se pudo crear el mercado." };

  revalidatePath("/admin/mercados");
  revalidatePath("/");
  return { error: null };
}

export async function markReportReviewedAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const reportId = String(formData.get("reportId") ?? "");
  await markReportReviewed(reportId);
  revalidatePath("/admin/reportes");
}

export type ResolveFormState = { error: string | null };

export async function resolveMarketAction(
  _prev: ResolveFormState,
  formData: FormData,
): Promise<ResolveFormState> {
  await requireAdmin();

  const marketId = String(formData.get("marketId") ?? "");
  const winningOutcomeId = String(formData.get("winningOutcomeId") ?? "");
  const proofUrl = formData.get("proofUrl");

  const result = await resolveMarket(
    marketId,
    winningOutcomeId,
    typeof proofUrl === "string" && proofUrl.trim() ? proofUrl.trim() : undefined,
  );
  if (!result.ok) {
    return { error: result.reason === "already_resolved" ? "Ese mercado ya estaba resuelto." : "Mercado no encontrado." };
  }

  revalidatePath("/admin/mercados");
  revalidatePath("/mis-apuestas");
  return { error: null };
}

export async function voidMarketAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const marketId = String(formData.get("marketId") ?? "");
  await voidMarket(marketId);
  revalidatePath("/admin/mercados");
  revalidatePath("/mis-apuestas");
}

export async function updatePlayerStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const playerId = Number(formData.get("playerId"));
  const status = String(formData.get("status")) as PlayerStatus;
  await updatePlayerStatus(playerId, status);
  revalidatePath("/admin/jugadores");
  revalidatePath("/");
}

export async function setPlayerOptedOutAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const playerId = Number(formData.get("playerId"));
  const optedOut = formData.get("optedOut") === "true";
  await setPlayerOptedOut(playerId, optedOut);
  revalidatePath("/admin/jugadores");
}

export type ResetPasswordState = { error: string | null; tempPassword?: string };

export async function resetUserPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const result = await resetUserPassword(userId);
  if (!result.ok) return { error: "Usuario no encontrado." };
  return { error: null, tempPassword: result.tempPassword };
}
