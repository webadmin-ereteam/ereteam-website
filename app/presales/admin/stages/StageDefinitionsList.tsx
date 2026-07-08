"use client";

import { upsertStageDefinition, setStageActive, reorderStageDefinitions } from "@/lib/presales/adminActions";
import { Badge, Card, inputClass, buttonPrimaryClass, buttonSecondaryClass } from "../../_components/ui";
import { SubmitButton } from "../../_components/SubmitButton";
import { DragReorderList } from "../../_components/DragReorderList";

type StageDefinition = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  customerDescription: string | null;
  customerWaitingMessage: string | null;
  customerVisible: boolean;
  surveysEnabled: boolean;
  estimatedDays: number | null;
  isActive: boolean;
};

export function StageDefinitionsList({
  stageTemplateId,
  stages,
}: {
  stageTemplateId: string;
  stages: StageDefinition[];
}) {
  return (
    <DragReorderList
      items={stages}
      onReorder={(orderedIds) => reorderStageDefinitions(stageTemplateId, orderedIds)}
      renderItem={(stage, index) => (
        <Card>
          <form action={upsertStageDefinition.bind(null, stageTemplateId)} className="space-y-3">
            <input type="hidden" name="id" value={stage.id} />
            <div className="flex items-end gap-3">
              <span className="mb-[3px] flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-semibold text-brand-primary">
                {index + 1}
              </span>
              <div className="flex-1">
                <label className="mb-0.5 block text-[10px] text-text-muted">Aşama Adı</label>
                <input name="name" defaultValue={stage.name} className={`${inputClass} w-full font-medium`} />
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] text-text-muted">Key</label>
                <input name="key" defaultValue={stage.key} className={`${inputClass} w-48 font-mono text-xs`} />
              </div>
              <div>
                <label className="mb-0.5 block text-[10px] text-text-muted">Süre (gün)</label>
                <input
                  name="estimatedDays"
                  defaultValue={stage.estimatedDays ?? ""}
                  type="number"
                  min={0}
                  className={`${inputClass} w-20`}
                />
              </div>
              {!stage.isActive && <Badge color="gray">pasif</Badge>}
            </div>
            <textarea
              name="description"
              defaultValue={stage.description ?? ""}
              placeholder="Dahili açıklama (sadece admin görür)"
              rows={2}
              className={`${inputClass} w-full`}
            />
            <textarea
              name="customerDescription"
              defaultValue={stage.customerDescription ?? ""}
              placeholder="Müşteriye görünen açıklama"
              rows={2}
              className={`${inputClass} w-full`}
            />
            <textarea
              name="customerWaitingMessage"
              defaultValue={stage.customerWaitingMessage ?? ""}
              placeholder='Aksiyon bizdeyken müşteriye gösterilecek mesaj (ör. "Ekibimiz sizin için özel bir demo hazırlıyor, toplantı planlaması için yakında iletişime geçeceğiz.")'
              rows={2}
              className={`${inputClass} w-full`}
            />
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-text-muted">
                  <input type="checkbox" name="customerVisible" defaultChecked={stage.customerVisible} />
                  Müşteriye göster
                </label>
                <label className="flex items-center gap-2 text-sm text-text-muted">
                  <input type="checkbox" name="surveysEnabled" defaultChecked={stage.surveysEnabled} />
                  Anket gönderilsin
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  formAction={setStageActive.bind(null, stage.id, stageTemplateId, !stage.isActive)}
                  className={buttonSecondaryClass}
                >
                  {stage.isActive ? "Pasifleştir" : "Aktifleştir"}
                </button>
                <SubmitButton className={buttonPrimaryClass}>Kaydet</SubmitButton>
              </div>
            </div>
          </form>
        </Card>
      )}
    />
  );
}
