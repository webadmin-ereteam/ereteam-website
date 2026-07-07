import { prisma } from "@/lib/presales/db";
import { createSurveyTemplate } from "@/lib/presales/adminActions";
import { Card, PageHeader, inputClass, labelClass, buttonPrimaryClass } from "../../_components/ui";
import { SubmitButton } from "../../_components/SubmitButton";
import { QuestionListEditor } from "../../_components/QuestionListEditor";
import { SurveyTemplateCard } from "./SurveyTemplateCard";

export default async function SurveyTemplatesAdminPage() {
  const templates = await prisma.surveyTemplate.findMany({
    include: { items: { orderBy: { order: "asc" } } },
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
          {templates.map((tpl) => (
            <SurveyTemplateCard key={tpl.id} template={tpl} />
          ))}
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-base font-semibold text-brand-dark">Yeni Şablon Oluştur</h2>
        <form action={createSurveyTemplate} className="space-y-4">
          <div>
            <label className={labelClass}>Şablon Adı</label>
            <input
              name="name"
              required
              placeholder="ör. Teknik Demo Soruları"
              className={`${inputClass} w-full max-w-md`}
            />
          </div>
          <QuestionListEditor />
          <SubmitButton className={buttonPrimaryClass} pendingLabel="Kaydediliyor...">
            Şablon Olarak Kaydet
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
