import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getParentChildIds } from "@/lib/parent";
import { ReportDocument } from "@/lib/pdf/ReportDocument";
import { ageBandLabel } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: { child: true, entries: { include: { eyfsArea: true } } },
  });
  if (!report) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isStaff = session.user.role === "ADMIN" || session.user.role === "STAFF";
  if (!isStaff) {
    if (!report.sharedWithParentAt) return new NextResponse("Forbidden", { status: 403 });
    const childIds = await getParentChildIds(session.user.id);
    if (!childIds.includes(report.childId)) return new NextResponse("Forbidden", { status: 403 });
  }

  const setting = await prisma.setting.findFirst();

  const pdfBuffer = await renderToBuffer(
    <ReportDocument
      data={{
        nurseryName: setting?.nurseryName ?? "Nursery",
        childName: `${report.child.firstName} ${report.child.lastName}`,
        ageBandLabel: ageBandLabel(report.ageBand),
        type: report.type,
        periodLabel: report.periodLabel,
        generatedAt: report.generatedAt,
        summary: report.summary,
        nextSteps: report.nextSteps,
        entries: report.entries.map((e) => ({
          areaName: e.eyfsArea.name,
          level: e.level,
          comment: e.comment,
        })),
      }}
    />
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${report.child.firstName}-${report.periodLabel.replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
