import { notFound } from "next/navigation";
import { prisma } from "@/lib/presales/db";
import { createJourneyStage } from "@/lib/presales/adminActions";
import { Card, buttonPrimaryClass, inputClass } from "../../../../_components/ui";
import { SubmitButton } from "../../../../_components/SubmitButton";
import { JourneyStagesList } from "./JourneyStagesList";

export default async function JourneyStagesTab({ params }: { params: { id: string } }) {
  const journey = await prisma.journey.findUnique({
    where: { id: params.id },
    include: {
      stages: {
        orderBy: { order: "asc" },
        include: { surveyInstances: { select: { status: true } } },
      },
    },
  });

  if (!journey) notFound();

  return (
    <Card>
      <h2 className="mb-1 text-base font-semibold text-brand-dark">Aşamalar (bu case&apos;e özel)</h2>
      <p className="mb-4 text-xs text-text-muted">
        Bu aşamalar varsayılan şablondan kopyalandı — burada değiştirmen sadece bu journey&apos;i etkiler.
        Sırayı değiştirmek için kartları sürükleyip bırak — bu anında kaydedilir. Diğer alanlardaki
        değişiklikler için tüm kartları düzenledikten sonra en alttaki &quot;Tüm Değişiklikleri Kaydet&quot;
        butonuna bir kez basman yeterli. Tamamla/geri al/gizle/silme de anında uygulanır — anket
        gönderilmiş bir aşama silinemez, onun yerine gizleyebilirsin.
      </p>
      <JourneyStagesList journeyId={journey!.id} stages={journey!.stages} />

      <form action={createJourneyStage} className="mt-4 grid grid-cols-12 gap-2 border-t border-gray-100 pt-4">
        <input type="hidden" name="journeyId" value={journey!.id} />
        <input name="key" placeholder="key" required className={`${inputClass} col-span-2`} />
        <input name="name" placeholder="Aşama adı (bu case'e özel)" required className={`${inputClass} col-span-6`} />
        <input
          name="estimatedDays"
          type="number"
          min={0}
          placeholder="gün"
          title="Tahmini süre (gün)"
          className={`${inputClass} col-span-2`}
        />
        <SubmitButton className={`${buttonPrimaryClass} col-span-2`} pendingLabel="Ekleniyor...">
          + Ekle
        </SubmitButton>
      </form>
    </Card>
  );
}
