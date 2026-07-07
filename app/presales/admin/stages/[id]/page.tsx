import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/presales/db";
import { upsertStageDefinition, renameStageTemplate } from "@/lib/presales/adminActions";
import { Card, PageHeader, inputClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from "../../../_components/ui";
import { SubmitButton } from "../../../_components/SubmitButton";
import { StageDefinitionsList } from "../StageDefinitionsList";

export default async function StageTemplateEditorPage({ params }: { params: { id: string } }) {
  const template = await prisma.stageTemplate.findUnique({
    where: { id: params.id },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  if (!template) notFound();

  return (
    <div>
      <Link
        href="/presales/admin/stages"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-primary"
      >
        <ArrowLeft size={14} /> Tüm şablonlar
      </Link>

      <PageHeader
        title={template!.name}
        description={
          'Bu şablondaki aşamalar, bu şablon seçilerek başlatılan her yeni journey\'e kopyalanır. "Dahili açıklama" sadece burada görünür; "müşteriye görünen açıklama" müşteri sayfasında gösterilir. Sırayı değiştirmek için kartları sürükleyip bırak. Otomatik kayıt yoktur — bir alanı değiştirdikten sonra o kartın "Kaydet" butonuna basmalısın.'
        }
      />

      <Card className="mb-6 max-w-md">
        <form action={renameStageTemplate.bind(null, template!.id)} className="flex items-end gap-2">
          <div className="flex-1">
            <label className={labelClass}>Şablon Adı</label>
            <input name="name" defaultValue={template!.name} required className={`${inputClass} w-full`} />
          </div>
          <SubmitButton className={buttonSecondaryClass}>Kaydet</SubmitButton>
        </form>
      </Card>

      <div className="mb-10">
        <StageDefinitionsList stageTemplateId={template!.id} stages={template!.stages} />
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-brand-dark">Yeni Aşama Ekle</h2>
        <form action={upsertStageDefinition.bind(null, template!.id)} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Key</label>
              <input name="key" placeholder="ör. proposal_shared" required className={`${inputClass} w-full`} />
            </div>
            <div>
              <label className={labelClass}>Aşama Adı</label>
              <input name="name" required className={`${inputClass} w-full`} />
            </div>
            <div>
              <label className={labelClass}>Tahmini Süre (gün)</label>
              <input name="estimatedDays" type="number" min={0} className={`${inputClass} w-full`} />
            </div>
          </div>
          <textarea name="description" placeholder="Dahili açıklama" rows={2} className={`${inputClass} w-full`} />
          <textarea
            name="customerDescription"
            placeholder="Müşteriye görünen açıklama"
            rows={2}
            className={`${inputClass} w-full`}
          />
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-text-muted">
                <input type="checkbox" name="customerVisible" defaultChecked />
                Müşteriye göster
              </label>
              <label className="flex items-center gap-2 text-sm text-text-muted">
                <input type="checkbox" name="surveysEnabled" defaultChecked />
                Anket gönderilsin
              </label>
            </div>
            <SubmitButton className={buttonPrimaryClass} pendingLabel="Ekleniyor...">
              Ekle
            </SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
