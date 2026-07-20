"use client";

import { useState } from "react";
import { updateTechnicalLead, setTechnicalLeadActive, deleteTechnicalLead } from "@/lib/presales/adminActions";
import { Badge, Card, inputClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from "../../_components/ui";
import { SubmitButton } from "../../_components/SubmitButton";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

type TechnicalLead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  title: string | null;
  isActive: boolean;
};

export function TechnicalLeadRow({ lead }: { lead: TechnicalLead }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <Card>
        <form
          action={async (formData) => {
            await updateTechnicalLead(lead.id, formData);
            setIsEditing(false);
          }}
          className="grid grid-cols-2 gap-3"
        >
          <div>
            <label className={labelClass}>Ad Soyad</label>
            <input name="name" required defaultValue={lead.name} className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className={labelClass}>E-posta</label>
            <input name="email" type="email" required defaultValue={lead.email} className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className={labelClass}>Telefon (opsiyonel)</label>
            <input name="phone" defaultValue={lead.phone ?? ""} className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className={labelClass}>Ünvan (opsiyonel)</label>
            <input name="title" defaultValue={lead.title ?? ""} className={`${inputClass} w-full`} />
          </div>
          <div className="col-span-2 flex gap-2">
            <SubmitButton className={buttonPrimaryClass} pendingLabel="Kaydediliyor...">
              Kaydet
            </SubmitButton>
            <button type="button" className={buttonSecondaryClass} onClick={() => setIsEditing(false)}>
              Vazgeç
            </button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-semibold text-brand-primary">
          {initials(lead.name)}
        </span>
        <div>
          <p className="font-medium text-brand-dark">
            {lead.name} {lead.title && <span className="text-sm font-normal text-text-muted">· {lead.title}</span>}
          </p>
          <p className="text-sm text-text-muted">
            {lead.email} {lead.phone && `· ${lead.phone}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!lead.isActive && <Badge color="gray">pasif</Badge>}
        <button className={buttonSecondaryClass} onClick={() => setIsEditing(true)}>
          Düzenle
        </button>
        <form action={setTechnicalLeadActive.bind(null, lead.id, !lead.isActive)}>
          <button className={buttonSecondaryClass}>{lead.isActive ? "Pasifleştir" : "Aktifleştir"}</button>
        </form>
        <form action={deleteTechnicalLead.bind(null, lead.id)}>
          <SubmitButton className={buttonSecondaryClass} pendingLabel="Siliniyor...">
            Sil
          </SubmitButton>
        </form>
      </div>
    </Card>
  );
}
