import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const m = vi.hoisted(() => ({ auth: vi.fn(), refresh: vi.fn() }));
vi.mock("@/lib/presales/session", () => ({ verifySessionToken: m.auth }));
vi.mock("@/lib/spark/cache", () => ({ refreshSparkData: m.refresh }));
import { POST } from "@/app/api/spark/refresh/route";
const request = () => new NextRequest("https://example.test/api/spark/refresh", { method: "POST", headers: { cookie: "spark_session=test" } });
const result = { data: { generatedAt: "2026-11-12T13:00:00Z" }, sourceState: { hubspot: { ok: true } } };
beforeEach(() => { vi.resetAllMocks(); m.auth.mockResolvedValue(true); });
it("requires Spark authorization before collecting", async () => {
  m.auth.mockResolvedValue(false); expect((await POST(request())).status).toBe(401);
  expect(m.refresh).not.toHaveBeenCalled(); expect(m.auth).toHaveBeenCalledWith("test", "spark");
});
it("coalesces simultaneous requests and allows another refresh after completion", async () => {
  let resolve!: (value: typeof result) => void;
  m.refresh.mockImplementationOnce(() => new Promise(r => { resolve = r; })).mockResolvedValue(result);
  const first = POST(request()); const second = POST(request());
  await vi.waitFor(() => expect(m.refresh).toHaveBeenCalledTimes(1)); resolve(result);
  expect((await first).status).toBe(200); expect((await second).status).toBe(200);
  expect((await POST(request())).status).toBe(200); expect(m.refresh).toHaveBeenCalledTimes(2);
});
it("clears in-flight state after a failure so the next request can retry", async () => {
  m.refresh.mockRejectedValueOnce(new Error("source failed")).mockResolvedValueOnce(result);
  const failed = await POST(request()); expect(failed.status).toBe(503); expect((await failed.json()).error).toBe("source failed");
  expect((await POST(request())).status).toBe(200); expect(m.refresh).toHaveBeenCalledTimes(2);
});
