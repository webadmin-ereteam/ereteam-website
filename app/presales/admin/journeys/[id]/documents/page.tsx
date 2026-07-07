import { notFound } from "next/navigation";
import { FileText, ClipboardCheck, ClipboardList, FileSignature, Video, Upload, File as FileIcon, FileSpreadsheet } from "lucide-react";
import { prisma } from "@/lib/presales/db";
import { uploadDocument } from "@/lib/presales/adminActions";
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from "@/lib/presales/documentTypes";
import { Badge, Card, PageHeader, inputClass, labelClass, buttonPrimaryClass } from "../../../../_components/ui";
import { SubmitButton } from "../../../../_components/SubmitButton";
import { FileSizeInput } from "../../../../_components/FileSizeInput";

const DOCUMENT_ICONS: Record<string, typeof FileText> = {
  survey: ClipboardList,
  proposal: ClipboardCheck,
  meeting_note: Video,
  project_plan: FileText,
  contract: FileSignature,
  survey_export: FileSpreadsheet,
  customer_upload: Upload,
  other: FileIcon,
};

const DOCUMENT_COLORS: Record<string, string> = {
  survey: "bg-indigo-100 text-indigo-600",
  proposal: "bg-svc-finance/10 text-svc-finance",
  meeting_note: "bg-brand-magenta/10 text-brand-magenta",
  project_plan: "bg-svc-data/10 text-svc-data",
  contract: "bg-amber-100 text-amber-700",
  survey_export: "bg-emerald-100 text-emerald-700",
  customer_upload: "bg-sky-100 text-sky-700",
  other: "bg-gray-100 text-text-muted",
};

export default async function JourneyDocumentsPage({ params }: { params: { id: string } }) {
  const journey = await prisma.journey.findUnique({
    where: { id: params.id },
    include: {
      documents: { include: { stage: true }, orderBy: { uploadedAt: "desc" } },
      prospect: true,
    },
  });
  if (!journey) notFound();

  const stages = await prisma.journeyStage.findMany({
    where: { journeyId: params.id, isActive: true },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Belgeler"
        description="Yüklenen dosyalar Google Drive'daki journey klasörüne, seçilen türe göre kendi alt klasörüne gider (Anket, Teklif, Toplantı Kaydı/Notu, Proje Planı, Sözleşme, Diğer) ve ilgili aşamaya bağlanarak aynı case içinde tutulur."
      />

      <Card className="mb-8">
        <form action={uploadDocument} className="space-y-4">
          <input type="hidden" name="journeyId" value={journey!.id} />
          <div>
            <label className={labelClass}>Başlık</label>
            <input name="title" required className={`${inputClass} w-full max-w-md`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tür</label>
              <select name="type" className={`${inputClass} w-full`}>
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {DOCUMENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>İlgili Aşama</label>
              <select name="stageId" className={`${inputClass} w-full`}>
                <option value="">Genel (aşamaya bağlı değil)</option>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Dosya</label>
            <FileSizeInput
              name="file"
              required
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-primary/10 file:px-3 file:py-1.5 file:text-brand-primary"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input type="checkbox" name="customerVisible" defaultChecked />
            Müşteriye görünür olsun
          </label>
          <SubmitButton className={buttonPrimaryClass} pendingLabel="Drive'a yükleniyor...">
            Yükle
          </SubmitButton>
        </form>
      </Card>

      <h2 className="mb-3 text-base font-semibold text-brand-dark">Yüklenen Belgeler</h2>
      <div className="space-y-2">
        {journey!.documents.map((doc) => {
          const Icon = DOCUMENT_ICONS[doc.type] ?? FileIcon;
          const colorClass = DOCUMENT_COLORS[doc.type] ?? DOCUMENT_COLORS.other;
          return (
            <a key={doc.id} href={doc.driveWebViewLink} target="_blank" rel="noopener noreferrer">
              <Card className="flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                  <Icon size={17} />
                </span>
                <div className="flex-1">
                  <p className="font-medium text-brand-dark">{doc.title}</p>
                  <p className="text-sm text-text-muted">{doc.stage?.name ?? "genel"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={doc.customerVisible ? "green" : "gray"}>
                    {doc.customerVisible ? "müşteriye görünür" : "sadece dahili"}
                  </Badge>
                  {doc.source === "customer_survey_upload" && <Badge color="pink">anket cevabı</Badge>}
                  {doc.type === "survey_export" && <Badge color="blue">anket Excel&apos;i</Badge>}
                </div>
              </Card>
            </a>
          );
        })}
        {journey!.documents.length === 0 && (
          <Card className="text-sm text-text-muted">Henüz belge yüklenmedi.</Card>
        )}
      </div>
    </div>
  );
}
