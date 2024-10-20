/**
 * @file parser.test.ts
 * @description This file contains unit tests for the YAML parser utility functions.
 * It uses the BDD testing style provided by the `jsr:@std/testing/bdd` module.
 * The tests ensure that the YAML parsing functionality correctly interprets
 * and retrieves pricing information from a YAML file.
 *
 * The tests perform the following actions:
 * - Before each test, a temporary file is created from a predefined YAML file.
 * - After each test, the temporary file is removed to ensure a clean state.
 * - Positive tests verify that the YAML parsing correctly retrieves the expected pricing information.
 * - Negative tests verify that the YAML parsing throws the expected errors for invalid inputs.
 *
 * @module tests/yaml/parser.test
 * @requires jsr:@std/testing/bdd
 * @requires ../../src/utils/yaml-utils.ts
 * @requires ../../src/models/pricing.ts
 * @requires ../../src/utils/version-manager.ts
 * @requires @std/csv
 */

import {
  afterAll,
  before,
  beforeAll,
  describe,
  it,
} from "jsr:@std/testing/bdd";
import { retrievePricingFromYaml } from "../../src/utils/yaml-utils.ts";
import { Pricing } from "../../src/models/pricing.ts";
import assert from "assert";
import { LATEST_PRICING2YAML_VERSION } from "../../src/utils/version-manager.ts";
import {v4 as uuidv4 } from "uuid";

const DEMO_SAAS_PATH = "tests/resources/pricing/full/petclinic.yml";
const DEMO_SAAS_NAME = "PetClinic";
const suiteUUID = uuidv4();
const TEMP_FILE_PATH = `tests/resources/temp-${suiteUUID}/test_`;
const TEMP_DIR = `tests/resources/temp-${suiteUUID}/`;

describe("Demo SaaS Parsing Tests", () => {
  beforeAll(() => {
    Deno.mkdir(TEMP_DIR);
  });

  afterAll(() => {
    Deno.removeSync(TEMP_DIR, { recursive: true });
  });

  const tempPricingPath = TEMP_FILE_PATH + DEMO_SAAS_PATH.split("/").pop();

  before(() => {
    // Create a temp file from the TEST_PRICING_YAML_PATH file
    Deno.copyFileSync(DEMO_SAAS_PATH, tempPricingPath);
  });

  it(DEMO_SAAS_NAME, () => {
    const pricing: Pricing = retrievePricingFromYaml(tempPricingPath);

    assert.equal(pricing.saasName, DEMO_SAAS_NAME);
    // Asserts all global attributes exist
    assert(
      pricing.version === LATEST_PRICING2YAML_VERSION,
      "The pricing version must match the latest version"
    );
    assert(
      pricing.createdAt instanceof Date,
      "The pricing must have a non-empty Date 'createdAt' attribute"
    );
    assert(
      pricing.currency,
      "The pricing must have a non-empty string 'currency' attribute"
    );
    assert(
      typeof pricing.hasAnnualPayment === "boolean",
      "The pricing must have a boolean 'hasAnnualPayment' attribute"
    );
    // Asserts that at least one feature, usage limit, plan, and add-on exists in the pricing object
    assert(
      pricing.features.length > 0,
      "The pricing must contain at least one feature in order to test the functionality"
    );
    assert(
      pricing.usageLimits!.length > 0,
      "The pricing must contain at least one usage limit in order to test the functionality"
    );
    assert(
      pricing.plans.length > 0,
      "The pricing must contain at least one plan in order to test the functionality"
    );
    assert(
      pricing.addOns!.length > 0,
      "The pricing must contain at least one add-on in order to test the functionality"
    );
    // Assert that at least one addon depends on at least one other add-on
    assert(
      pricing.addOns!.some((a) => a.dependsOn!.length > 0),
      "At least one addon of the pricing must depend on another in order to test the functionality"
    );
    // Assert that all plans contains all features
    assert(
      pricing.plans.every(
        (p) => Object.keys(p.features).length === pricing.features.length
      ),
      "Not all plans contains all features"
    );
    // Assert that all plans contains all usage limits
    assert(
      pricing.plans.every(
        (p) =>
          Object.keys(p.usageLimits!).length === pricing.usageLimits!.length
      ),
      "Not all plans contains all usage limits"
    );
  });
});
