"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { placeBet, MIN_BET } from "@/lib/markets";
import { claimDailyBonus, claimWeeklyRescue } from "@/lib/bonus";

export type BetActionState = { error: string | null; success?: boolean };

export async function placeBetAction(
  _prev: BetActionState,
  formData: FormData,
): Promise<BetActionState> {
  const user = await requireUser();

  const outcomeId = String(formData.get("outcomeId") ?? "");
  const amountRaw = String(formData.get("amount") ?? "");

  let amount: bigint;
  try {
    amount = BigInt(amountRaw);
  } catch {
    return { error: "Importe inválido." };
  }
  if (amount < MIN_BET) {
    return { error: `La apuesta mínima es ${MIN_BET} Dedines.` };
  }

  const result = await placeBet(user.id, outcomeId, amount);
  if (!result.ok) {
    const messages: Record<string, string> = {
      min_amount: `La apuesta mínima es ${MIN_BET} Dedines.`,
      not_found: "Esa opción ya no existe.",
      market_closed: "Este mercado ya cerró.",
      insufficient_balance: "No te alcanza el saldo.",
    };
    return { error: messages[result.reason] ?? "No se pudo apostar." };
  }

  revalidatePath("/");
  revalidatePath("/mis-apuestas");
  return { error: null, success: true };
}

export type BonusActionState = { error: string | null };

export async function claimBonusAction(): Promise<void> {
  const user = await requireUser();
  await claimDailyBonus(user.id);
  revalidatePath("/");
}

export async function claimWeeklyRescueAction(): Promise<void> {
  const user = await requireUser();
  await claimWeeklyRescue(user.id);
  revalidatePath("/");
}
