import "server-only";
import { prisma } from "@/lib/prisma";

export async function listReportsForAdmin() {
  return prisma.report.findMany({
    include: { player: true, user: true },
    orderBy: [{ reviewed: "asc" }, { createdAt: "desc" }],
  });
}

export async function markReportReviewed(reportId: string): Promise<void> {
  await prisma.report.update({ where: { id: reportId }, data: { reviewed: true } });
}
