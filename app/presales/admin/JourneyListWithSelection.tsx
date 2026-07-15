"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, Copy, ExternalLink, FileCheck2, FileSignature, Link2, Package, UserRound, Zap } from "lucide-react";
import {
  bulkAssignSalesRep,
  bulkSetJourneyArchived,
  bulkSetJourneyLinkDisabled,
  bulkSetJourneyStatus,
} from "@/lib/presales/adminActions";
import { JOURNEY_STATUSES, JOURNEY_STATUS_LABELS } from "@/lib/presales/journeyStatus";
import { Card, buttonSecondaryClass, inputClass } from "../_components/ui";

// A status dot + label reads lighter than a filled pill for something that
// shows on every single card — the pill treatment stays for the rarer,
// more attention-worthy flags below (mini-chips).
const STATUS_DOT: Record<string, string> = {
  active: "bg-brand-primary",
  won: "bg-emerald-500",
  lost: "bg-gray-300",
  paused: "bg-amber-400",
};

const MINI_CHIP_COLORS: Record<string, string> = {
  amber: "bg-amber-500/[0.08] text-amber-700 ring-1 ring-inset ring-amber-500/20",
  pink: "bg-brand-magenta/[0.07] text-brand-magenta ring-1 ring-inset ring-brand-magenta/15",
};

function MiniChip({
  color,
  icon: Icon,
  children,
}: {
  color: keyof typeof MINI_CHIP_COLORS;
  icon: typeof Zap;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${MINI_CHIP_COLORS[color]}`}
    >
      <Icon size={10} />
      {children}
    </span>
  );
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export type JourneyRow = {
  id: string;
  name: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  status: string;
  archived: boolean;
  linkActive: boolean;
  accessToken: string;
  salesRepName: string | null;
  productName: string | null;
  createdAtLabel: string;
  closeDateLabel: string;
  currentStageName: string | null;
  pendingSurveys: number;
  ourTurnSurveys: number;
  proposalRequested: boolean;
};

export function JourneyListWithSelection({
  journeys,
  salesReps,
}: {
  journeys: JourneyRow[];
  salesReps: { id: string; name: string }[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("active");
  const [bulkSalesRepId, setBulkSalesRepId] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function copyCustomerLink(journeyId: string, accessToken: string) {
    const url = `${window.location.origin}/presales/j/${accessToken}`;
    navigator.clipboard.writeText(url);
    setCopiedId(journeyId);
    setTimeout(() => setCopiedId((current) => (current === journeyId ? null : current)), 1500);
  }

  const selectedIds = Array.from(selected);
  const allSelected = journeys.length > 0 && selected.size === journeys.length;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(journeys.map((j) => j.id)));
  }

  function runBulkAction(action: () => Promise<void>, confirmationLabel: string) {
    startTransition(async () => {
      await action();
      router.refresh();
      setConfirmation(confirmationLabel);
      setTimeout(() => setConfirmation((current) => (current === confirmationLabel ? null : current)), 2500);
    });
  }

  return (
    <div className="space-y-3">
      {journeys.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} />
          {selected.size > 0 ? `${selected.size} seçili` : "Tümünü seç"}
        </div>
      )}

      {selected.size > 0 && (
        <Card className="flex flex-wrap items-end gap-3 border-brand-primary/20 bg-brand-primary/[0.03]">
          <div>
            <label className="mb-1 block text-xs text-text-muted">Durumu değiştir</label>
            <div className="flex gap-2">
              <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className={`${inputClass} w-36`}>
                {JOURNEY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {JOURNEY_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  runBulkAction(
                    () => bulkSetJourneyStatus(selectedIds, bulkStatus),
                    `${selectedIds.length} journey'in durumu "${JOURNEY_STATUS_LABELS[bulkStatus] ?? bulkStatus}" olarak güncellendi`
                  )
                }
                className={buttonSecondaryClass}
              >
                Uygula
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-muted">Satışçı ata</label>
            <div className="flex gap-2">
              <select
                value={bulkSalesRepId}
                onChange={(e) => setBulkSalesRepId(e.target.value)}
                className={`${inputClass} w-44`}
              >
                <option value="">— Atanmadı —</option>
                {salesReps.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    {rep.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  const repName = salesReps.find((r) => r.id === bulkSalesRepId)?.name ?? "— Atanmadı —";
                  runBulkAction(
                    () => bulkAssignSalesRep(selectedIds, bulkSalesRepId || null),
                    `${selectedIds.length} journey'e satışçı olarak "${repName}" atandı`
                  );
                }}
                className={buttonSecondaryClass}
              >
                Uygula
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-muted">Müşteri linki</label>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  runBulkAction(
                    () => bulkSetJourneyLinkDisabled(selectedIds, false),
                    `${selectedIds.length} journey'in müşteri linki aktifleştirildi`
                  )
                }
                className={buttonSecondaryClass}
              >
                Aktifleştir
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  runBulkAction(
                    () => bulkSetJourneyLinkDisabled(selectedIds, true),
                    `${selectedIds.length} journey'in müşteri linki pasifleştirildi`
                  )
                }
                className={buttonSecondaryClass}
              >
                Pasifleştir
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-muted">Arşiv</label>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  runBulkAction(() => bulkSetJourneyArchived(selectedIds, true), `${selectedIds.length} journey arşivlendi`)
                }
                className={buttonSecondaryClass}
              >
                Arşivle
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  runBulkAction(
                    () => bulkSetJourneyArchived(selectedIds, false),
                    `${selectedIds.length} journey arşivden çıkarıldı`
                  )
                }
                className={buttonSecondaryClass}
              >
                Arşivden çıkar
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto self-center text-xs text-text-muted underline hover:text-brand-primary"
          >
            Seçimi temizle
          </button>

          {isPending && <p className="w-full text-xs text-text-muted">Uygulanıyor...</p>}
          {!isPending && confirmation && (
            <p className="flex w-full items-center gap-1.5 text-xs font-medium text-emerald-600">
              <Check size={13} /> {confirmation}
            </p>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {journeys.map((journey) => (
          <Link key={journey.id} href={`/presales/admin/journeys/${journey.id}`} className="block h-full">
            <div className="group relative flex h-full flex-col rounded-xl border border-gray-100 p-5 transition-colors hover:border-gray-200">
              <input
                type="checkbox"
                checked={selected.has(journey.id)}
                onClick={(e) => e.stopPropagation()}
                onChange={() => toggleOne(journey.id)}
                className="absolute right-4 top-4"
              />

              <div className="flex items-start gap-3 pr-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-semibold text-brand-primary">
                  {initials(journey.companyName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-dark">{journey.name}</p>
                  <p className="truncate text-xs text-text-muted">{journey.salesRepName ?? "Satışçı atanmadı"}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-text-body">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${journey.archived ? "bg-gray-300" : STATUS_DOT[journey.status] ?? "bg-gray-300"}`} />
                <span className="font-medium">{JOURNEY_STATUS_LABELS[journey.status] ?? journey.status}</span>
                {journey.archived && <span className="text-text-muted">· Arşivlendi</span>}
                <span className="truncate text-text-muted">· {journey.currentStageName ?? "—"}</span>
              </div>

              {(journey.proposalRequested || journey.pendingSurveys > 0 || journey.ourTurnSurveys > 0) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {journey.proposalRequested && (
                    <MiniChip color="pink" icon={FileSignature}>
                      Teklif talep edildi
                    </MiniChip>
                  )}
                  {journey.pendingSurveys > 0 && (
                    <MiniChip color="amber" icon={FileCheck2}>
                      {journey.pendingSurveys} müşteride
                    </MiniChip>
                  )}
                  {journey.ourTurnSurveys > 0 && (
                    <MiniChip color="pink" icon={Zap}>
                      {journey.ourTurnSurveys} aksiyon bizde
                    </MiniChip>
                  )}
                </div>
              )}

              <div className="mt-4 space-y-1.5 text-xs text-text-muted">
                <p className="flex items-center gap-1.5">
                  <UserRound size={12} className="shrink-0" />
                  <span className="truncate">{journey.contactName}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Package size={12} className="shrink-0" />
                  <span className="truncate">{journey.productName ?? "Ürün atanmadı"}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CalendarDays size={12} className="shrink-0" />
                  Açılış: {journey.createdAtLabel} · Kapanış: {journey.closeDateLabel}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between pt-4">
                <span
                  className={`flex items-center gap-1.5 text-xs ${journey.linkActive ? "text-emerald-600" : "text-gray-400"}`}
                >
                  <Link2 size={12} />
                  Müşteri Linki: {journey.linkActive ? "Aktif" : "Pasif"}
                </span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Linki kopyala"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      copyCustomerLink(journey.id, journey.accessToken);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-primary"
                  >
                    {copiedId === journey.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                  <button
                    type="button"
                    title="Müşteri sayfasını aç"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(`/presales/j/${journey.accessToken}`, "_blank", "noopener,noreferrer");
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-primary"
                  >
                    <ExternalLink size={14} />
                  </button>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
