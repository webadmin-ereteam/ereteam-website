import { prisma } from "@/lib/presales/db";
import { createProduct, setProductActive } from "@/lib/presales/adminActions";
import { Badge, Card, PageHeader, inputClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from "../../_components/ui";
import { SubmitButton } from "../../_components/SubmitButton";

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
            </div>
          </Card>
        ))}
        {products.length === 0 && <Card className="text-sm text-text-muted">Henüz ürün/uzmanlık eklenmedi.</Card>}
      </div>

      <Card className="max-w-xl">
        <h2 className="mb-4 text-base font-semibold text-brand-dark">Yeni Ürün / Uzmanlık Ekle</h2>
        <form action={createProduct} className="space-y-4">
          <div>
            <label className={labelClass}>Ad</label>
            <input name="name" required placeholder="ör. Obserian" className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className={labelClass}>Açıklama (opsiyonel)</label>
            <input name="description" className={`${inputClass} w-full`} />
          </div>
          <SubmitButton className={buttonPrimaryClass} pendingLabel="Ekleniyor...">
            Ekle
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}
