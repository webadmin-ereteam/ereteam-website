import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  associateHubSpotInvoiceToDeal, fetchHubSpotAssociations, fetchHubSpotObjects,
  fetchHubSpotObjectsByIds, fetchHubSpotOwners, fetchHubSpotPropertyCatalog,
  fetchHubSpotStages, updateHubSpotObjectProperties, updateHubSpotObjectPropertiesBatch,
} from "@/lib/spark/hubspot";

const fetchMock = vi.fn();
const reply = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const call = (index: number) => {
  const [url, init] = fetchMock.mock.calls[index] as [string, RequestInit];
  return { url: new URL(url), init, body: init.body ? JSON.parse(String(init.body)) : undefined };
};

describe("Spark date-based HubSpot transport", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("HUBSPOT_ACCESS_TOKEN", "test-service-key");
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it.each(["deals", "invoices", "orders", "companies"])("preserves properties and pagination for %s", async (type) => {
    fetchMock.mockResolvedValueOnce(reply({ results: [{ id: "1", properties: { amount: "12" } }], paging: { next: { after: "next+cursor" } } }))
      .mockResolvedValueOnce(reply({ results: [{ id: "2", properties: {} }] }));
    const rows = await fetchHubSpotObjects(type, ["amount", "country"]);
    expect(rows.map(row => row.id)).toEqual(["1", "2"]);
    expect(call(0).url.pathname).toBe(`/crm/objects/2026-09/${type === "deals" ? "0-3" : type}`);
    expect(call(0).url.searchParams.get("properties")).toBe("amount,country");
    expect(call(1).url.searchParams.get("after")).toBe("next+cursor");
    expect(call(1).init.headers).toMatchObject({ Authorization: "Bearer test-service-key" });
    expect(call(1).init.cache).toBe("no-store");
  });

  it("deduplicates and batches record reads at 100", async () => {
    fetchMock.mockImplementation(async () => reply({ results: [] }));
    const ids = Array.from({ length: 101 }, (_, i) => String(i + 1));
    await fetchHubSpotObjectsByIds("companies", [...ids, "1", ""], ["name"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(call(0).url.pathname).toBe("/crm/objects/2026-09/companies/batch/read");
    expect(call(0).init.method).toBe("POST");
    expect(call(0).body.inputs).toHaveLength(100);
    expect(call(1).body).toEqual({ properties: ["name"], inputs: [{ id: "101" }] });
  });

  it("preserves catalogs, pipeline state metadata, and owner pagination", async () => {
    const property = { name: "status", options: [{ value: "Cancelled", label: "Cancelled" }] };
    fetchMock.mockResolvedValueOnce(reply({ results: [property] }))
      .mockResolvedValueOnce(reply({ results: [{ label: "Sales", stages: [{ id: "won", label: "Won", displayOrder: 1, metadata: { isClosed: "true", probability: "1" } }] }] }))
      .mockResolvedValueOnce(reply({ results: [{ id: "1", firstName: "Test", lastName: "Owner" }], paging: { next: { after: "2" } } }))
      .mockResolvedValueOnce(reply({ results: [{ id: "2", email: "owner@example.test" }] }));
    expect(await fetchHubSpotPropertyCatalog("invoices")).toEqual([property]);
    expect(call(0).url.pathname).toBe("/crm/properties/2026-09/invoices");
    expect((await fetchHubSpotStages("deals")).get("won")).toMatchObject({ isClosed: true, probability: 1 });
    expect(call(1).url.pathname).toBe("/crm/pipelines/2026-09/deals");
    expect(await fetchHubSpotOwners()).toEqual(new Map([["1", "Test Owner"], ["2", "owner@example.test"]]));
    expect(call(2).url.pathname).toBe("/crm/owners/2026-09");
    expect(call(3).url.searchParams.get("after")).toBe("2");
    expect(call(3).url.searchParams.get("archived")).toBe("false");
  });

  it("keeps association read results and default association writes compatible", async () => {
    fetchMock.mockResolvedValueOnce(reply({ results: [{ from: { id: "11" }, to: [{ toObjectId: 22 }] }] }))
      .mockResolvedValueOnce(reply({ results: [] }));
    expect(await fetchHubSpotAssociations("invoices", ["11"])).toEqual(new Map([["11", ["22"]]]));
    expect(call(0).url.pathname).toBe("/crm/associations/2026-09/invoices/deals/batch/read");
    expect(call(0).body).toEqual({ inputs: [{ id: "11" }] });
    await associateHubSpotInvoiceToDeal("11", "22");
    expect(call(1).url.pathname).toBe("/crm/objects/2026-09/invoices/11/associations/default/deals/22");
    expect(call(1).init.method).toBe("PUT");
  });

  it("preserves PATCH payloads and ten-record invoice update batches", async () => {
    fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      return reply({ results: body.inputs ?? [] });
    });
    await updateHubSpotObjectProperties("deals", "11", { country: "USA" });
    expect(call(0).url.pathname).toBe("/crm/objects/2026-09/0-3/11");
    expect(call(0).init.method).toBe("PATCH");
    expect(call(0).body).toEqual({ properties: { country: "USA" } });
    const records = Array.from({ length: 11 }, (_, i) => ({ id: String(i), properties: { hs_invoice_status: "paid" } }));
    await updateHubSpotObjectPropertiesBatch("invoices", records);
    expect(call(1).url.pathname).toBe("/crm/objects/2026-09/invoices/batch/update");
    expect(call(1).body.inputs).toEqual(records.slice(0, 10));
    expect(call(2).body.inputs).toEqual(records.slice(10));
  });

  it("rejects partial batch writes even when HubSpot returns HTTP 207", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ results: [{ id: "1", properties: {} }], numErrors: 1, errors: [{ message: "failed" }] }), { status: 207 }));
    await expect(updateHubSpotObjectPropertiesBatch("invoices", [{ id: "1", properties: { hs_invoice_status: "paid" } }, { id: "2", properties: { hs_invoice_status: "paid" } }])).rejects.toThrow(/toplu işlemi/);
    fetchMock.mockResolvedValueOnce(reply({ results: [] }));
    await expect(updateHubSpotObjectPropertiesBatch("orders", [{ id: "1", properties: { country: "USA" } }])).rejects.toThrow(/tüm kayıtların/);
  });

  it("follows per-record association cursors and merges pages", async () => {
    fetchMock.mockResolvedValueOnce(reply({ results: [{ from: { id: "1" }, to: [{ toObjectId: 10 }], paging: { next: { after: "p2" } } }, { from: { id: "2" }, to: [] }] }))
      .mockResolvedValueOnce(reply({ results: [{ from: { id: "1" }, to: [{ toObjectId: 10 }, { toObjectId: 11 }] }] }));
    expect(await fetchHubSpotAssociations("invoices", ["1", "2"])).toEqual(new Map([["1", ["10", "11"]], ["2", []]]));
    expect(call(1).body).toEqual({ inputs: [{ id: "1", after: "p2" }] });
  });

  it("fails rather than looping forever on a repeated association cursor", async () => {
    fetchMock.mockImplementation(async () => reply({ results: [{ from: { id: "1" }, to: [], paging: { next: { after: "same" } } }] }));
    await expect(fetchHubSpotAssociations("orders", ["1"])).rejects.toThrow(/ilerlemiyor/);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("accepts an empty 204 response from an association write", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(associateHubSpotInvoiceToDeal("1", "2")).resolves.toBeUndefined();
  });

  it("surfaces authorization errors without falling back to legacy APIs", async () => {
    fetchMock.mockResolvedValue(new Response("Forbidden", { status: 403 }));
    await expect(fetchHubSpotObjects("invoices", [])).rejects.toThrow("403");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
