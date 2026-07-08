"use client";

import { Trash2 } from "lucide-react";
import {
  saveAllJourneyStages,
  setJourneyStageActive,
  reorderJourneyStages,
  completeCurrentStage,
  reopenLastCompletedStage,
  deleteJourneyStage,
} from "@/lib/presales/adminActions";
import { findCurrentStage } from "@/lib/presales/stageProgress";
import { Badge, Card, FieldLabel, buttonPrimaryClass, buttonSecondaryClass, inputClass } from "../../../../_components/ui";
import { SubmitButton } from "../../../../_components/SubmitButton";
import { DragReorderList } from "../../../../_components/DragReorderList";

type JourneyStage = {
  id: string;
  name: string;
  customerDescription: string | null;
  customerWaitingMessage: string | null;
  customerVisible: boolean;
  surveysEnabled: boolean;
  estimatedDays: number | null;
  isActive: boolean;
  status: string;
  surveyInstances: { status: string }[];
};

export function JourneyStagesList({ journeyId, stages }: { journeyId: string; stages: JourneyStage[] }) {
  const activeStages = stages.filter((s) => s.isActive);
  const current = findCurrentStage(activeStages);
  const currentIndex = current ? activeStages.findIndex((s) => s.id === current.id) : activeStages.length;
  const previousStage = currentIndex > 0 ? activeStages[currentIndex - 1] : undefined;
  const reopenableStageId = previousStage?.status === "completed" ? previousStage.id : undefined;

  return (
    // One shared form (fields named stage_{index}_*, same convention as the
    // stage template editor) with a single save button at the bottom, instead
    // of a "Kaydet" per card. Complete/reopen/hide/delete stay instant,
    // single-click actions via formAction on their own buttons.
    <form action={saveAllJourneyStages.bind(null, journeyId)} className="space-y-3">
      <input type="hidden" name="stageCount" value={stages.length} />
      <DragReorderList
        items={stages}
        onReorder={(orderedIds) => reorderJourneyStages(journeyId, orderedIds)}
        renderItem={(stage, index) => {
          const isCompleted = stage.status === "completed";
          const isCurrent = stage.id === current?.id;
          const isUpcoming = stage.isActive && !isCompleted && !isCurrent;
          const pendingSurveyCount = stage.surveyInstances.filter((s) => s.status === "sent").length;

          return (
            <Card
              className={`space-y-4 transition-opacity ${
                isCurrent ? "ring-2 ring-brand-primary/20" : ""
              } ${isUpcoming ? "opacity-60" : ""}`}
            >
              <input type="hidden" name={`stage_${index}_id`} value={stage.id} />
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <FieldLabel>Aşama Adı</FieldLabel>
                  <input
                    name={`stage_${index}_name`}
                    defaultValue={stage.name}
                    className={`${inputClass} w-full font-medium`}
                  />
                </div>
                <div>
                  <FieldLabel>Süre (gün)</FieldLabel>
                  <input
                    name={`stage_${index}_estimatedDays`}
                    type="number"
                    min={0}
                    defaultValue={stage.estimatedDays ?? ""}
                    className={`${inputClass} w-20`}
                  />
                </div>
                {isCompleted && <Badge color="green">Tamamlandı</Badge>}
                {isCurrent && <Badge color="blue">Şu anda burada (müşteride)</Badge>}
                {!stage.isActive && <Badge color="gray">gizli</Badge>}
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

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs text-text-muted">
                  <input
                    type="checkbox"
                    name={`stage_${index}_customerVisible`}
                    defaultChecked={stage.customerVisible}
                  />
                  Müşteriye göster
                </label>
                <label className="flex items-center gap-1.5 text-xs text-text-muted">
                  <input
                    type="checkbox"
                    name={`stage_${index}_surveysEnabled`}
                    defaultChecked={stage.surveysEnabled}
                  />
                  Anket gönderilsin
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3.5">
                {isCurrent && pendingSurveyCount === 0 && (
                  <button formAction={completeCurrentStage.bind(null, journeyId)} className={buttonPrimaryClass}>
                    Tamamla ve sıradakine geç
                  </button>
                )}
                {isCurrent && pendingSurveyCount > 0 && (
                  <span className="text-xs text-amber-600">
                    Müşteride {pendingSurveyCount} tamamlanmamış anket var — bu aşama ancak o(nlar)
                    cevaplanınca ilerleyebilir.
                  </span>
                )}
                {isCompleted && stage.id === reopenableStageId && (
                  <button
                    formAction={reopenLastCompletedStage.bind(null, journeyId)}
                    className={buttonSecondaryClass}
                  >
                    Geri al
                  </button>
                )}
                {!isCompleted && (
                  <button
                    formAction={setJourneyStageActive.bind(null, stage.id, journeyId, !stage.isActive)}
                    className={buttonSecondaryClass}
                  >
                    {stage.isActive ? "Bu case'te gizle" : "Göster"}
                  </button>
                )}
                <button
                  formAction={deleteJourneyStage.bind(null, stage.id, journeyId)}
                  className="ml-auto flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Aşamayı sil"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </Card>
          );
        }}
      />
      <div className="sticky bottom-4 z-10 flex justify-end">
        <SubmitButton className={buttonPrimaryClass} pendingLabel="Kaydediliyor...">
          Tüm Değişiklikleri Kaydet
        </SubmitButton>
      </div>
    </form>
  );
}
