import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { prisma } from "@/lib/presales/db";
import { Badge, Card, PageHeader, buttonSecondaryClass } from "../../../../../_components/ui";
import { decodeOptions } from "@/lib/presales/surveyOptions";

const STATUS_BADGE: Record<string, "gray" | "amber" | "green"> = {
  draft: "gray",
  sent: "amber",
  completed: "green",
};

export default async function SurveyResultsPage({
  params,
}: {
  params: { id: string; surveyId: string };
}) {
  const survey = await prisma.surveyInstance.findFirst({
    where: { id: params.surveyId, journeyId: params.id },
    include: {
      stage: true,
      selections: {
        include: { response: { include: { document: true } } },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!survey) notFound();

  return (
    <div>
      <Link
        href={`/presales/admin/journeys/${params.id}/surveys`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand-primary"
      >
        <ArrowLeft size={14} /> Anketlere geri dön
      </Link>
      <PageHeader
        title={survey!.title}
        description={survey!.stage.name}
        action={
          <div className="flex items-center gap-3">
            <Badge color={STATUS_BADGE[survey!.status] ?? "gray"}>{survey!.status}</Badge>
            <a
              href={`/api/presales/admin/journeys/${params.id}/surveys/${params.surveyId}/export`}
              className={buttonSecondaryClass}
            >
              <Download size={14} className="mr-1.5" /> Excel İndir
            </a>
          </div>
        }
      />

      <div className="space-y-4">
        {survey!.selections.map((selection) => {
          const label = selection.text;
          const options = decodeOptions(selection.options).map((o) => o.text);
          const response = selection.response;

          return (
            <Card key={selection.id}>
              <div className="mb-2 flex items-center gap-2">
                <p className="font-medium text-brand-dark">{label}</p>
                <Badge color="blue">{selection.type}</Badge>
                {selection.required && <span className="text-xs text-brand-magenta">zorunlu</span>}
              </div>

              {!response ? (
                <p className="text-sm italic text-text-muted">Henüz cevaplanmadı.</p>
              ) : selection.type === "multi_choice" ? (
                <div className="flex flex-wrap gap-1.5">
                  {((response.answerJson as string[] | null) ?? []).map((v) => (
                    <Badge key={v} color="gray">
                      {v}
                    </Badge>
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
                  <p className="text-sm text-text-muted">Dosya yüklenmedi.</p>
                )
              ) : (
                <p className="whitespace-pre-wrap text-sm text-text-body">{response.answerText || "—"}</p>
              )}

              {options.length > 0 && selection.type !== "multi_choice" && (
                <p className="mt-1 text-xs text-text-muted">Seçenekler: {options.join(", ")}</p>
              )}
            </Card>
          );
        })}
        {survey!.selections.length === 0 && (
          <Card className="text-sm text-text-muted">Bu ankette soru yok.</Card>
        )}
      </div>
    </div>
  );
}
