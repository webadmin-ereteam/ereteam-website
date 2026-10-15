import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/presales/db";
import { buildSurveyExportBuffer, surveyExportFileName, contentDispositionHeader } from "@/lib/presales/surveyExcel";
import { hasCurrentAdminSession } from "@/lib/presales/adminSession";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string; surveyId: string }> }) {
  if (!(await hasCurrentAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, surveyId } = await params;
  const survey = await prisma.surveyInstance.findFirst({
    where: { id: surveyId, journeyId: id },
    include: { selections: { include: { response: true }, orderBy: { order: "asc" } } },
  });

  if (!survey) {
    return NextResponse.json({ error: "Anket bulunamadı." }, { status: 404 });
  }

  const buffer = buildSurveyExportBuffer(survey);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": contentDispositionHeader(surveyExportFileName(survey.title)),
    },
  });
}
