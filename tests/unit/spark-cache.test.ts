import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ query: vi.fn(), release: vi.fn(), tx: vi.fn(), read: vi.fn(), collect: vi.fn(), invalidate: vi.fn(), write: vi.fn() }));
vi.mock("@/lib/presales/db", () => ({ prisma: { $queryRaw: m.query, $executeRaw: m.release, $transaction: m.tx, sparkDashboardSnapshot: { findUnique: m.read } } }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: m.invalidate }));
vi.mock("@/lib/spark/collector", () => ({ collectSparkCurrentAndPlanning: m.collect }));
import { refreshSparkData } from "@/lib/spark/cache";
const current = { data: { reportDate: "2026-11-12", generatedAt: "2026-11-12T13:00:00Z" }, sourceState: {} };
const planning = { data: { reportDate: "2027-01-01", generatedAt: "2026-11-12T13:00:00Z" }, sourceState: {} };
beforeEach(() => {
  vi.resetAllMocks(); m.query.mockResolvedValue([{ id: "refresh-lease" }]);
  m.collect.mockResolvedValue({ current, planning }); m.read.mockResolvedValue({ payload: current });
  m.tx.mockImplementation(async fn => fn({ $queryRaw: vi.fn(), sparkDashboardSnapshot: { findUnique: vi.fn().mockResolvedValue(null), upsert: m.write } }));
});
it("does not collect when another instance owns the lease", async () => {
  m.query.mockResolvedValue([]); await expect(refreshSparkData()).rejects.toThrow(/zaten sürüyor/);
  expect(m.collect).not.toHaveBeenCalled(); expect(m.release).not.toHaveBeenCalled();
});
it("releases only the acquired lease token after a source failure", async () => {
  m.collect.mockRejectedValue(new Error("source unavailable"));
  await expect(refreshSparkData()).rejects.toThrow("source unavailable");
  expect(m.release).toHaveBeenCalledTimes(1);
  const [sql, token] = m.release.mock.calls[0]; expect(sql.join("?")).toContain('"payload"->>\'token\''); expect(token).toEqual(expect.any(String));
  expect(m.write).not.toHaveBeenCalled();
});
it("atomically writes only current and next year and releases the lease", async () => {
  await expect(refreshSparkData()).resolves.toEqual(current);
  expect(m.write.mock.calls.map(call => call[0].where.id)).toEqual(["current", "year:2026", "year:2027"]);
  expect(m.invalidate).toHaveBeenCalled(); expect(m.release).toHaveBeenCalledTimes(1);
});
it("also releases the lease after a snapshot transaction fails", async () => {
  m.tx.mockRejectedValue(new Error("transaction failed")); await expect(refreshSparkData()).rejects.toThrow("transaction failed");
  expect(m.release).toHaveBeenCalledTimes(1); expect(m.invalidate).not.toHaveBeenCalled();
});
