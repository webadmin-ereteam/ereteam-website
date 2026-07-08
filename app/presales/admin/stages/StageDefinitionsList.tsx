"use client";

import { Trash2 } from "lucide-react";
import {
  saveAllStageDefinitions,
  setStageActive,
  reorderStageDefinitions,
  deleteStageDefinition,
} from "@/lib/presales/adminActions";
import { Badge, Card, FieldLabel, inputClass, buttonPrimaryClass, buttonSecondaryClass } from "../../_components/ui";
import { SubmitButton } from "../../_components/SubmitButton";
import { DragReorderList } from "../../_components/DragReorderList";

type StageDefinition = {
  id: string;
  key: string;
  name: string;
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
    // Every stage card used to be its own <form> with its own "Kaydet" — editing
    // several stages meant clicking save once per card. Now the whole list is
    // one form (fields named stage_{index}_* — same convention as the survey
    // question editor) with a single save button at the bottom. Activate/
    // deactivate/delete stay instant, single-click actions via formAction on
    // their own buttons, same as before.
    <form action={saveAllStageDefinitions.bind(null, stageTemplateId)} className="space-y-3">
      <input type="hidden" name="stageCount" value={stages.length} />
      <DragReorderList
        items={stages}
        onReorder={(orderedIds) => reorderStageDefinitions(stageTemplateId, orderedIds)}
        renderItem={(stage, index) => (
          <Card className="space-y-4">
            <input type="hidden" name={`stage_${index}_id`} value={stage.id} />
            <div className="flex items-end gap-3">
              <span className="mb-[3px] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-semibold text-brand-primary">
                {index + 1}
              </span>
              <div className="flex-1">
                <FieldLabel>Aşama Adı</FieldLabel>
                <input
                  name={`stage_${index}_name`}
                  defaultValue={stage.name}
                  className={`${inputClass} w-full font-medium`}
                />
              </div>
              <div>
                <FieldLabel>Key</FieldLabel>
                <input
                  name={`stage_${index}_key`}
                  defaultValue={stage.key}
                  className={`${inputClass} w-48 font-mono text-xs`}
                />
              </div>
              <div>
                <FieldLabel>Süre (gün)</FieldLabel>
                <input
                  name={`stage_${index}_estimatedDays`}
                  defaultValue={stage.estimatedDays ?? ""}
                  type="number"
                  min={0}
                  className={`${inputClass} w-20`}
                />
              </div>
              {!stage.isActive && <Badge color="gray">pasif</Badge>}
            </div>

            <div className="space-y-3 rounded-xl bg-brand-primary/[0.03] p-4 ring-1 ring-inset ring-brand-primary/10">
              <p className="text-[10.5px] font-semibold uppercase tracking-wide text-brand-primary/80">
                Müşteri Sayfasında Görünenler
              </p>
              <div>
                <FieldLabel>Timeline altında gösterilen açıklama</FieldLabel>
                <textarea
                  name={`stage_${index}_customerDescription`}
                  defaultValue={stage.customerDescription ?? ""}
                  rows={2}
                  className={`${inputClass} w-full bg-white`}
                />
              </div>
              <div>
                <FieldLabel>Müşteri ekranında gösterilen ana mesaj</FieldLabel>
                <textarea
                  name={`stage_${index}_customerWaitingMessage`}
                  defaultValue={stage.customerWaitingMessage ?? ""}
                  placeholder='ör. "Bu aşamada sizden ihtiyacımız olan bilgileri aşağıdaki formdan iletebilirsiniz."'
                  rows={2}
                  className={`${inputClass} w-full bg-white`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3.5">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-text-muted">
                  <input
                    type="checkbox"
                    name={`stage_${index}_customerVisible`}
                    defaultChecked={stage.customerVisible}
                  />
                  Müşteriye göster
                </label>
                <label className="flex items-center gap-2 text-sm text-text-muted">
                  <input
                    type="checkbox"
                    name={`stage_${index}_surveysEnabled`}
                    defaultChecked={stage.surveysEnabled}
                  />
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
                <button
                  formAction={deleteStageDefinition.bind(null, stage.id, stageTemplateId)}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Aşamayı sil"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </Card>
        )}
      />
      <div className="sticky bottom-4 z-10 flex justify-end">
        <SubmitButton className={buttonPrimaryClass} pendingLabel="Kaydediliyor...">
          Tüm Değişiklikleri Kaydet
        </SubmitButton>
      </div>
    </form>
  );
}
