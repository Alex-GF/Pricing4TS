import { retrievePricingFromPath } from "../../src/utils/yaml-utils";
import { Pricing } from "../../src/models/pricing2yaml/pricing";
import assert from "assert";
import { LATEST_PRICING2YAML_VERSION } from "../../src/utils/version-manager";
import {v4 as uuidv4 } from "uuid";
import { parseCSVContent, readCSVFile } from "../utils/csv-utils";
import fs from "fs";

const POSITIVE_TESTS_CSV_PATH = "tests/yaml/data/positive-parsing-tests.csv";
const NEGATIVE_TESTS_CSV_PATH = "tests/yaml/data/negative-parsing-tests.csv";
const suiteUUID = uuidv4();
const TEMP_FILE_PATH = `tests/resources/temp-${suiteUUID}/test_`;
const TEMP_DIR = `tests/resources/temp-${suiteUUID}/`;

interface Test{
    testName: string,
    pricingPath: string,
    expected: string
}

interface TestSection{
    sectionName: string,
    tests: Test[]
}

const positiveTestsParameters = parseCSVContent(readCSVFile(POSITIVE_TESTS_CSV_PATH));
const negativeTestsParameters = parseCSVContent(readCSVFile(NEGATIVE_TESTS_CSV_PATH));

describe("Positive Pricing2Yaml Parser Tests", () => {

    beforeAll(() => {
        fs.mkdirSync(TEMP_DIR);
    })

    afterAll(() => {
        fs.rmdirSync(TEMP_DIR, {recursive: true});
    })

    for (const {sectionName, tests} of positiveTestsParameters){
        describe(sectionName, () => {
            for (const {pricingPath, expected} of tests) {

                const tempPricingPath = TEMP_FILE_PATH + pricingPath.split("/").pop();

                beforeEach(() => {
                    // Create a temp file from the TEST_PRICING_YAML_PATH file
                    fs.copyFileSync(pricingPath, tempPricingPath);
                });
            
                it(`${expected} parsing`, () => {
                    const pricing: Pricing = retrievePricingFromPath(tempPricingPath);
    
                    assert.equal(pricing.saasName, expected);
                    assert.equal(pricing.version, LATEST_PRICING2YAML_VERSION);
                    assert(pricing.createdAt instanceof Date);
                });
            }}
        );
    }
});

describe("Negative Pricing2Yaml Parser Tests", () => {

    beforeAll(() => {
        fs.mkdirSync(TEMP_DIR, {recursive: true});
    })

    afterAll(() => {
        fs.rmdirSync(TEMP_DIR, {recursive: true});
    })

    for (const {sectionName, tests} of negativeTestsParameters) {
        describe(sectionName, () => {
            for (const {testName, pricingPath, expected} of tests) {

                const tempPricingPath = TEMP_FILE_PATH + pricingPath.split("/").pop();

                beforeEach(() => {
                    // Create a temp file from the TEST_PRICING_YAML_PATH file
                    fs.copyFileSync(pricingPath, tempPricingPath);
                });
            
                it(`${testName}`, () => {
                    try {
                        const _pricing: Pricing = retrievePricingFromPath(tempPricingPath);
                        assert(false, "Expected an error to be thrown");
                    } catch (error) {
                        assert.equal((error as Error).message, expected);
                    }
                });
            }
        });
    }
});
