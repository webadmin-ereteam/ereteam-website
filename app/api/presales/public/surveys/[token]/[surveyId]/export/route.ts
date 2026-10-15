import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/presales/db";
import { buildSurveyExportBuffer, surveyExportFileName, contentDispositionHeader } from "@/lib/presales/surveyExcel";
import { isJourneyLinkActive } from "@/lib/presales/journeyLink";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string; surveyId: string }> }) {
  const { token, surveyId } = await params;
  const survey = await prisma.surveyInstance.findFirst({
    where: { id: surveyId, status: "completed", journey: { accessToken: token } },
    include: { journey: true, selections: { include: { response: true }, orderBy: { order: "asc" } } },
  });

  if (!survey || !isJourneyLinkActive(survey.journey)) {
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
