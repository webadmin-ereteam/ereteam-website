import assert from "node:assert/strict";
import {
  amplemarketOwnerEmail,
  amplemarketOwnerName,
  amplemarketSequenceKind,
} from "../lib/spark/amplemarketEvent";

const officialPayload = {
  user: { first_name: "Selda", last_name: "Kaygusuz", email: "SKAYGUSUZ@ERETEAM.COM" },
  sequence: { name: "Retail leaders" },
  sequenced_leads: { creation_method: "duo" },
};

assert.equal(amplemarketOwnerEmail(officialPayload), "skaygusuz@ereteam.com");
assert.equal(amplemarketOwnerName(officialPayload), "Selda Kaygusuz");
assert.equal(amplemarketSequenceKind(officialPayload, "Retail leaders"), "duo");
assert.equal(amplemarketSequenceKind({ creation_method: "manual" }), "bulk");
assert.equal(amplemarketSequenceKind({ creation_method: "ai_assisted" }), "bulk");
assert.equal(amplemarketSequenceKind({}, "Duo outbound"), "duo");
assert.equal(amplemarketSequenceKind({}, "Ordinary sequence"), undefined);
assert.equal(amplemarketOwnerName({}, "kariturk@ereteam.com"), "Kerem Arıtürk");
assert.equal(amplemarketOwnerName({}, "ksimsek@ereteam.com"), "Kutlay Şimşek");
assert.equal(amplemarketOwnerName({}, "skaygusuz@ereteam.com"), "Selda Kaygusuz");
assert.equal(amplemarketOwnerName({}, "idonmez@ereteam.com"), "İlker Dönmez");

console.log("Spark Amplemarket tests passed: 11/11");
