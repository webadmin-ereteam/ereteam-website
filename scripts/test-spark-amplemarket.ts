import assert from "node:assert/strict";
import {
  amplemarketOwnerEmail,
  amplemarketOwnerName,
} from "../lib/spark/amplemarketEvent";

const officialPayload = {
  user: { first_name: "Selda", last_name: "Kaygusuz", email: "SKAYGUSUZ@ERETEAM.COM" },
};

assert.equal(amplemarketOwnerEmail(officialPayload), "skaygusuz@ereteam.com");
assert.equal(amplemarketOwnerName(officialPayload), "Selda Kaygusuz");
assert.equal(amplemarketOwnerName({}, "kariturk@ereteam.com"), "Kerem Arıtürk");
assert.equal(amplemarketOwnerName({}, "ksimsek@ereteam.com"), "Kutlay Şimşek");
assert.equal(amplemarketOwnerName({}, "skaygusuz@ereteam.com"), "Selda Kaygusuz");
assert.equal(amplemarketOwnerName({}, "idonmez@ereteam.com"), "İlker Dönmez");

console.log("Spark Amplemarket tests passed: 6/6");
