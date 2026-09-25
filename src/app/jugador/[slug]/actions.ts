"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { createReport } from "@/lib/reports";

export type ReportFormState = { error: string | null; success?: boolean };

export async function createReportAction(
  _prev: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const user = await requireUser();

  const playerId = Number(formData.get("playerId"));
  const clipUrl = String(formData.get("clipUrl") ?? "").trim();
  const note = formData.get("note");

  if (!clipUrl) return { error: "Pegá el link al clip." };

  await createReport(user.id, playerId, clipUrl, typeof note === "string" ? note : undefined);

  revalidatePath("/admin/reportes");
  return { error: null, success: true };
}
