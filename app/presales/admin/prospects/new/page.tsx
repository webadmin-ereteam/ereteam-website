import Link from "next/link";
import { prisma } from "@/lib/presales/db";
import { createProspectAndJourney } from "@/lib/presales/adminActions";
import { Card, PageHeader, inputClass, labelClass, buttonPrimaryClass } from "../../../_components/ui";
import { SubmitButton } from "../../../_components/SubmitButton";
import { FileSizeInput } from "../../../_components/FileSizeInput";

export default async function NewProspectPage() {
  const salesReps = await prisma.salesRep.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const technicalLeads = await prisma.technicalLead.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const stageTemplates = await prisma.stageTemplate.findMany({ orderBy: [{ isDefault: "desc" }, { name: "asc" }] });
  const defaultStageTemplateId = stageTemplates.find((t) => t.isDefault)?.id ?? stageTemplates[0]?.id ?? "";

  return (
    <div>
      <PageHeader title="Yeni Prospect" description="Yeni bir prospect ve journey oluştur." />

      {(salesReps.length === 0 || technicalLeads.length === 0 || products.length === 0 || stageTemplates.length === 0) && (
        <Card className="mb-6 border-amber-200 bg-amber-50 text-sm text-amber-800">
          Satışçı, teknik sorumlu, ürün/uzmanlık ve aşama şablonu seçimi artık zorunlu, ama{" "}
          {salesReps.length === 0 && (
            <>
              henüz aktif bir satışçı yok —{" "}
              <Link href="/presales/admin/sales-reps" className="font-medium underline">
                önce buradan ekle
              </Link>
              .{" "}
            </>
          )}
          {technicalLeads.length === 0 && (
            <>
              henüz aktif bir teknik sorumlu yok —{" "}
              <Link href="/presales/admin/technical-leads" className="font-medium underline">
                önce buradan ekle
              </Link>
              .{" "}
            </>
          )}
          {products.length === 0 && (
            <>
              henüz aktif bir ürün/uzmanlık yok —{" "}
              <Link href="/presales/admin/products" className="font-medium underline">
                önce buradan ekle
              </Link>
              .{" "}
            </>
          )}
          {stageTemplates.length === 0 && (
            <>
              henüz bir aşama şablonu yok —{" "}
              <Link href="/presales/admin/stages" className="font-medium underline">
                önce buradan ekle
              </Link>
              .
            </>
          )}
        </Card>
      )}

      <Card className="max-w-xl">
        <form action={createProspectAndJourney} className="space-y-4">
          <div>
            <label className={labelClass}>Şirket Adı</label>
            <input name="companyName" required className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className={labelClass}>Kişi Adı</label>
            <input name="contactName" required className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className={labelClass}>E-posta</label>
            <input name="contactEmail" type="email" required className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className={labelClass}>Telefon (opsiyonel)</label>
            <input name="contactPhone" className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className={labelClass}>Firma Logosu (opsiyonel)</label>
            <FileSizeInput
              name="logo"
              accept="image/*"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-primary/10 file:px-3 file:py-1.5 file:text-brand-primary"
            />
            <p className="mt-1 text-xs text-text-muted">
              Şimdi eklemesen de olur — daha sonra journeyin Ayarlar sekmesinden ekleyebilirsin.
            </p>
          </div>
          <div>
            <label className={labelClass}>Satışçı</label>
            <select name="salesRepId" required defaultValue="" className={`${inputClass} w-full`}>
              <option value="" disabled>
                — Seçiniz —
              </option>
              {salesReps.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  {rep.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Teknik Sorumlu</label>
            <select name="technicalLeadId" required defaultValue="" className={`${inputClass} w-full`}>
              <option value="" disabled>
                — Seçiniz —
              </option>
              {technicalLeads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-text-muted">
              Müşteri sayfasında gösterilmez — sadece anket cevapları tamamlandığında Excel eki olarak bu kişiye
              de mail gider.
            </p>
          </div>
          <div>
            <label className={labelClass}>Ürün / Uzmanlık</label>
            <select name="productId" required defaultValue="" className={`${inputClass} w-full`}>
              <option value="" disabled>
                — Seçiniz —
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Aşama Şablonu</label>
            <select
              name="stageTemplateId"
              required
              defaultValue={defaultStageTemplateId}
              className={`${inputClass} w-full`}
            >
              <option value="" disabled>
                — Seçiniz —
              </option>
              {stageTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                  {template.isDefault ? " (varsayılan)" : ""}
                </option>
              ))}
            </select>
          </div>
          <SubmitButton className={buttonPrimaryClass} pendingLabel="Oluşturuluyor...">
            Oluştur ve Journey Başlat
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
