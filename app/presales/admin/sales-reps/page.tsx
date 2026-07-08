import { prisma } from "@/lib/presales/db";
import { createSalesRep } from "@/lib/presales/adminActions";
import { Card, PageHeader, inputClass, labelClass, buttonPrimaryClass } from "../../_components/ui";
import { SubmitButton } from "../../_components/SubmitButton";
import { SalesRepRow } from "./SalesRepRow";

export default async function SalesRepsAdminPage() {
  const salesReps = await prisma.salesRep.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader
        title="Satışçılar"
        description="Case'lere atayabileceğin satışçı listesi. Bir case'e satışçı atandığında, müşteri kendi journey sayfasında o satışçının iletişim bilgilerini görür."
      />

      <div className="mb-8 space-y-2">
        {salesReps.map((rep) => (
          <SalesRepRow key={rep.id} rep={rep} />
        ))}
        {salesReps.length === 0 && <Card className="text-sm text-text-muted">Henüz satışçı eklenmedi.</Card>}
      </div>

      <Card className="max-w-xl">
        <h2 className="mb-4 text-base font-semibold text-brand-dark">Yeni Satışçı Ekle</h2>
        <form action={createSalesRep} className="space-y-4">
          <div>
            <label className={labelClass}>Ad Soyad</label>
            <input name="name" required className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className={labelClass}>E-posta</label>
            <input name="email" type="email" required className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className={labelClass}>Telefon (opsiyonel)</label>
            <input name="phone" className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className={labelClass}>Ünvan (opsiyonel)</label>
            <input name="title" placeholder="ör. Account Executive" className={`${inputClass} w-full`} />
          </div>
          <SubmitButton className={buttonPrimaryClass} pendingLabel="Ekleniyor...">
            Ekle
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
