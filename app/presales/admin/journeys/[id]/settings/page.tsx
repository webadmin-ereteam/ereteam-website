import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/presales/db";
import {
  assignSalesRep,
  assignTechnicalLead,
  assignProduct,
  toggleProposalRequested,
  setJourneyOutcome,
  setJourneyLinkDisabled,
  setJourneyArchived,
  uploadCompanyLogo,
  uploadCompanyLogoFromUrl,
  removeCompanyLogo,
  setProspectLogoAlign,
  deleteJourney,
} from "@/lib/presales/adminActions";
import { isJourneyLinkActive } from "@/lib/presales/journeyLink";
import { JOURNEY_STATUSES, JOURNEY_STATUS_LABELS } from "@/lib/presales/journeyStatus";
import { Badge, Card, inputClass, buttonPrimaryClass, buttonSecondaryClass } from "../../../../_components/ui";
import { SubmitButton } from "../../../../_components/SubmitButton";
import { FileSizeInput } from "../../../../_components/FileSizeInput";

export default async function JourneySettingsTab({ params }: { params: { id: string } }) {
  const journey = await prisma.journey.findUnique({ where: { id: params.id }, include: { prospect: true } });
  if (!journey) notFound();

  const salesReps = await prisma.salesRep.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const technicalLeads = await prisma.technicalLead.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
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
        <p className="mb-2 text-sm font-medium text-brand-dark">Teknik Sorumlu</p>
        <p className="mb-3 text-xs text-text-muted">
          Müşteri sayfasında hiç gösterilmez. Anket tamamlandığında bu kişiye, satışçıya giden bildirimden farklı
          olarak, cevapların Excel dosyası e-posta eki halinde gider.
        </p>
        <form action={assignTechnicalLead.bind(null, journey!.id)} className="flex gap-2">
          <select name="technicalLeadId" defaultValue={journey!.technicalLeadId ?? ""} className={`${inputClass} flex-1`}>
            <option value="">— Atanmadı —</option>
            {technicalLeads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name}
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
        <p className="mb-2 text-sm font-medium text-brand-dark">Firma Logosu</p>
        <p className="mb-3 text-xs text-text-muted">
          Müşteri sayfasının üst kısmında büyük şekilde gösterilir. Transparan PNG öneriyoruz — arka
          plan eklenmez, logo olduğu gibi görünür. Drive&apos;da ayrı bir &quot;_Logolar&quot; klasöründe
          tutulur, journey belgelerinize karışmaz.
        </p>
        {journey!.prospect.logoUrl && (
          <div
            className={`mb-3 flex h-20 max-w-xs items-center rounded-xl bg-gray-50 px-4 ${
              journey!.prospect.logoAlign === "center"
                ? "justify-center"
                : journey!.prospect.logoAlign === "right"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <img
              src={journey!.prospect.logoUrl}
              alt={journey!.prospect.companyName}
              className="max-h-14 max-w-full object-contain"
            />
          </div>
        )}
        {journey!.prospect.logoUrl && (
          <form action={setProspectLogoAlign.bind(null, journey!.id)} className="mb-3 flex items-center gap-2">
            <label className="text-xs text-text-muted">Müşteri sayfasında hizalama:</label>
            <select name="logoAlign" defaultValue={journey!.prospect.logoAlign} className={`${inputClass} w-32`}>
              <option value="left">Sola</option>
              <option value="center">Ortaya</option>
              <option value="right">Sağa</option>
            </select>
            <SubmitButton className={buttonSecondaryClass} pendingLabel="Uygulanıyor...">
              Uygula
            </SubmitButton>
          </form>
        )}
        <form action={uploadCompanyLogo.bind(null, journey!.id)} className="flex gap-2">
          <FileSizeInput
            name="logo"
            required
            accept="image/*"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-primary/10 file:px-3 file:py-1.5 file:text-brand-primary"
          />
          <SubmitButton className={buttonSecondaryClass} pendingLabel="Yükleniyor...">
            {journey!.prospect.logoUrl ? "Değiştir" : "Yükle"}
          </SubmitButton>
          {journey!.prospect.logoUrl && (
            <SubmitButton
              formAction={removeCompanyLogo.bind(null, journey!.id)}
              formNoValidate
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              pendingLabel="Kaldırılıyor..."
            >
              Kaldır
            </SubmitButton>
          )}
        </form>
        <form action={uploadCompanyLogoFromUrl.bind(null, journey!.id)} className="mt-2 flex gap-2">
          <input
            name="logoUrl"
            type="url"
            required
            placeholder="veya link ile: https://firma.com/logo.png"
            className={`${inputClass} flex-1`}
          />
          <SubmitButton className={buttonSecondaryClass} pendingLabel="Alınıyor...">
            {journey!.prospect.logoUrl ? "Değiştir" : "Al"}
          </SubmitButton>
        </form>
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

      <Card className="col-span-2 border-red-200 bg-red-50/30">
        <p className="mb-2 text-sm font-medium text-red-700">Tehlikeli Bölge</p>
        <p className="mb-3 text-xs text-text-muted">
          Journey&apos;i ve buna bağlı tüm anket/cevap/belge kayıtlarını veritabanından siler — bu geri
          alınamaz. <strong className="text-text-body">Drive&apos;daki klasör otomatik silinmez</strong> —
          içinde teklif, kayıt gibi gerçek dosyalar olabileceği için bu adım kasıtlı olarak elle
          bırakıldı. Silmeden önce{" "}
          {journey!.driveFolderId ? (
            <a
              href={`https://drive.google.com/drive/folders/${journey!.driveFolderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-brand-primary hover:underline"
            >
              Drive&apos;da klasörü aç <ExternalLink size={11} />
            </a>
          ) : (
            <span>Drive&apos;da &quot;{journey!.name}&quot; adlı klasörü bul</span>
          )}{" "}
          ve gerekiyorsa elle sil.
        </p>
        <form action={deleteJourney.bind(null, journey!.id)}>
          <SubmitButton
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            pendingLabel="Siliniyor..."
            confirmMessage={`"${journey!.name}" journey'ini silmek üzeresin. Bu, veritabanındaki tüm anket/cevap/belge kayıtlarını kalıcı olarak siler ve geri alınamaz. Drive'daki klasör otomatik silinmez — onu elle silmen gerekir. Devam edilsin mi?`}
          >
            Journey&apos;i Sil
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
