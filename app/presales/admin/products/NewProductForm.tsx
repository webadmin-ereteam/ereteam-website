"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createProduct } from "@/lib/presales/adminActions";
import { Card, inputClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from "../../_components/ui";
import { SubmitButton } from "../../_components/SubmitButton";

export function NewProductForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${buttonSecondaryClass} inline-flex items-center gap-1.5`}
      >
        <Plus size={14} /> Yeni Ürün / Uzmanlık Ekle
      </button>
    );
  }

  return (
    <Card className="max-w-xl">
      <h2 className="mb-4 text-base font-semibold text-brand-dark">Yeni Ürün / Uzmanlık Ekle</h2>
      <form
        action={async (formData) => {
          await createProduct(formData);
          setOpen(false);
        }}
        className="space-y-4"
      >
        <div>
          <label className={labelClass}>Ad</label>
          <input name="name" required placeholder="ör. Obserian" className={`${inputClass} w-full`} />
        </div>
        <div>
          <label className={labelClass}>Açıklama (opsiyonel)</label>
          <input name="description" className={`${inputClass} w-full`} />
        </div>
        <div className="flex gap-2">
          <SubmitButton className={buttonPrimaryClass} pendingLabel="Ekleniyor...">
            Ekle
          </SubmitButton>
          <button type="button" className={buttonSecondaryClass} onClick={() => setOpen(false)}>
            Vazgeç
          </button>
        </div>
      </form>
    </Card>
  );
}
