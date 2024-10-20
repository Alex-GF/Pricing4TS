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
 * @requires @std/assert
 * @requires ../../src/utils/version-manager.ts
 * @requires @std/csv
 */

import { afterAll, before, beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { retrievePricingFromYaml } from "../../src/utils/yaml-utils.ts";
import { Pricing } from "../../src/models/pricing.ts";
import { assertEquals } from "@std/assert";
import { readCSVFile, parseCSVContent } from "../utils/csv-utils.ts";

const DEMO_SAAS_CSV_PATH = "tests/yaml/data/demo-parsing-tests.csv";
const TEMP_FILE_PATH = "tests/resources/temp/test_";
const TEMP_DIR = "tests/resources/temp/";

const demoSaaSParameters = parseCSVContent(readCSVFile(DEMO_SAAS_CSV_PATH));

describe("Demo SaaS Parsing Tests", () => {

    beforeAll(() => {
        Deno.mkdir(TEMP_DIR);
    })

    afterAll(() => {
        Deno.removeSync(TEMP_DIR, {recursive: true});
    })

    for (const {sectionName, tests} of demoSaaSParameters){
        describe(sectionName, () => {
            for (const {pricingPath, expected} of tests) {

                const tempPricingPath = TEMP_FILE_PATH + pricingPath.split("/").pop();

                before(() => {
                    // Create a temp file from the TEST_PRICING_YAML_PATH file
                    Deno.copyFileSync(pricingPath, tempPricingPath);
                });
            
                it(`${expected}`, () => {
                    const pricing: Pricing = retrievePricingFromYaml(tempPricingPath);
    
                    assertEquals(pricing.saasName, expected);
                });
            }}
        );
    }
});