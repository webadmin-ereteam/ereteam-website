import Link from "next/link";
import { prisma } from "@/lib/presales/db";
import { createStageTemplate, duplicateStageTemplate, deleteStageTemplate } from "@/lib/presales/adminActions";
import { Badge, Card, PageHeader, inputClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from "../../_components/ui";
import { SubmitButton } from "../../_components/SubmitButton";

export default async function StageTemplatesAdminPage() {
  const templates = await prisma.stageTemplate.findMany({
    include: { _count: { select: { stages: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Aşama Şablonları"
        description={
          'Birden fazla isimlendirilmiş süreç akışı tanımlayabilirsin (ör. "Standart Süreç", "Enterprise Süreç"). Yeni bir prospect oluştururken hangi şablonla başlanacağı seçilir — o şablonun aşamaları o journey\'e kopyalanır. Bir şablonu düzenlemek sadece ondan sonra oluşturulan journey\'leri etkiler.'
        }
      />

      <div className="mb-8 space-y-2">
        {templates.map((template) => (
          <Card key={template.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href={`/presales/admin/stages/${template.id}`} className="font-medium text-brand-dark hover:underline">
                {template.name}
              </Link>
              <Badge color="blue">{template._count.stages} aşama</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/presales/admin/stages/${template.id}`} className={buttonSecondaryClass}>
                Düzenle
              </Link>
              <form action={duplicateStageTemplate.bind(null, template.id)}>
                <SubmitButton className={buttonSecondaryClass} pendingLabel="Çoğaltılıyor...">
                  Çoğalt
                </SubmitButton>
              </form>
              <form action={deleteStageTemplate.bind(null, template.id)}>
                <SubmitButton className={buttonSecondaryClass} pendingLabel="Siliniyor...">
                  Sil
                </SubmitButton>
              </form>
            </div>
          </Card>
        ))}
        {templates.length === 0 && <Card className="text-sm text-text-muted">Henüz aşama şablonu yok.</Card>}
      </div>

      <Card className="max-w-xl">
        <h2 className="mb-4 text-base font-semibold text-brand-dark">Yeni Şablon Oluştur</h2>
        <form action={createStageTemplate} className="space-y-4">
          <div>
            <label className={labelClass}>Şablon Adı</label>
            <input name="name" required placeholder="ör. Enterprise Süreç" className={`${inputClass} w-full`} />
          </div>
          <SubmitButton className={buttonPrimaryClass} pendingLabel="Oluşturuluyor...">
            Oluştur ve Aşama Eklemeye Başla
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
