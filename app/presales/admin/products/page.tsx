import { prisma } from "@/lib/presales/db";
import { setProductActive, deleteProduct } from "@/lib/presales/adminActions";
import { Badge, Card, PageHeader, buttonSecondaryClass } from "../../_components/ui";
import { SubmitButton } from "../../_components/SubmitButton";
import { NewProductForm } from "./NewProductForm";

export default async function ProductsAdminPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader
        title="Ürünler / Uzmanlık Alanları"
        description="Case'lere atayabileceğin ürün/uzmanlık listesi. Bir case'e ürün atandığında, müşteri kendi journey sayfasında bunu satışçı bilgisinin yanında görür."
      />

      <div className="mb-8 space-y-2">
        {products.map((product) => (
          <Card key={product.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-brand-dark">{product.name}</p>
              {product.description && <p className="text-sm text-text-muted">{product.description}</p>}
            </div>
            <div className="flex items-center gap-3">
              {!product.isActive && <Badge color="gray">pasif</Badge>}
              <form action={setProductActive.bind(null, product.id, !product.isActive)}>
                <button className={buttonSecondaryClass}>{product.isActive ? "Pasifleştir" : "Aktifleştir"}</button>
              </form>
              <form action={deleteProduct.bind(null, product.id)}>
                <SubmitButton className={buttonSecondaryClass} pendingLabel="Siliniyor...">
                  Sil
                </SubmitButton>
              </form>
            </div>
          </Card>
        ))}
        {products.length === 0 && <Card className="text-sm text-text-muted">Henüz ürün/uzmanlık eklenmedi.</Card>}
      </div>

      <NewProductForm />
    </div>
  );
}
