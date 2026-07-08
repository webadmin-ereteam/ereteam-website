import { notFound } from "next/navigation";
import { prisma } from "@/lib/presales/db";
import {
  assignSalesRep,
  assignProduct,
  toggleProposalRequested,
  setJourneyOutcome,
  setJourneyLinkDisabled,
  setJourneyArchived,
} from "@/lib/presales/adminActions";
import { isJourneyLinkActive } from "@/lib/presales/journeyLink";
import { JOURNEY_STATUSES, JOURNEY_STATUS_LABELS } from "@/lib/presales/journeyStatus";
import { Badge, Card, inputClass, buttonPrimaryClass, buttonSecondaryClass } from "../../../../_components/ui";
import { SubmitButton } from "../../../../_components/SubmitButton";

export default async function JourneySettingsTab({ params }: { params: { id: string } }) {
  const journey = await prisma.journey.findUnique({ where: { id: params.id } });
  if (!journey) notFound();

  const salesReps = await prisma.salesRep.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const linkActive = isJourneyLinkActive(journey!);
  const assignedProduct = journey!.productId
    ? products.find((p) => p.id === journey!.productId) ?? (await prisma.product.findUnique({ where: { id: journey!.productId! } }))
    : null;

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <p className="mb-2 text-sm font-medium text-brand-dark">Satışçı</p>
        <p className="mb-3 text-xs text-text-muted">
          Atanan satışçının bilgileri müşteri sayfasında gösterilir ve anket tamamlandığında bu satışçıya
          e-posta bildirimi gider.
        </p>
        <form action={assignSalesRep.bind(null, journey!.id)} className="flex gap-2">
          <select name="salesRepId" defaultValue={journey!.salesRepId ?? ""} className={`${inputClass} flex-1`}>
            <option value="">— Atanmadı —</option>
            {salesReps.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.name}
              </option>
            ))}
          </select>
          <SubmitButton className={buttonSecondaryClass} pendingLabel="Atanıyor...">
            Ata
          </SubmitButton>
        </form>
      </Card>

      <Card>
        <p className="mb-2 text-sm font-medium text-brand-dark">Ürün / Uzmanlık</p>
        {assignedProduct ? (
          <>
            <p className="mb-3 text-xs text-text-muted">
              Journey oluşturulurken seçildi ve artık değiştirilemez — yanlış seçildiyse yeni bir journey
              oluşturulmalı.
            </p>
            <p className="text-sm font-medium text-brand-dark">{assignedProduct.name}</p>
          </>
        ) : (
          <>
            <p className="mb-3 text-xs text-text-muted">
              Bu case&apos;in hangi ürün/uzmanlık alanıyla ilgili olduğu; müşteri sayfasında satışçı bilgisinin
              yanında gösterilir. Bir kez atandıktan sonra değiştirilemez.
            </p>
            <form action={assignProduct.bind(null, journey!.id)} className="flex gap-2">
              <select name="productId" defaultValue="" className={`${inputClass} flex-1`}>
                <option value="">— Atanmadı —</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <SubmitButton className={buttonSecondaryClass} pendingLabel="Atanıyor...">
                Ata
              </SubmitButton>
            </form>
          </>
        )}
      </Card>

      <Card>
        <div className="mb-2 flex items-center gap-2">
          <p className="text-sm font-medium text-brand-dark">Müşteri Linki</p>
          <Badge color={linkActive ? "green" : "gray"}>{linkActive ? "Aktif" : "Pasif"}</Badge>
        </div>
        <p className="mb-3 text-xs text-text-muted">
          {journey!.linkDisabled
            ? "Link elle pasifleştirildi — müşteri artık sayfayı açamaz."
            : journey!.archived
            ? "Journey arşivlendiği için link otomatik olarak pasif."
            : journey!.status !== "active"
            ? `Süreç "${JOURNEY_STATUS_LABELS[journey!.status] ?? journey!.status}" olduğu için link otomatik olarak pasif — sadece süreç "Aktif" iken müşteriye açık kalır.`
            : "Müşteri şu anda linkle sayfaya erişebilir. İstediğin zaman elle pasifleştirebilirsin."}
        </p>
        <form action={setJourneyLinkDisabled.bind(null, journey!.id, !journey!.linkDisabled)}>
          <SubmitButton className={journey!.linkDisabled ? buttonPrimaryClass : buttonSecondaryClass}>
            {journey!.linkDisabled ? "Linki elle aktifleştir" : "Linki elle pasifleştir"}
          </SubmitButton>
        </form>
      </Card>

      <Card>
        <p className="mb-2 text-sm font-medium text-brand-dark">Teklif Talebi</p>
        <p className="mb-3 text-xs text-text-muted">
          Stage 2/3/4&apos;ten erken teklif talebi geldiyse burada işaretle.
        </p>
        <form action={toggleProposalRequested.bind(null, journey!.id, !journey!.proposalRequested)}>
          <SubmitButton className={journey!.proposalRequested ? buttonSecondaryClass : buttonPrimaryClass}>
            {journey!.proposalRequested ? "Talebi kaldır" : "Teklif talep edildi"}
          </SubmitButton>
        </form>
      </Card>

      <Card>
        <div className="mb-2 flex items-center gap-2">
          <p className="text-sm font-medium text-brand-dark">Arşiv</p>
          <Badge color={journey!.archived ? "gray" : "green"}>{journey!.archived ? "Arşivlendi" : "Aktif"}</Badge>
        </div>
        <p className="mb-3 text-xs text-text-muted">
          Durumdan bağımsız — kazanılan veya kaybedilen bir journey de arşivlenebilir. Arşivlenince müşteri
          linki otomatik pasif olur.
        </p>
        <form action={setJourneyArchived.bind(null, journey!.id, !journey!.archived)}>
          <SubmitButton className={journey!.archived ? buttonPrimaryClass : buttonSecondaryClass}>
            {journey!.archived ? "Arşivden çıkar" : "Arşivle"}
          </SubmitButton>
        </form>
      </Card>

      <Card className="col-span-2">
        <p className="mb-1 text-sm font-medium text-brand-dark">Durum</p>
        <p className="mb-3 text-xs text-text-muted">
          Sadece admin görür — ileride nerede doğru/yanlış yapıldığını analiz etmek için kullanılacak.
        </p>
        <form action={setJourneyOutcome.bind(null, journey!.id)} className="max-w-md space-y-2">
          <select name="status" defaultValue={journey!.status} className={`${inputClass} w-full`}>
            {JOURNEY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {JOURNEY_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <div>
            <label className="mb-1 block text-xs text-text-muted">
              Kapanış Tarihi (opsiyonel — durum &quot;Kazanıldı&quot;/&quot;Kaybedildi&quot; olunca boş
              bırakılırsa otomatik bugünün tarihi alınır)
            </label>
            <input
              type="date"
              name="outcomeSetAt"
              defaultValue={journey!.outcomeSetAt ? journey!.outcomeSetAt.toISOString().slice(0, 10) : ""}
              className={`${inputClass} w-full`}
            />
          </div>
          <textarea
            name="outcomeReason"
            defaultValue={journey!.outcomeReason ?? ""}
            placeholder="Sebep (opsiyonel — ör. bütçe uymadı, rakip seçildi, zamanlama)"
            rows={2}
            className={`${inputClass} w-full`}
          />
          <SubmitButton className={buttonPrimaryClass}>Kaydet</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
