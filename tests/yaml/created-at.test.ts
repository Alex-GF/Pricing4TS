import assert from "assert";
import fs from "fs";
import os from "os";
import path from "path";
import { retrievePricingFromText, writePricingToYaml } from "../../src/server/utils/yaml-utils";

const pricingWith = (createdAt: string, version?: string) => `saasName: Demo
syntaxVersion: "3.1"
${version ? `version: "${version}"\n` : ""}createdAt: ${createdAt}
currency: USD
features:
  basic:
    valueType: BOOLEAN
    defaultValue: true
    type: DOMAIN
plans:
  free:
    price: 0
    features: null
    usageLimits: null
`;

describe("createdAt accepts a date or an ISO 8601 date-time", () => {
  it("reads yyyy-mm-dd as UTC midnight", () => {
    const pricing = retrievePricingFromText(pricingWith('"2025-05-25"'));
    assert.strictEqual(pricing.createdAt.toISOString(), "2025-05-25T00:00:00.000Z");
  });

  it("reads a UTC date-time keeping its time of day", () => {
    const pricing = retrievePricingFromText(pricingWith('"2025-05-25T14:30:15.250Z"'));
    assert.strictEqual(pricing.createdAt.toISOString(), "2025-05-25T14:30:15.250Z");
  });

  it("reads an unquoted YAML timestamp", () => {
    const pricing = retrievePricingFromText(pricingWith("2025-05-25T14:30:00Z"));
    assert.strictEqual(pricing.createdAt.toISOString(), "2025-05-25T14:30:00.000Z");
  });

  it("normalizes an explicit offset to the instant it denotes", () => {
    const pricing = retrievePricingFromText(pricingWith('"2025-05-25T16:30:00+02:00"'));
    assert.strictEqual(pricing.createdAt.toISOString(), "2025-05-25T14:30:00.000Z");
  });

  it("rejects a date-time without a time zone, since it would depend on the reader", () => {
    assert.throws(() => retrievePricingFromText(pricingWith('"2025-05-25T14:30:00"')), /createdAt/);
  });

  it("rejects text that is not a date", () => {
    assert.throws(() => retrievePricingFromText(pricingWith('"yesterday"')), /createdAt/);
  });

  it("rejects an impossible date-time", () => {
    assert.throws(() => retrievePricingFromText(pricingWith('"2025-13-45T99:99:00Z"')), /createdAt/);
  });

  it("rejects a future date-time", () => {
    const future = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    assert.throws(() => retrievePricingFromText(pricingWith(`"${future}"`)), /future/);
  });

  it("derives the default version from the UTC day, whatever the local time zone", () => {
    const pricing = retrievePricingFromText(pricingWith('"2025-05-25T23:30:00Z"'));
    assert.strictEqual(pricing.version, "2025-5-25");
  });
});

describe("createdAt serialization", () => {
  const roundTrip = (createdAt: string) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "created-at-"));
    const file = path.join(dir, "pricing.yaml");
    fs.writeFileSync(file, "");
    try {
      writePricingToYaml(retrievePricingFromText(pricingWith(createdAt, "1.0.0")), file);
      return fs.readFileSync(file, "utf8");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  };

  it("keeps writing a plain date when the instant is exactly UTC midnight", () => {
    assert.match(roundTrip('"2025-05-25"'), /^createdAt: ['"]?2025-05-25['"]?$/m);
  });

  it("writes the full UTC date-time when there is a time of day", () => {
    assert.match(roundTrip('"2025-05-25T16:30:00+02:00"'), /^createdAt: ['"]?2025-05-25T14:30:00\.000Z['"]?$/m);
  });
});
