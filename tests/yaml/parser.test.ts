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

import { after, before, describe, it } from "jsr:@std/testing/bdd";
import { retrievePricingFromYaml } from "../../src/utils/yaml-utils.ts";
import { Pricing } from "../../src/models/pricing.ts";
import { assert, assertEquals, assertIsError } from "@std/assert";
import { LATEST_PRICING2YAML_VERSION } from "../../src/utils/version-manager.ts";
import * as csv from "@std/csv";

const POSITIVE_TESTS_CSV_PATH = "tests/yaml/data/positive-parsing-tests.csv";
const NEGATIVE_TESTS_CSV_PATH = "tests/yaml/data/negative-parsing-tests.csv";
const TEMP_FILE_PATH = "tests/resources/temp/test_";

interface Test{
    testName: string,
    pricingPath: string,
    expected: string
}

interface TestSection{
    sectionName: string,
    tests: Test[]
}

function readCSVFile(filePath: string): string[][] {
    
    const absolutePath: string = Deno.realPathSync(filePath);
    const csvContent = Deno.readTextFileSync(absolutePath);
    const content: string[][] = csv.parse(csvContent.split('\n').slice(1).join('\n'));

    return content;

}

function parseCSVContent(content: string[][]): TestSection[] {
    const result: TestSection[] = [];
    let i = -1; // In order to match the index 0 once the first test section is added
    for (const entry of content) {
        if (entry[1] === "-") {
            result.push({
                sectionName: entry[0],
                tests: []
            });
            i++;
            continue;
        }

        result[i].tests.push({
            testName: entry[0],
            pricingPath: entry[1],
            expected: entry[2]
        });
    }

    return result;
}

const positiveTestsParameters = parseCSVContent(readCSVFile(POSITIVE_TESTS_CSV_PATH));
const negativeTestsParameters = parseCSVContent(readCSVFile(NEGATIVE_TESTS_CSV_PATH));

describe("Positive Pricing2Yaml Parser Tests", () => {
    for (const {sectionName, tests} of positiveTestsParameters){
        describe(sectionName, () => {
            for (const {pricingPath, expected} of tests) {

                const tempPricingPath = TEMP_FILE_PATH + pricingPath.split("/").pop();

                before(() => {
                    // Create a temp file from the TEST_PRICING_YAML_PATH file
                    Deno.copyFileSync(pricingPath, tempPricingPath);
                });
            
                it(`${expected} parsing`, () => {
                    const pricing: Pricing = retrievePricingFromYaml(tempPricingPath);
    
                    assertEquals(pricing.saasName, expected);
                    assertEquals(pricing.version, LATEST_PRICING2YAML_VERSION);
                    assert(pricing.createdAt instanceof Date);
                });
        
                after(() => {
                    // Remove the modified temp file
                    Deno.removeSync(tempPricingPath);
                });
            }}
        );
    }
});

describe("Negative Pricing2Yaml Parser Tests", () => {
    for (const {sectionName, tests} of negativeTestsParameters) {
        describe(sectionName, () => {
            for (const {testName, pricingPath, expected} of tests) {

                const tempPricingPath = TEMP_FILE_PATH + pricingPath.split("/").pop();

                before(() => {
                    // Create a temp file from the TEST_PRICING_YAML_PATH file
                    Deno.copyFileSync(pricingPath, tempPricingPath);
                });
            
                it(`${testName}`, () => {
                    try {
                        const _pricing: Pricing = retrievePricingFromYaml(tempPricingPath);
                        assert(false, "Expected an error to be thrown");
                    } catch (error) {
                        assertIsError(error);
                        assertEquals(error.message, expected);
                    }
                });
    
                after(() => {
                    // Remove the modified temp file
                    Deno.removeSync(tempPricingPath);
                });
            }
        });
    }
});
