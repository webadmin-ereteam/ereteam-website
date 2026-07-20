import { prisma } from "@/lib/presales/db";
import { Card, PageHeader } from "../../_components/ui";
import { TechnicalLeadRow } from "./TechnicalLeadRow";
import { NewTechnicalLeadForm } from "./NewTechnicalLeadForm";

export default async function TechnicalLeadsAdminPage() {
  const technicalLeads = await prisma.technicalLead.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader
        title="Teknik Ekip"
        description="Case'lere atayabileceğin teknik sorumlu listesi. Satışçıdan farklı olarak müşteri sayfasında hiç gösterilmez — tek amacı, müşteri bir anketi tamamladığında cevapların Excel olarak bu kişiye de e-posta ile gitmesi."
      />

      <div className="mb-8 space-y-2">
        {technicalLeads.map((lead) => (
          <TechnicalLeadRow key={lead.id} lead={lead} />
        ))}
        {technicalLeads.length === 0 && (
          <Card className="text-sm text-text-muted">Henüz teknik sorumlu eklenmedi.</Card>
        )}
      </div>

      <NewTechnicalLeadForm />
    </div>
  );
}
