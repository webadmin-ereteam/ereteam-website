-- Journey.name: fixed "Firma - Ürün - Tarih" string set once at creation,
-- kept identical to the Drive folder name created for the journey at that
-- same moment (see lib/presales/drive.ts and createProspectAndJourney).
ALTER TABLE "Journey" ADD COLUMN "name" TEXT;

UPDATE "Journey" AS j
SET "name" = p."companyName" || ' - ' || COALESCE((SELECT name FROM "Product" WHERE id = j."productId"), 'Ürün atanmadı') || ' - ' || to_char(j."createdAt", 'DD.MM.YYYY')
FROM "Prospect" p
WHERE j."prospectId" = p.id;

ALTER TABLE "Journey" ALTER COLUMN "name" SET NOT NULL;
