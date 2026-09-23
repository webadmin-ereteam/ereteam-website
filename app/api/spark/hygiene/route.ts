import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySessionToken } from "@/lib/presales/session";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { fetchHubSpotPropertyCatalog, updateHubSpotObjectPropertiesBatch } from "@/lib/spark/hubspot";

export const dynamic = "force-dynamic";

const SPARK_SESSION_COOKIE = "spark_session";
const objectTypes = {
  Deal: "deals",
  Invoice: "invoices",
  Order: "orders",
} as const;
const editableProperties = ["country", "vendor_name", "revenue_type", "ereteam_domain", "hs_invoice_status"] as const;
const updateSchema = z.object({
  records: z.array(z.object({
    objectType: z.enum(["Deal", "Invoice", "Order"]),
    id: z.string().regex(/^\d+$/).max(30),
  })).min(1).max(50),
  property: z.enum(editableProperties),
  values: z.array(z.string().trim().min(1).max(200)).min(1).max(20),
});

async function authorized(request: NextRequest) {
  return verifySessionToken(request.cookies.get(SPARK_SESSION_COOKIE)?.value);
}

function editableCatalog(catalog: Awaited<ReturnType<typeof fetchHubSpotPropertyCatalog>>) {
  return Object.fromEntries(editableProperties.map((name) => {
    const property = catalog.find((item) => item.name === name);
    return [name, {
      label: property?.label ?? name,
      multiple: property?.fieldType === "checkbox",
      options: property?.options
        ?.filter((option) => !option.hidden)
        .filter((option) => name !== "hs_invoice_status" || option.value === "paid")
        .map(({ label, value }) => ({ label, value })) ?? [],
    }];
  }));
}

export async function GET(request: NextRequest) {
  if (!(await authorized(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limit = rateLimit(`spark-hygiene-options:${getClientIp(request)}`, 20, 10 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Çok fazla istek." }, { status: 429 });

  try {
    const [deals, invoices, orders] = await Promise.all([
      fetchHubSpotPropertyCatalog("deals"),
      fetchHubSpotPropertyCatalog("invoices"),
      fetchHubSpotPropertyCatalog("orders"),
    ]);
    return NextResponse.json({
      objects: {
        Deal: editableCatalog(deals),
        Invoice: editableCatalog(invoices),
        Order: editableCatalog(orders),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "HubSpot seçenekleri okunamadı." },
      { status: 503 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await authorized(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limit = rateLimit(`spark-hygiene-write:${getClientIp(request)}`, 40, 10 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Çok fazla güncelleme isteği." }, { status: 429 });

  try {
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz güncelleme." }, { status: 400 });

    const uniqueObjectTypes = Array.from(new Set(parsed.data.records.map((record) => record.objectType)));
    if (parsed.data.property === "hs_invoice_status" && (uniqueObjectTypes.length !== 1 || uniqueObjectTypes[0] !== "Invoice" || parsed.data.values.length !== 1 || parsed.data.values[0] !== "paid")) {
      return NextResponse.json({ error: "Invoice status yalnız Invoice kayıtlarında Paid olarak güncellenebilir." }, { status: 400 });
    }
    const catalogs = new Map(await Promise.all(uniqueObjectTypes.map(async (objectType) => [
      objectType,
      await fetchHubSpotPropertyCatalog(objectTypes[objectType]),
    ] as const)));
    for (const objectType of uniqueObjectTypes) {
      const property = catalogs.get(objectType)?.find((item) => item.name === parsed.data.property);
      const allowedValues = new Set(property?.options?.filter((option) => !option.hidden).map((option) => option.value) ?? []);
      if (!property || !allowedValues.size || parsed.data.values.some((value) => !allowedValues.has(value))) {
        return NextResponse.json({ error: `${objectType} için seçilen değer HubSpot kataloğunda bulunamadı.` }, { status: 400 });
      }
      if (property.fieldType !== "checkbox" && parsed.data.values.length !== 1) {
        return NextResponse.json({ error: `${property.label} yalnız bir değer kabul eder.` }, { status: 400 });
      }
    }

    await Promise.all(uniqueObjectTypes.map((objectType) => {
      const property = catalogs.get(objectType)?.find((item) => item.name === parsed.data.property);
      const value = property?.fieldType === "checkbox" ? parsed.data.values.join(";") : parsed.data.values[0];
      return updateHubSpotObjectPropertiesBatch(
        objectTypes[objectType],
        parsed.data.records
          .filter((record) => record.objectType === objectType)
          .map((record) => ({ id: record.id, properties: { [parsed.data.property]: value } })),
      );
    }));
    return NextResponse.json({
      ok: true,
      property: parsed.data.property,
      values: parsed.data.values,
      updated: parsed.data.records,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "HubSpot kaydı güncellenemedi." },
      { status: 503 },
    );
  }
}
