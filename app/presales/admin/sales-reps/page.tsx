import { prisma } from "@/lib/presales/db";
import { createSalesRep, setSalesRepActive, deleteSalesRep } from "@/lib/presales/adminActions";
import { Badge, Card, PageHeader, inputClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from "../../_components/ui";
import { SubmitButton } from "../../_components/SubmitButton";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

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
          <Card key={rep.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-magenta text-sm font-semibold text-white">
                {initials(rep.name)}
              </span>
              <div>
                <p className="font-medium text-brand-dark">
                  {rep.name} {rep.title && <span className="text-sm font-normal text-text-muted">· {rep.title}</span>}
                </p>
                <p className="text-sm text-text-muted">
                  {rep.email} {rep.phone && `· ${rep.phone}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!rep.isActive && <Badge color="gray">pasif</Badge>}
              <form action={setSalesRepActive.bind(null, rep.id, !rep.isActive)}>
                <button className={buttonSecondaryClass}>{rep.isActive ? "Pasifleştir" : "Aktifleştir"}</button>
              </form>
              <form action={deleteSalesRep.bind(null, rep.id)}>
                <SubmitButton className={buttonSecondaryClass} pendingLabel="Siliniyor...">
                  Sil
                </SubmitButton>
              </form>
            </div>
          </Card>
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
