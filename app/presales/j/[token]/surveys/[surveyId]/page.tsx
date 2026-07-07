import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { prisma } from "@/lib/presales/db";
import { decodeOptions } from "@/lib/presales/surveyOptions";
import { isJourneyLinkActive } from "@/lib/presales/journeyLink";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function CustomerSurveyResultsPage({
  params,
}: {
  params: { token: string; surveyId: string };
}) {
  const survey = await prisma.surveyInstance.findFirst({
    where: { id: params.surveyId, status: "completed", journey: { accessToken: params.token } },
    include: {
      journey: true,
      selections: {
        include: { response: { include: { document: true } } },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!survey || !isJourneyLinkActive(survey.journey)) notFound();

  return (
    <div className="min-h-screen bg-gray-50 text-text-body">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <Link
          href={`/presales/j/${params.token}`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand-primary"
        >
          <ArrowLeft size={14} /> Sürece geri dön
        </Link>

        <div className="mb-1 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-brand-dark">{survey!.title}</h1>
          <a
            href={`/api/presales/public/surveys/${params.token}/${params.surveyId}/export`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-text-body transition-colors hover:border-brand-primary hover:text-brand-primary"
          >
            <Download size={14} /> Excel İndir
          </a>
        </div>
        <p className="mb-8 text-sm text-text-muted">Gönderdiğiniz cevaplar aşağıdadır.</p>

        <div className="space-y-4">
          {survey!.selections.map((selection) => {
            const label = selection.text;
            const options = decodeOptions(selection.options).map((o) => o.text);
            const response = selection.response;

            return (
              <div key={selection.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="mb-2 font-medium text-brand-dark">{label}</p>
                {!response ? (
                  <p className="text-sm italic text-text-muted">—</p>
                ) : selection.type === "multi_choice" ? (
                  <div className="flex flex-wrap gap-1.5">
                    {((response.answerJson as string[] | null) ?? []).map((v) => (
                      <span key={v} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-text-muted">
                        {v}
                      </span>
                    ))}
                  </div>
                ) : selection.type === "file_upload" ? (
                  response.document ? (
                    <a
                      href={response.document.driveWebViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-brand-primary hover:underline"
                    >
                      <FileText size={15} /> {response.document.title}
                    </a>
                  ) : (
                    <p className="text-sm text-text-muted">—</p>
                  )
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-text-body">{response.answerText || "—"}</p>
                )}
                {options.length > 0 && selection.type !== "multi_choice" && (
                  <p className="mt-1 text-xs text-text-muted">Seçenekler: {options.join(", ")}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
