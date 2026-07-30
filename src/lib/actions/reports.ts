"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EYFSAgeBand, ReportType, DevelopmentLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";

export async function createReport(formData: FormData) {
  const session = await requireStaff();

  const childId = String(formData.get("childId") || "");
  const type = formData.get("type") as ReportType;
  const periodLabel = String(formData.get("periodLabel") || "");
  const ageBand = formData.get("ageBand") as EYFSAgeBand;
  const summary = String(formData.get("summary") || "");
  const nextSteps = String(formData.get("nextSteps") || "") || null;

  if (!childId || !type || !periodLabel || !summary) {
    throw new Error("Please complete all required fields.");
  }

  const areas = await prisma.eYFSArea.findMany();
  const entries = areas
    .map((area) => {
      const level = formData.get(`level_${area.id}`);
      const comment = formData.get(`comment_${area.id}`);
      if (!level) return null;
      return { eyfsAreaId: area.id, level: level as DevelopmentLevel, comment: String(comment || "") || null };
    })
    .filter((e): e is { eyfsAreaId: string; level: DevelopmentLevel; comment: string | null } => e !== null);

  const report = await prisma.report.create({
    data: {
      childId,
      staffId: session.user.id,
      type,
      periodLabel,
      ageBand,
      summary,
      nextSteps,
      entries: { create: entries },
    },
  });

  revalidatePath("/admin/reports");
  redirect(`/admin/reports/${report.id}`);
}

export async function shareReportWithParent(reportId: string) {
  await requireStaff();
  await prisma.report.update({ where: { id: reportId }, data: { sharedWithParentAt: new Date() } });
  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${reportId}`);
  revalidatePath("/parent/learning");
}

export async function deleteReport(reportId: string) {
  await requireStaff();
  await prisma.report.delete({ where: { id: reportId } });
  revalidatePath("/admin/reports");
  redirect("/admin/reports");
}
