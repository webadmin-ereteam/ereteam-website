"use client";

import {
  updateJourneyStage,
  setJourneyStageActive,
  reorderJourneyStages,
  completeCurrentStage,
  reopenLastCompletedStage,
} from "@/lib/presales/adminActions";
import { findCurrentStage } from "@/lib/presales/stageProgress";
import { Badge, buttonPrimaryClass, buttonSecondaryClass, inputClass } from "../../../_components/ui";
import { SubmitButton } from "../../../_components/SubmitButton";
import { DragReorderList } from "../../../_components/DragReorderList";

type JourneyStage = {
  id: string;
  name: string;
  customerDescription: string | null;
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
    <DragReorderList
      items={stages}
      onReorder={(orderedIds) => reorderJourneyStages(journeyId, orderedIds)}
      renderItem={(stage) => {
        const isCompleted = stage.status === "completed";
        const isCurrent = stage.id === current?.id;
        const isUpcoming = stage.isActive && !isCompleted && !isCurrent;
        const pendingSurveyCount = stage.surveyInstances.filter((s) => s.status === "sent").length;

        return (
          <div
            className={`space-y-3 rounded-xl border bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-opacity ${
              isCurrent ? "border-brand-primary/25 ring-1 ring-brand-primary/10" : "border-gray-200/70"
            } ${isUpcoming ? "opacity-60" : ""}`}
          >
            <form action={updateJourneyStage} className="space-y-2">
              <input type="hidden" name="id" value={stage.id} />
              <input type="hidden" name="journeyId" value={journeyId} />
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-0.5 block text-[10px] text-text-muted">Aşama Adı</label>
                  <input name="name" defaultValue={stage.name} className={`${inputClass} w-full bg-white font-medium`} />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] text-text-muted">Süre (gün)</label>
                  <input
                    name="estimatedDays"
                    type="number"
                    min={0}
                    defaultValue={stage.estimatedDays ?? ""}
                    className={`${inputClass} w-20 bg-white`}
                  />
                </div>
                {isCompleted && <Badge color="green">Tamamlandı</Badge>}
                {isCurrent && <Badge color="blue">Şu anda burada (müşteride)</Badge>}
                {!stage.isActive && <Badge color="gray">gizli</Badge>}
              </div>
              <textarea
                name="customerDescription"
                defaultValue={stage.customerDescription ?? ""}
                placeholder="Müşteriye görünen açıklama"
                rows={2}
                className={`${inputClass} w-full bg-white`}
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-text-muted">
                    <input type="checkbox" name="customerVisible" defaultChecked={stage.customerVisible} />
                    Müşteriye göster
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-text-muted">
                    <input type="checkbox" name="surveysEnabled" defaultChecked={stage.surveysEnabled} />
                    Anket gönderilsin
                  </label>
                </div>
                <SubmitButton className={buttonSecondaryClass}>Kaydet</SubmitButton>
              </div>
            </form>
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-2">
              {isCurrent && pendingSurveyCount === 0 && (
                <form action={completeCurrentStage.bind(null, journeyId)}>
                  <SubmitButton className={buttonPrimaryClass} pendingLabel="İşleniyor...">
                    Tamamla ve sıradakine geç
                  </SubmitButton>
                </form>
              )}
              {isCurrent && pendingSurveyCount > 0 && (
                <span className="text-xs text-amber-600">
                  Müşteride {pendingSurveyCount} tamamlanmamış anket var — bu aşama ancak o(nlar)
                  cevaplanınca ilerleyebilir.
                </span>
              )}
              {isCompleted && stage.id === reopenableStageId && (
                <form action={reopenLastCompletedStage.bind(null, journeyId)}>
                  <SubmitButton className={buttonSecondaryClass} pendingLabel="Geri alınıyor...">
                    Geri al
                  </SubmitButton>
                </form>
              )}
              {!isCompleted && (
                <form action={setJourneyStageActive.bind(null, stage.id, journeyId, !stage.isActive)}>
                  <SubmitButton className={buttonSecondaryClass}>
                    {stage.isActive ? "Bu case'te gizle" : "Göster"}
                  </SubmitButton>
                </form>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}
