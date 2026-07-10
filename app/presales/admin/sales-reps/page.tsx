import { prisma } from "@/lib/presales/db";
import { Card, PageHeader } from "../../_components/ui";
import { SalesRepRow } from "./SalesRepRow";
import { NewSalesRepForm } from "./NewSalesRepForm";

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

      <NewSalesRepForm />
    </div>
  );
}
