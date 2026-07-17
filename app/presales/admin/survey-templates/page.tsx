import Link from "next/link";
import { prisma } from "@/lib/presales/db";
import { createSurveyTemplate, duplicateSurveyTemplate, deleteSurveyTemplate } from "@/lib/presales/adminActions";
import { Badge, Card, PageHeader, inputClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from "../../_components/ui";
import { SubmitButton } from "../../_components/SubmitButton";

export default async function SurveyTemplatesAdminPage() {
  const templates = await prisma.surveyTemplate.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Anket Şablonları"
        description='İsimlendirip kaydedebileceğin, tekrar kullanılabilir soru listeleri. Bir case için anket oluştururken buradaki bir şablonu seçip "Şablonu Yükle" diyebilir, sonra istersen üzerinde değişiklik yapabilirsin — her seferinde sıfırdan soru yazmana gerek kalmaz. Şablonun hangi aşama için olduğunu ismiyle belirtmen yeterli, ayrıca bir aşamaya bağlamana gerek yok.'
      />

      {templates.length > 0 && (
        <div className="mb-8 space-y-2">
          {templates.map((template) => (
            <Card key={template.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  href={`/presales/admin/survey-templates/${template.id}`}
                  className="font-medium text-brand-dark hover:underline"
                >
                  {template.name}
                </Link>
                <Badge color="blue">{template._count.items} soru</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/presales/admin/survey-templates/${template.id}`} className={buttonSecondaryClass}>
                  Düzenle
                </Link>
                <form action={duplicateSurveyTemplate.bind(null, template.id)}>
                  <SubmitButton className={buttonSecondaryClass} pendingLabel="Çoğaltılıyor...">
                    Çoğalt
                  </SubmitButton>
                </form>
                <form action={deleteSurveyTemplate.bind(null, template.id)}>
                  <SubmitButton className={buttonSecondaryClass} pendingLabel="Siliniyor...">
                    Sil
                  </SubmitButton>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
      {templates.length === 0 && (
        <Card className="mb-8 text-sm text-text-muted">Henüz anket şablonu yok.</Card>
      )}

      <Card className="max-w-xl">
        <h2 className="mb-4 text-base font-semibold text-brand-dark">Yeni Şablon Oluştur</h2>
        <form action={createSurveyTemplate} className="space-y-4">
          <div>
            <label className={labelClass}>Şablon Adı</label>
            <input
              name="name"
              required
              placeholder="ör. Teknik Demo Soruları"
              className={`${inputClass} w-full`}
            />
          </div>
          <SubmitButton className={buttonPrimaryClass} pendingLabel="Oluşturuluyor...">
            Oluştur ve Soru Eklemeye Başla
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
