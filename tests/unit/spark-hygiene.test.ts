import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), limit: vi.fn(), catalog: vi.fn(), objects: vi.fn(), read: vi.fn(), associations: vi.fn(), update: vi.fn(), link: vi.fn(),
}));
vi.mock("@/lib/presales/session", () => ({ verifySessionToken: mocks.auth }));
vi.mock("@/lib/rateLimit", () => ({ getClientIp: () => "test", rateLimit: mocks.limit }));
vi.mock("@/lib/spark/hubspot", () => ({
  fetchHubSpotPropertyCatalog: mocks.catalog, fetchHubSpotObjects: mocks.objects,
  fetchHubSpotObjectsByIds: mocks.read, fetchHubSpotAssociations: mocks.associations,
  updateHubSpotObjectPropertiesBatch: mocks.update, associateHubSpotInvoiceToDeal: mocks.link,
}));
import { GET, PATCH, POST } from "@/app/api/spark/hygiene/route";

const request = (method: string, body?: unknown, query = "") => new NextRequest(`https://example.test/api/spark/hygiene${query}`, {
  method, headers: { cookie: "spark_session=test", "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
const paid = { records: [{ objectType: "Invoice", id: "1" }], property: "hs_invoice_status", values: ["paid"] };

describe("Spark bidirectional hygiene contract", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.auth.mockResolvedValue(true);
    mocks.limit.mockResolvedValue({ allowed: true });
    mocks.catalog.mockResolvedValue([
      { name: "hs_invoice_status", options: [{ value: "paid" }, { value: "open" }] },
      { name: "country", options: [{ value: "USA" }, { value: "Turkiye" }, { value: "hidden", hidden: true }] },
      { name: "vendor_name", fieldType: "checkbox", options: [{ value: "IBM" }, { value: "Ereteam" }] },
    ]);
    mocks.read.mockImplementation(async (_type: string, ids: string[]) => ids.map(id => ({ id, properties: { hs_invoice_status: "paid", country: "USA", vendor_name: "IBM;Ereteam" } })));
    mocks.associations.mockResolvedValue(new Map());
    mocks.update.mockResolvedValue([]);
  });

  it.each([GET, PATCH, POST])("requires a Spark audience session before any access", async handler => {
    mocks.auth.mockResolvedValue(false);
    expect((await handler(request(handler === GET ? "GET" : handler === POST ? "POST" : "PATCH", handler === GET ? undefined : paid))).status).toBe(401);
    expect(mocks.auth).toHaveBeenCalledWith("test", "spark");
    expect(mocks.catalog).not.toHaveBeenCalled(); expect(mocks.update).not.toHaveBeenCalled(); expect(mocks.link).not.toHaveBeenCalled();
  });

  it("exposes only Paid and visible enum choices", async () => {
    const body = await (await GET(request("GET"))).json();
    expect(body.objects.Invoice.hs_invoice_status.options.map((o: { value: string }) => o.value)).toEqual(["paid"]);
    expect(body.objects.Deal.country.options.map((o: { value: string }) => o.value)).toEqual(["USA", "Turkiye"]);
  });

  it("confirms Paid by reading the invoice back before reporting success", async () => {
    expect((await PATCH(request("PATCH", paid))).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith("invoices", [{ id: "1", properties: { hs_invoice_status: "paid" } }]);
    expect(mocks.read).toHaveBeenCalledWith("invoices", ["1"], ["hs_invoice_status"]);
  });

  it.each([
    { ...paid, values: ["open"] }, { ...paid, records: [{ objectType: "Deal", id: "1" }] },
    { ...paid, property: "amount" }, { ...paid, values: ["paid", "open"] },
    { ...paid, records: Array.from({ length: 51 }, (_, i) => ({ objectType: "Invoice", id: String(i) })) },
    { ...paid, records: [{ objectType: "Invoice", id: "invalid" }] },
    { ...paid, property: "country", values: ["hidden"] }, { ...paid, property: "country", values: ["USA", "Turkiye"] },
  ])("rejects invalid or out-of-scope changes before writing", async body => {
    expect((await PATCH(request("PATCH", body))).status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("does not claim success when HubSpot returns an unchanged or missing invoice", async () => {
    mocks.read.mockResolvedValue([{ id: "1", properties: { hs_invoice_status: "open" } }]);
    expect((await PATCH(request("PATCH", paid))).status).toBe(503);
    mocks.read.mockResolvedValue([]);
    expect((await PATCH(request("PATCH", paid))).status).toBe(503);
  });

  it("compares multi-select values as sets across mixed object updates", async () => {
    const body = { records: [{ objectType: "Deal", id: "1" }, { objectType: "Order", id: "2" }], property: "vendor_name", values: ["Ereteam", "IBM"] };
    expect((await PATCH(request("PATCH", body))).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledTimes(2);
    mocks.read.mockResolvedValue([{ id: "1", properties: { vendor_name: "IBM" } }]);
    expect((await PATCH(request("PATCH", body))).status).toBe(503);
  });

  it("validates every object catalog before the first mixed-object write", async () => {
    mocks.catalog.mockImplementation(async type => type === "orders" ? [] : [{ name: "country", options: [{ value: "USA" }] }]);
    expect((await PATCH(request("PATCH", { records: [{ objectType: "Deal", id: "1" }, { objectType: "Order", id: "2" }], property: "country", values: ["USA"] }))).status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("returns an explicit error when HubSpot refuses a write", async () => {
    mocks.update.mockRejectedValue(new Error("HubSpot: 403"));
    expect((await PATCH(request("PATCH", paid))).status).toBe(503);
    expect(mocks.read).not.toHaveBeenCalled();
  });

  it("checks both records and verifies an association after writing", async () => {
    mocks.associations.mockResolvedValueOnce(new Map()).mockResolvedValueOnce(new Map([["1", ["2"]]]));
    expect((await POST(request("POST", { invoiceId: "1", dealId: "2" }))).status).toBe(200);
    expect(mocks.link).toHaveBeenCalledWith("1", "2");
    expect(mocks.associations).toHaveBeenCalledTimes(2);
  });

  it("blocks already-associated and missing invoices", async () => {
    mocks.associations.mockResolvedValue(new Map([["1", ["3"]]]));
    expect((await POST(request("POST", { invoiceId: "1", dealId: "2" }))).status).toBe(409);
    mocks.read.mockResolvedValue([]);
    expect((await POST(request("POST", { invoiceId: "1", dealId: "2" }))).status).toBe(404);
    expect(mocks.link).not.toHaveBeenCalled();
  });

  it("does not claim an association succeeded without readback confirmation", async () => {
    expect((await POST(request("POST", { invoiceId: "1", dealId: "2" }))).status).toBe(503);
  });

  it("fails closed when distributed rate limiting is unavailable", async () => {
    mocks.limit.mockResolvedValue({ allowed: false, unavailable: true, retryAfterSeconds: 60 });
    expect((await PATCH(request("PATCH", paid))).status).toBe(503);
    expect(mocks.catalog).not.toHaveBeenCalled(); expect(mocks.update).not.toHaveBeenCalled();
  });
});
