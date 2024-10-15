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
 * - The main tests verify multiple aspects of the YAML parsing functionality.
 * 
 * @module tests/yaml/parser.test
 * @requires jsr:@std/testing/bdd
 * @requires ../../src/utils/yaml-utils.ts
 * @requires ../../src/models/pricing.d.ts
 * @requires @std/assert
 */

import { afterEach, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { retrievePricingFromYaml } from "../../src/utils/yaml-utils.ts";
import { Pricing } from "../../src/models/pricing.ts";
import { assert, assertEquals } from "@std/assert";
import { LATEST_PRICING2YAML_VERSION } from "../../src/utils/version-manager.ts";

const TEST_PRICING_YAML_PATH = "tests/resources/pricing/petclinic.yml";
const TEMP_FILE_PATH = "tests/resources/temp/test_pricing.yml";
const TEST_PRICING_NAME = "PetClinic";

beforeEach(() => {
    // Create a temp file from the TEST_PRICING_YAML_PATH file
    Deno.copyFileSync(TEST_PRICING_YAML_PATH, TEMP_FILE_PATH);
});

afterEach(() => {
    // Remove the modified temp file
    Deno.removeSync(TEMP_FILE_PATH);
});

describe("Yaml Parser Tests", () => {
    it("Pricing parsed correctly", () => {
        const pricing: Pricing = retrievePricingFromYaml(TEMP_FILE_PATH);
        
        assertEquals(pricing.saasName, TEST_PRICING_NAME);
        assertEquals(pricing.version, LATEST_PRICING2YAML_VERSION);
        assert(pricing.createdAt instanceof Date);
    });

    // Hay que meter tests negativos
});
