import Link from "next/link";
import { prisma } from "@/lib/presales/db";
import { createProspectAndJourney } from "@/lib/presales/adminActions";
import { Card, PageHeader, inputClass, labelClass, buttonPrimaryClass } from "../../../_components/ui";
import { SubmitButton } from "../../../_components/SubmitButton";

export default async function NewProspectPage() {
  const salesReps = await prisma.salesRep.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const stageTemplates = await prisma.stageTemplate.findMany({ orderBy: [{ isDefault: "desc" }, { name: "asc" }] });
  const defaultStageTemplateId = stageTemplates.find((t) => t.isDefault)?.id ?? stageTemplates[0]?.id ?? "";

  return (
    <div>
      <PageHeader title="Yeni Prospect" description="Yeni bir prospect ve journey oluştur." />

      {(salesReps.length === 0 || products.length === 0 || stageTemplates.length === 0) && (
        <Card className="mb-6 border-amber-200 bg-amber-50 text-sm text-amber-800">
          Satışçı, ürün/uzmanlık ve aşama şablonu seçimi artık zorunlu, ama{" "}
          {salesReps.length === 0 && (
            <>
              henüz aktif bir satışçı yok —{" "}
              <Link href="/presales/admin/sales-reps" className="font-medium underline">
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
