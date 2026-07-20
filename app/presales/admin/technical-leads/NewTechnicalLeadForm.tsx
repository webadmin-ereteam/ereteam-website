"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createTechnicalLead } from "@/lib/presales/adminActions";
import { Card, inputClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from "../../_components/ui";
import { SubmitButton } from "../../_components/SubmitButton";

export function NewTechnicalLeadForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${buttonSecondaryClass} inline-flex items-center gap-1.5`}
      >
        <Plus size={14} /> Yeni Teknik Sorumlu Ekle
      </button>
    );
  }

  return (
    <Card className="max-w-xl">
      <h2 className="mb-4 text-base font-semibold text-brand-dark">Yeni Teknik Sorumlu Ekle</h2>
      <form
        action={async (formData) => {
          await createTechnicalLead(formData);
          setOpen(false);
        }}
        className="space-y-4"
      >
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
          <input name="title" placeholder="ör. Solutions Engineer" className={`${inputClass} w-full`} />
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
